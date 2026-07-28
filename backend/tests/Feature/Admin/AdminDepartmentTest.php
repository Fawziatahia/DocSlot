<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use HasinHayder\Tyro\Models\Role;
use Tests\TestCase;

class AdminDepartmentTest extends TestCase
{
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        $role = Role::findRole('admin');
        if ($role) {
            $this->admin->assignRole($role);
        }
    }

    /** @test */
    public function admin_can_list_departments(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/departments');
        $response->assertStatus(200);
        $response->assertJsonStructure(['success', 'data']);
    }

    /** @test */
    public function admin_can_create_department(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/departments', [
            'name' => 'Cardiology',
            'description' => 'Heart department',
        ]);
        $response->assertStatus(201);
        $response->assertJson(['success' => true]);
    }

    /** @test */
    public function admin_can_update_department(): void
    {
        $dept = \App\Models\Department::factory()->create();

        $response = $this->actingAs($this->admin)->putJson("/api/departments/{$dept->id}", [
            'name' => 'Neurology',
        ]);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    /** @test */
    public function admin_can_delete_department(): void
    {
        $dept = \App\Models\Department::factory()->create();

        $response = $this->actingAs($this->admin)->deleteJson("/api/departments/{$dept->id}");
        $response->assertStatus(204);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_departments(): void
    {
        $response = $this->getJson('/api/departments');
        $response->assertStatus(401);
    }
}
