<?php

namespace App\Http\Controllers;

use App\Events\BillUpdated;
use App\Models\BillRecord;
use App\Models\BillTemplate;
use App\Models\Debt;
use App\Services\BillService;
use App\Services\DebtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BillController extends Controller
{
    public function __construct(
        private BillService $billService,
        private DebtService $debtService,
    ) {}

    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'default_amount' => 'required|numeric|min:0.01',
            'assigned_to' => 'required|in:Abg,Ayg',
            'debt_id' => [
                'nullable',
                Rule::exists('debts', 'id')->where('family_id', $request->user()->family_id),
            ],
        ]);

        $validated['family_id'] = $request->user()->family_id;

        $this->billService->createTemplate($validated);

        return back();
    }

    public function togglePaid(Request $request, BillRecord $record)
    {
        $template = $record->template;
        abort_unless($template->family_id === $request->user()->family_id, 403);

        DB::transaction(function () use ($record, $template) {
            $wasPaid = $record->is_paid;
            $updated = $this->billService->togglePaid($record);

            // Auto debt offset: if template linked to debt
            $debt = $updated->template->debt;
            if ($debt) {
                if ($updated->is_paid && !$wasPaid) {
                    $this->debtService->recordPayment($debt, (float) $updated->actual_amount, $updated->id);
                } elseif (!$updated->is_paid && $wasPaid) {
                    $this->debtService->reversePayment($debt, $updated->id);
                }
            }

            // Broadcast to family for real-time sync
            BillUpdated::dispatch($template->family_id, 'toggle', [
                'record_id' => $updated->id,
                'is_paid' => $updated->is_paid,
                'title' => $template->title,
            ]);
        });

        return back();
    }

    public function updateTemplate(Request $request, BillTemplate $template)
    {
        abort_unless($template->family_id === $request->user()->family_id, 403);

        $validated = $request->validate([
            'title'          => 'sometimes|required|string|max:255',
            'default_amount' => 'sometimes|required|numeric|min:0.01',
            'category'       => 'sometimes|required|string|max:255',
            'assigned_to'    => 'sometimes|required|in:Abg,Ayg',
            'debt_id'        => ['sometimes', 'nullable', Rule::exists('debts', 'id')->where('family_id', $request->user()->family_id)],
        ]);

        $this->billService->updateTemplate($template, $validated);

        return back();
    }

    public function updateAmount(Request $request, BillRecord $record)
    {
        abort_unless($record->template->family_id === $request->user()->family_id, 403);

        $validated = $request->validate([
            'actual_amount' => 'required|numeric|min:0.01',
        ]);

        $record->update($validated);

        return back();
    }

    public function uploadReceipt(Request $request, BillRecord $record)
    {
        abort_unless($record->template->family_id === $request->user()->family_id, 403);

        $request->validate([
            'receipt' => 'required|image|max:5120', // 5MB max
        ]);

        // Delete old receipt if exists
        if ($record->receipt_path) {
            \Illuminate\Support\Facades\Storage::disk('local')->delete($record->receipt_path);
        }

        $path = $request->file('receipt')->store('receipts', 'local');
        $record->update(['receipt_path' => $path]);

        return back();
    }

    public function deleteReceipt(Request $request, BillRecord $record)
    {
        abort_unless($record->template->family_id === $request->user()->family_id, 403);

        if ($record->receipt_path) {
            \Illuminate\Support\Facades\Storage::disk('local')->delete($record->receipt_path);
            $record->update(['receipt_path' => null]);
        }

        return back();
    }

    public function viewReceipt(Request $request, BillRecord $record)
    {
        abort_unless($record->template->family_id === $request->user()->family_id, 403);
        abort_unless($record->receipt_path, 404);

        return \Illuminate\Support\Facades\Storage::disk('local')->response($record->receipt_path);
    }

    public function archiveTemplate(Request $request, BillTemplate $template)
    {
        abort_unless($template->family_id === $request->user()->family_id, 403);

        $template->update(['is_active' => false]);

        return back();
    }
}
