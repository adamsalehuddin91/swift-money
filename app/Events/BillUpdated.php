<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BillUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $familyId,
        public string $action,
        public array $data = [],
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("family.{$this->familyId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'bill.updated';
    }
}
