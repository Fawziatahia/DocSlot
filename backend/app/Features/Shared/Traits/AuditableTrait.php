<?php

namespace App\Features\Shared\Traits;

use Illuminate\Support\Facades\Log;

trait AuditableTrait
{
    /**
     * Log an audit entry.
     *
     * TODO: Replace with database audit_logs table insert once migrations exist.
     */
    protected function audit(string $action, string $entityType, ?int $entityId, ?array $oldValues = null, ?array $newValues = null): void
    {
        $user = request()->user();

        $entry = [
            'user_id' => $user?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ];

        Log::info('AUDIT: ' . json_encode($entry));
    }
}
