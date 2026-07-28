<?php

namespace App\Features\Notifications\Services;

use App\Features\Notifications\Repositories\NotificationRepository;
use App\Models\Notification;

class NotificationService
{
    public function __construct(
        private readonly NotificationRepository $notificationRepository,
    ) {}

    public function createNotification(int $userId, string $type, string $title, string $message, ?array $data = null): Notification
    {
        return $this->notificationRepository->create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }
}
