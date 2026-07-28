<?php

namespace App\Features\Auth\Actions;

use App\Features\Auth\DTOs\AuthData;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegisterUserAction
{
    /**
     * Register a new patient user.
     *
     * Creates User + Patient rows in a transaction and assigns the "patient" role.
     *
     * @return array{user: User, token: string}
     */
    public function execute(AuthData $data): array
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data->name,
                'email' => $data->email,
                'password' => Hash::make($data->password),
                'phone' => $data->phone,
            ]);

            $user->assignRole('patient');

            Patient::create([
                'user_id' => $user->id,
                'date_of_birth' => $data->dateOfBirth,
                'gender' => $data->gender,
                'address' => $data->address,
            ]);

            $token = $user->createToken('auth-token', ['patient'])->plainTextToken;

            return ['user' => $user, 'token' => $token];
        });
    }
}
