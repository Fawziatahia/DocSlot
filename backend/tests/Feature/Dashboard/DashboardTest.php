<?php

namespace Tests\Feature\Dashboard;

use App\Models\User;
use HasinHayder\Tyro\Models\Role;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    /** @test */
    public function admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create();
        $role = Role::findRole('admin');
        if ($role) {
            $admin->assignRole($role);
        }

        $response = $this->actingAs($admin)->getJson('/api/dashboard/admin');
        $response->assertStatus(200);
        $response->assertJsonStructure(['success', 'data']);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/dashboard/admin');
        $response->assertStatus(401);
    }
}
