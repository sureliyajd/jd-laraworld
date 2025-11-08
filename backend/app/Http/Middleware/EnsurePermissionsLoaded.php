<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermissionsLoaded
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            $user = $request->user();
            
            // Ensure roles and permissions are loaded for permission checks
            if (!$user->relationLoaded('roles')) {
                $user->load('roles.permissions');
            }
            if (!$user->relationLoaded('permissions')) {
                $user->load('permissions');
            }
        }

        return $next($request);
    }
}

