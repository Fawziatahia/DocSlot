<?php

namespace App\Features\Shared\Middlewares;

use Closure;
use Illuminate\Http\Request;

class ForceJsonResponseMiddleware
{
    public function handle(Request $request, Closure $next): mixed
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
