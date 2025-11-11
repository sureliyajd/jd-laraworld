<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class HorizonAuth
{
    /**
     * Handle an incoming request.
     * 
     * This middleware allows Horizon to be accessed via Bearer token authentication.
     * It checks for a Bearer token in the Authorization header or query parameter,
     * validates it using Passport, and creates a session for the authenticated user
     * so Horizon can work properly with session-based authentication.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is already authenticated via session
        if (Auth::guard('web')->check()) {
            return $next($request);
        }

        // Check for Bearer token in Authorization header
        $token = $request->bearerToken();
        
        // Also check for token in query parameter (for iframe embedding)
        if (!$token && $request->has('token')) {
            $token = $request->query('token');
            // Set the Authorization header so Passport can validate it
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        if ($token) {
            // Validate the token and authenticate the user
            try {
                // Set the Authorization header so it can be used by other middleware if needed
                $request->headers->set('Authorization', 'Bearer ' . $token);
                
                // Passport stores personal access tokens as SHA-256 hashed values in the database
                // Hash the token to match how it's stored
                $hashedToken = hash('sha256', $token);
                
                // Query the oauth_access_tokens table to find a valid token
                // Check both hashed and plain text (for compatibility)
                $accessToken = DB::table('oauth_access_tokens')
                    ->where(function ($query) use ($token, $hashedToken) {
                        $query->where('id', $token)
                              ->orWhere('id', $hashedToken);
                    })
                    ->where('revoked', false)
                    ->where(function ($query) {
                        $query->whereNull('expires_at')
                              ->orWhere('expires_at', '>', now());
                    })
                    ->first();
                
                if ($accessToken) {
                    // Get the user associated with the token
                    $user = \App\Models\User::find($accessToken->user_id);
                    
                    if ($user) {
                        // Log in the user in the web guard (session-based) for Horizon
                        Auth::guard('web')->login($user, true);
                    }
                }
            } catch (\Exception $e) {
                // Token is invalid or error occurred, continue without authentication
                // Horizon's gate will handle authorization and deny access if needed
                Log::debug('HorizonAuth middleware error: ' . $e->getMessage());
            }
        }

        return $next($request);
    }
}

