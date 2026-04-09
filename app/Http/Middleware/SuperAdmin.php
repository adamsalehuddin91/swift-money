<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SuperAdmin
{
    // Add your email here — only this email can access /admin
    private const ALLOWED = [
        'adamsalehuddin91@gmail.com',
    ];

    public function handle(Request $request, Closure $next)
    {
        abort_unless(
            $request->user() && in_array($request->user()->email, self::ALLOWED),
            403
        );

        return $next($request);
    }
}
