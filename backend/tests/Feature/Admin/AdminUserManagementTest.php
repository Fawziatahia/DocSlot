<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use HasinHayder\Tyro\Models\Role;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    private User $admin;
    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        $role = Role::findRole('admin');
        if ($role) {
            $this->admin->assignRole($role);
        }

        $this->regularUser = User::factory()->create();
    }

    /** @test */
    public function admin_can_list_users(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/users');
        $response->assertStatus(200);
        $response->assertJsonStructure(['success', 'data']);
    }

    /** @test */
    public function admin_can_toggle_user_status(): void
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/users/{$this->regularUser->id}/status");
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    /** @test */
    public function admin_can_delete_user(): void
    {
        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->regularUser->id}");
        $response->assertStatus(204);
    }

    /** @test */
    public function non_admin_cannot_access_user_management(): void
    {
        $response = $this->actingAs($this->regularUser)->getJson('/api/admin/users');
        $response->assertStatus(403);
    }
}
