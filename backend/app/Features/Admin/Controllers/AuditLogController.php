<?php

namespace App\Features\Admin\Controllers;

use App\Features\Admin\Resources\AuditLogResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController
{
    use ApiResponseTrait;

    /**
     * GET /api/audit-logs
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'entity_type' => ['nullable', 'string', 'max:100'],
            'entity_id' => ['nullable', 'integer'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = AuditLog::with('user')->latest();

        if (! empty($validated['entity_type'])) {
            $query->where('entity_type', $validated['entity_type']);
        }
        if (! empty($validated['entity_id'])) {
            $query->where('entity_id', $validated['entity_id']);
        }
        if (! empty($validated['from'])) {
            $query->whereDate('created_at', '>=', $validated['from']);
        }
        if (! empty($validated['to'])) {
            $query->whereDate('created_at', '<=', $validated['to']);
        }

        $logs = $query->paginate($validated['per_page'] ?? 15);

        return $this->paginated($logs, AuditLogResource::class);
    }

    /**
     * GET /api/audit-logs/{id}
     */
    public function show(int $id): JsonResponse
    {
        $log = AuditLog::with('user')->find($id);

        if (! $log) {
            return $this->error('Audit log not found.', 404);
        }

        return $this->success(new AuditLogResource($log));
    }
}
