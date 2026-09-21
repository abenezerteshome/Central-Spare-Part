<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        // Check if user has an active subscription
        if (!$user->hasActiveSubscription()) {
            return response()->json([
                'status' => false,
                'message' => 'Subscription required'
            ], 403);
        }

        return $next($request);
    }
}
