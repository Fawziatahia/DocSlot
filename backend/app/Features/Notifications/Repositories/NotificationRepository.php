<?php

namespace App\Features\Notifications\Repositories;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class NotificationRepository
{
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Notification::latest()->paginate($perPage);
    }

    public function findOrFail(int $id): Notification
    {
        return Notification::findOrFail($id);
    }

    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);
        return $model;
    }

    public function delete(Model $model): bool
    {
        return $model->delete();
    }

    public function getUserNotifications(int $userId, ?bool $unreadOnly = false, int $perPage = 15): LengthAwarePaginator
    {
        $query = Notification::where('user_id', $userId);

        if ($unreadOnly) {
            $query->where('is_read', false);
        }

        return $query->latest()->paginate($perPage);
    }

    public function markAsRead(Notification $notification): Notification
    {
        return $this->update($notification, [
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function markAllAsRead(int $userId): void
    {
        Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
    }

    public function unreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }
}
