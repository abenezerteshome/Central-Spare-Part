<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActivityLogController extends Controller
{
    use ApiResponse;

    /**
     * Display a paginated listing of activity logs.
     */
    public function index(Request $request)
    {
        $query = ActivityLog::with(['actor:id,name,email,role'])
            ->latest('created_at');

        // Global Search
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%")
                  ->orWhere('target_table', 'like', "%{$search}%")
                  ->orWhere('target_id', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('actor', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by Module
        if ($request->filled('module') && $request->input('module') !== 'all') {
            $query->where('module', $request->input('module'));
        }

        // Filter by Action
        if ($request->filled('action') && $request->input('action') !== 'all') {
            $query->where('action', $request->input('action'));
        }

        // Filter by Actor (User)
        if ($request->filled('actor_id') && $request->input('actor_id') !== 'all') {
            $query->where('actor_id', $request->input('actor_id'));
        }

        // Date Range Filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $perPage = (int) $request->input('per_page', 20);
        $perPage = min(max($perPage, 5), 100);

        $logs = $query->paginate($perPage);

        return $this->success($logs, 'Activity logs retrieved successfully');
    }

    /**
     * Statistical breakdown of activities for admin metrics.
     */
    public function stats()
    {
        $total = ActivityLog::count();
        $today = ActivityLog::whereDate('created_at', now()->toDateString())->count();
        $thisWeek = ActivityLog::where('created_at', '>=', now()->subDays(7))->count();

        $actionBreakdown = ActivityLog::select('action', DB::raw('count(*) as count'))
            ->groupBy('action')
            ->orderByDesc('count')
            ->get();

        $moduleBreakdown = ActivityLog::select('module', DB::raw('count(*) as count'))
            ->groupBy('module')
            ->orderByDesc('count')
            ->get();

        $topActors = ActivityLog::select('actor_id', DB::raw('count(*) as count'))
            ->whereNotNull('actor_id')
            ->with(['actor:id,name,email,role'])
            ->groupBy('actor_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return $this->success([
            'total' => $total,
            'today' => $today,
            'this_week' => $thisWeek,
            'actions' => $actionBreakdown,
            'modules' => $moduleBreakdown,
            'top_actors' => $topActors,
        ], 'Activity statistics retrieved');
    }

    /**
     * Display a specific activity log.
     */
    public function show($id)
    {
        $log = ActivityLog::with(['actor:id,name,email,role'])
            ->findOrFail($id);

        return $this->success($log);
    }
}
