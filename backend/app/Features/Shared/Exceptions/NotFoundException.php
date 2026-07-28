<?php

namespace App\Features\Shared\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class NotFoundException extends Exception
{
    public function __construct(
        string $message = 'Resource not found.',
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, 404, $previous);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
        ], 404);
    }
}
