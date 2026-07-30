<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $exempt = $request->is('api/auth/change-password', 'api/auth/logout', 'api/auth/me');

        if ($user && $user->must_change_password && ! $exempt) {
            return response()->json([
                'success' => false,
                'message' => 'You must change your password before continuing.',
            ], 403);
        }

        return $next($request);
    }
}
