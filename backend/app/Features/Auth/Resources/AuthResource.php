<?php

namespace App\Features\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array{user: array, token: string, abilities: mixed}
     */
    public function toArray(Request $request): array
    {
        /** @var \App\Models\User $user */
        $user = $this->resource['user'];
        $token = $this->resource['token'];

        return [
            'user' => new UserResource($user),
            'token' => $token,
            'abilities' => $user->getRoleNames(),
        ];
    }
}
