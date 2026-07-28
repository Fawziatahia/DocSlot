<?php

namespace App\Features\Notifications\Controllers;

use App\Features\Notifications\Repositories\NotificationRepository;
use App\Features\Notifications\Resources\NotificationResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly NotificationRepository $notificationRepository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = (int) $request->input('per_page', 15);
        $unreadOnly = $request->boolean('unread_only');

        $notifications = $this->notificationRepository->getUserNotifications(
            $user->id,
            $unreadOnly,
            $perPage,
        );

        return $this->paginated($notifications, NotificationResource::class);
    }

    public function show(int $id): JsonResponse
    {
        $notification = $this->notificationRepository->findOrFail($id);

        return $this->success(new NotificationResource($notification));
    }

    public function markAsRead(int $id): JsonResponse
    {
        $notification = $this->notificationRepository->findOrFail($id);

        if ($notification->user_id !== request()->user()->id) {
            return $this->error('Forbidden.', 403);
        }

        $this->notificationRepository->markAsRead($notification);

        return $this->success(
            new NotificationResource($notification->fresh()),
            'Notification marked as read.'
        );
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->notificationRepository->markAllAsRead($request->user()->id);

        return $this->success(null, 'All notifications marked as read.');
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->notificationRepository->unreadCount($request->user()->id);

        return $this->success(['count' => $count]);
    }
}
