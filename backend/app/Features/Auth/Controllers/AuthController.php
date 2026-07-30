<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\ChangePasswordAction;
use App\Features\Auth\Actions\ForgotPasswordAction;
use App\Features\Auth\Actions\LoginUserAction;
use App\Features\Auth\Actions\LogoutUserAction;
use App\Features\Auth\Actions\RegisterUserAction;
use App\Features\Auth\Actions\ResetPasswordAction;
use App\Features\Auth\DTOs\AuthData;
use App\Features\Auth\Requests\ChangePasswordRequest;
use App\Features\Auth\Requests\ForgotPasswordRequest;
use App\Features\Auth\Requests\LoginRequest;
use App\Features\Auth\Requests\RegisterRequest;
use App\Features\Auth\Requests\ResetPasswordRequest;
use App\Features\Auth\Resources\AuthResource;
use App\Features\Auth\Resources\UserResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class AuthController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly RegisterUserAction $registerUserAction,
        private readonly LoginUserAction $loginUserAction,
        private readonly LogoutUserAction $logoutUserAction,
        private readonly ForgotPasswordAction $forgotPasswordAction,
        private readonly ResetPasswordAction $resetPasswordAction,
        private readonly ChangePasswordAction $changePasswordAction,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = AuthData::fromArray($request->validated());
        $result = $this->registerUserAction->execute($data);

        return response()->json([
            'success' => true,
            'data' => new AuthResource($result),
            'message' => 'Registration successful.',
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->loginUserAction->execute(
            $request->validated('email'),
            $request->validated('password'),
        );

        return $this->success(new AuthResource($result), 'Login successful.');
    }

    public function logout(Request $request): JsonResponse
    {
        $this->logoutUserAction->execute($request->user());

        return $this->success(null, 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()));
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->forgotPasswordAction->execute($request->validated('email'));

        return $this->success(null, 'Password reset link sent to your email.');
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = $this->resetPasswordAction->execute(
            $request->validated('email'),
            $request->validated('token'),
            $request->validated('password'),
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success(null, 'Password has been reset successfully.');
        }

        return $this->error('Invalid or expired password reset token.', 400);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $this->changePasswordAction->execute(
            $request->user(),
            $request->validated('current_password'),
            $request->validated('password'),
        );

        return $this->success(new UserResource($user), 'Password changed successfully.');
    }
}
