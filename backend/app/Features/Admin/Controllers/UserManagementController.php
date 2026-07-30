<?php

namespace App\Features\Admin\Controllers;

use App\Features\Admin\Resources\UserListResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManagementController
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles');
        if ($q = $request->input('q')) {
            $query->where(function ($qry) use ($q) {
                $qry->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }
        if ($role = $request->input('role')) {
            $query->whereHas('roles', fn ($qry) => $qry->where('slug', $role));
        }
        $users = $query->latest()->paginate((int) $request->input('per_page', 15));
        return $this->paginated($users, UserListResource::class);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with('roles')->findOrFail($id);
        return $this->success(new UserListResource($user));
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        if (! $user->is_active) {
            $user->tokens()->delete();
        }

        return $this->success(new UserListResource($user->fresh()), 'User status updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        if ($user->hasRole('admin')) {
            return $this->error('Cannot delete admin users.', 403);
        }
        $user->delete();
        return $this->noContent();
    }
}
