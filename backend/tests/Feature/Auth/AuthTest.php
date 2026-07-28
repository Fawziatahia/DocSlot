<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;

class AuthTest extends TestCase
{
    /** @test */
    public function user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test Patient',
            'email' => 'patient@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'phone' => '+1234567890',
        ]);
        $response->assertStatus(201);
        $response->assertJsonStructure(['success', 'data' => ['user', 'token']]);
    }

    /** @test */
    public function user_cannot_register_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'dup@test.com']);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Dup User',
            'email' => 'dup@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    /** @test */
    public function user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'login@test.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login@test.com',
            'password' => 'Password123!',
        ]);
        $response->assertStatus(200);
        $response->assertJsonStructure(['success', 'data' => ['token']]);
    }

    /** @test */
    public function user_cannot_login_with_wrong_password(): void
    {
        $user = User::factory()->create([
            'email' => 'wrong@test.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'wrong@test.com',
            'password' => 'WrongPassword1!',
        ]);
        $response->assertStatus(422);
    }

    /** @test */
    public function authenticated_user_can_access_me(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/auth/me');
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_protected_route(): void
    {
        $response = $this->getJson('/api/auth/me');
        $response->assertStatus(401);
    }
}
