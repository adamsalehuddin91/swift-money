<?php

namespace App\Http\Controllers;

use App\Models\TaxReliefCategory;
use App\Models\TaxReliefItem;
use App\Services\ZakatService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ZakatController extends Controller
{
    public function __construct(private ZakatService $zakatService) {}

    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user->family_id, 403);

        return Inertia::render('Zakat', [
            'prefill' => $this->zakatService->prefill($user->family_id, $user->id),
        ]);
    }

    // Record paid zakat as a rebate item under the LHDN module (current YA).
    public function record(Request $request)
    {
        $user = $request->user();
        abort_unless($user->family_id, 403);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'kind'   => 'required|in:pendapatan,simpanan,gabungan',
        ]);

        $ya = (int) now()->format('Y');
        $category = TaxReliefCategory::where('ya', $ya)->where('code', 'zakat')->first();
        abort_unless($category, 422, 'Kategori zakat tiada untuk YA ' . $ya);

        TaxReliefItem::create([
            'family_id'              => $user->family_id,
            'user_id'                => $user->id,
            'ya'                     => $ya,
            'tax_relief_category_id' => $category->id,
            'title'                  => 'Zakat ' . $validated['kind'] . ' ' . $ya,
            'amount'                 => $validated['amount'],
            'date'                   => now()->toDateString(),
            'source'                 => 'zakat',
            'note'                   => 'Direkod dari Kalkulator Zakat',
        ]);

        return redirect()->route('tax.index')->with('flash', 'Zakat direkod sebagai rebat cukai.');
    }
}
