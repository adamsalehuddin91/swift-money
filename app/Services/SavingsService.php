<?php

namespace App\Services;

use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use Illuminate\Support\Facades\DB;

class SavingsService
{
    public function getForFamily(int $familyId): array
    {
        return SavingsGoal::where('family_id', $familyId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($g) => [
                'id'         => $g->id,
                'title'      => $g->title,
                'emoji'      => $g->emoji,
                'target'     => (float) $g->target_amount,
                'saved'      => (float) $g->current_amount,
                'remaining'  => $g->remaining,
                'pct'        => $g->progress_percent,
                'deadline'   => $g->deadline?->toDateString(),
            ])
            ->toArray();
    }

    public function create(array $data): SavingsGoal
    {
        return SavingsGoal::create($data);
    }

    public function update(SavingsGoal $goal, array $data): SavingsGoal
    {
        $goal->update($data);
        return $goal->fresh();
    }

    public function destroy(SavingsGoal $goal): void
    {
        $goal->delete();
    }

    public function addContribution(SavingsGoal $goal, float $amount, ?string $note = null): SavingsContribution
    {
        return DB::transaction(function () use ($goal, $amount, $note) {
            $contribution = SavingsContribution::create([
                'savings_goal_id' => $goal->id,
                'amount'          => $amount,
                'note'            => $note,
                'contributed_at'  => now()->toDateString(),
            ]);

            $goal->increment('current_amount', $amount);

            return $contribution;
        });
    }

    public function getHistory(SavingsGoal $goal): array
    {
        return $goal->contributions()
            ->orderByDesc('contributed_at')
            ->get()
            ->map(fn ($c) => [
                'id'             => $c->id,
                'amount'         => (float) $c->amount,
                'note'           => $c->note,
                'contributed_at' => $c->contributed_at->toDateString(),
            ])
            ->toArray();
    }
}
