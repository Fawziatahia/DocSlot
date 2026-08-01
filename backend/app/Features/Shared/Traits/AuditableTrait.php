<?php

namespace App\Features\Shared\Traits;

use App\Models\AuditLog;

trait AuditableTrait
{
    /**
     * Record an audit entry for an admin create/update/delete action.
     */
    protected function audit(string $action, string $entityType, ?int $entityId, ?array $oldValues = null, ?array $newValues = null): void
    {
        AuditLog::create([
            'user_id' => request()->user()?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
