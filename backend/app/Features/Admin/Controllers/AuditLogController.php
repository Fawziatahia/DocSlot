<?php

namespace App\Features\Admin\Controllers;

use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController
{
    use ApiResponseTrait;

    /**
     * GET /api/audit-logs
     *
     * Returns paginated audit log entries.
     * TODO: Replace with real AuditLog model when migrations exist.
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

        // TODO: Query actual audit_logs table
        return $this->success([
            'data' => [],
            'meta' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $validated['per_page'] ?? 15,
                'total' => 0,
            ],
            'message' => 'Audit log viewing requires the audit_logs table migration.',
        ]);
    }

    /**
     * GET /api/audit-logs/{id}
     */
    public function show(int $id): JsonResponse
    {
        // TODO: Query actual audit_logs table
        return $this->error('Audit log not found.', 404);
    }
}
