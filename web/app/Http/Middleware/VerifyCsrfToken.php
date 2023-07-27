<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'api/bve/show',
        'api/barcode',
        'api/set-operation-status',
        'api/passport/scan',
        'api/graphql',
        'api/webhooks',
    ];
}
