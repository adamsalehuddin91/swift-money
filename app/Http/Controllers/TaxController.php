<?php

namespace App\Http\Controllers;

use App\Models\TaxReliefCategory;
use App\Models\TaxReliefItem;
use App\Services\TaxService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TaxController extends Controller
{
    public function __construct(private TaxService $taxService) {}

    // Resolve YA + scope (me|family) from the request.
    private function context(Request $request): array
    {
        $user     = $request->user();
        $familyId = $user->family_id;
        abort_unless($familyId, 403);

        $ya    = (int) $request->get('ya', $this->taxService->defaultYa());
        $scope = $request->get('scope', 'me') === 'family' ? 'family' : 'me';
        $userId = $scope === 'me' ? $user->id : null;

        return [$user, $familyId, $ya, $scope, $userId];
    }

    public function index(Request $request)
    {
        [$user, $familyId, $ya, $scope, $userId] = $this->context($request);

        return Inertia::render('Cukai', [
            'ya'         => $ya,
            'scope'      => $scope,
            'available_yas' => $this->taxService->availableYas(),
            'summary'    => $this->taxService->getSummary($familyId, $ya, $userId),
            'items'      => $this->taxService->getItems($familyId, $ya, $userId),
        ]);
    }

    public function storeItem(Request $request)
    {
        [$user, $familyId, , ,] = $this->context($request);

        $validated = $request->validate([
            'ya'                     => 'required|integer|min:2000|max:2100',
            'tax_relief_category_id' => 'required|exists:tax_relief_categories,id',
            'title'                  => 'required|string|max:255',
            'amount'                 => 'required|numeric|min:0',
            'date'                   => 'nullable|date',
            'note'                   => 'nullable|string|max:500',
            'receipt'                => 'nullable|image|max:5120', // 5MB
        ]);

        $item = TaxReliefItem::create([
            'ya'                     => $validated['ya'],
            'tax_relief_category_id' => $validated['tax_relief_category_id'],
            'title'                  => $validated['title'],
            'amount'                 => $validated['amount'],
            'date'                   => $validated['date'] ?? null,
            'note'                   => $validated['note'] ?? null,
            'family_id'              => $familyId,
            'user_id'                => $user->id,
            'source'                 => 'manual',
        ]);

        if ($request->hasFile('receipt')) {
            $item->update(['receipt_path' => $request->file('receipt')->store('tax-receipts', 'local')]);
        }

        return back();
    }

    public function updateItem(Request $request, TaxReliefItem $item)
    {
        abort_unless($item->family_id === $request->user()->family_id, 403);

        $validated = $request->validate([
            'tax_relief_category_id' => 'required|exists:tax_relief_categories,id',
            'title'                  => 'required|string|max:255',
            'amount'                 => 'required|numeric|min:0',
            'date'                   => 'nullable|date',
            'note'                   => 'nullable|string|max:500',
            'receipt'                => 'nullable|image|max:5120', // 5MB
        ]);

        $item->update([
            'tax_relief_category_id' => $validated['tax_relief_category_id'],
            'title'                  => $validated['title'],
            'amount'                 => $validated['amount'],
            'date'                   => $validated['date'] ?? null,
            'note'                   => $validated['note'] ?? null,
        ]);

        if ($request->hasFile('receipt')) {
            if ($item->receipt_path) {
                Storage::disk('local')->delete($item->receipt_path);
            }
            $item->update(['receipt_path' => $request->file('receipt')->store('tax-receipts', 'local')]);
        }

        return back();
    }

    public function destroyItem(Request $request, TaxReliefItem $item)
    {
        abort_unless($item->family_id === $request->user()->family_id, 403);

        if ($item->receipt_path) {
            Storage::disk('local')->delete($item->receipt_path);
        }
        $item->delete();

        return back();
    }

    public function uploadReceipt(Request $request, TaxReliefItem $item)
    {
        abort_unless($item->family_id === $request->user()->family_id, 403);

        $request->validate(['receipt' => 'required|image|max:5120']); // 5MB

        if ($item->receipt_path) {
            Storage::disk('local')->delete($item->receipt_path);
        }
        $path = $request->file('receipt')->store('tax-receipts', 'local');
        $item->update(['receipt_path' => $path]);

        return back();
    }

    public function viewReceipt(Request $request, TaxReliefItem $item)
    {
        abort_unless($item->family_id === $request->user()->family_id, 403);
        abort_unless($item->receipt_path, 404);

        return Storage::disk('local')->response($item->receipt_path);
    }

    public function deleteReceipt(Request $request, TaxReliefItem $item)
    {
        abort_unless($item->family_id === $request->user()->family_id, 403);

        if ($item->receipt_path) {
            Storage::disk('local')->delete($item->receipt_path);
            $item->update(['receipt_path' => null]);
        }

        return back();
    }

    // Admin: edit a category cap for a YA (rates change every Belanjawan).
    public function updateCategory(Request $request, TaxReliefCategory $category)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $validated = $request->validate([
            'cap_amount' => 'nullable|numeric|min:0',
            'active'     => 'boolean',
        ]);

        $category->update($validated);

        return back();
    }

    // Print / PDF e-Filing prep sheet.
    public function summary(Request $request)
    {
        [$user, $familyId, $ya, $scope, $userId] = $this->context($request);

        return Inertia::render('TaxSummary', [
            'ya'          => $ya,
            'scope'       => $scope,
            'summary'     => $this->taxService->getSummary($familyId, $ya, $userId),
            'items'       => $this->taxService->getItems($familyId, $ya, $userId),
            'family_name' => $user->family->name,
            'person'      => $scope === 'me' ? $user->name : 'Keluarga (semua)',
        ]);
    }
}
