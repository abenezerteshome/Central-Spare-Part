<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLogger
{
    /**
     * Record an activity in the audit_logs table.
     *
     * @param string $action (e.g. Create, Update, Delete, Login, Logout, Adjust)
     * @param string $module (e.g. Parts, Sales, Inventory, Expenses, Users, Auth, Brands, Categories, Agents)
     * @param string|null $description (Human-readable summary)
     * @param string|null $targetTable (e.g. parts, sales, users)
     * @param string|int|null $targetId
     * @param array|null $details (Structured metadata)
     * @param array|null $before (Snapshot before change)
     * @param array|null $after (Snapshot after change)
     * @param string|null $actorId (Explicit user ID, or defaults to Auth::id())
     * @return ActivityLog|null
     */
    public static function log(
        string $action,
        string $module,
        ?string $description = null,
        ?string $targetTable = null,
        $targetId = null,
        $details = null,
        $before = null,
        $after = null,
        $actorId = null
    ): ?ActivityLog {
        try {
            $user = Auth::user();
            $effectiveActorId = $actorId ?? ($user ? $user->id : null);

            $req = request();
            $ip = $req ? $req->ip() : null;
            $userAgent = $req ? substr((string)$req->userAgent(), 0, 500) : null;

            return ActivityLog::create([
                'actor_id' => $effectiveActorId,
                'action' => ucfirst($action),
                'module' => ucfirst($module),
                'target_table' => $targetTable,
                'target_id' => $targetId !== null ? (string)$targetId : null,
                'description' => $description,
                'details' => $details,
                'before' => $before,
                'after' => $after,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
            ]);
        } catch (\Throwable $e) {
            // Never break existing business logic
            Log::warning('ActivityLogger error: ' . $e->getMessage());
            return null;
        }
    }
}
