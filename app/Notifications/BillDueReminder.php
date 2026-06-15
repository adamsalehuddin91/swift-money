<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

// Web-push reminder that bills are due soon.
class BillDueReminder extends Notification
{
    public function __construct(
        public string $title,
        public string $body,
        public string $url = '/dashboard',
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, $notification): WebPushMessage
    {
        return (new WebPushMessage)
            ->title($this->title)
            ->icon('/pwa-192x192.png')
            ->badge('/pwa-192x192.png')
            ->body($this->body)
            ->data(['url' => $this->url])
            ->options(['TTL' => 86400]);
    }
}
