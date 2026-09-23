<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_missing_token_returns_json_401(): void
    {
        $response = $this->getJson('/api/admin/me');

        $response
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_admin_can_login_and_receive_a_bearer_token(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('secret-password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonPath('user.email', 'admin@example.com')
            ->assertJsonMissingPath('user.password');

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_non_admin_cannot_use_admin_login(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('secret-password'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $this->postJson('/api/admin/login', [
            'email' => 'user@example.com',
            'password' => 'secret-password',
        ])->assertForbidden()->assertJson([
            'message' => 'Admin access required.',
        ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_admin_can_logout_and_revoke_the_current_token(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);
        $token = $admin->createToken('test-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/admin/logout')
            ->assertOk()
            ->assertJson(['message' => 'Admin logged out successfully.']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
