<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Removes the hasinhayder/tyro-login schema (social login, invitation system,
 * and two-factor auth) after the package was uninstalled. These features were
 * unused: the HasTwoFactorAuth trait was imported but never applied, and no
 * app code referenced the social/invitation tables.
 *
 * Idempotent (dropIfExists / hasColumn guards) so it is safe on fresh installs
 * where the package migrations never ran. Reversible via down().
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('invitation_referrals');
        Schema::dropIfExists('invitation_links');
        Schema::dropIfExists('social_accounts');

        if (Schema::hasColumn('users', 'two_factor_secret')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn([
                    'two_factor_secret',
                    'two_factor_recovery_codes',
                    'two_factor_confirmed_at',
                ]);
            });
        }

        // Retire the now-orphaned package migration records so migrate:status
        // and migrate:fresh stay consistent after the package files are gone.
        DB::table('migrations')->whereIn('migration', [
            '2024_01_01_000000_create_social_accounts_table',
            '2024_01_01_000001_add_two_factor_columns_to_users_table',
            '2024_01_01_000002_create_invitation_system_tables',
        ])->delete();
    }

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'two_factor_secret')) {
            Schema::table('users', function (Blueprint $table) {
                $table->text('two_factor_secret')->nullable();
                $table->text('two_factor_recovery_codes')->nullable();
                $table->timestamp('two_factor_confirmed_at')->nullable();
            });
        }

        if (! Schema::hasTable('social_accounts')) {
            Schema::create('social_accounts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('provider');
                $table->string('provider_user_id');
                $table->string('provider_email')->nullable();
                $table->string('provider_avatar')->nullable();
                $table->text('access_token')->nullable();
                $table->text('refresh_token')->nullable();
                $table->timestamp('token_expires_at')->nullable();
                $table->timestamps();
                $table->unique(['provider', 'provider_user_id']);
                $table->index(['provider', 'provider_user_id']);
                $table->index('user_id');
            });
        }

        if (! Schema::hasTable('invitation_links')) {
            Schema::create('invitation_links', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('hash', 32)->unique();
                $table->timestamps();
                $table->index('user_id');
            });
        }

        if (! Schema::hasTable('invitation_referrals')) {
            Schema::create('invitation_referrals', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('invitation_link_id');
                $table->unsignedBigInteger('referred_user_id');
                $table->timestamps();
                $table->foreign('invitation_link_id')
                    ->references('id')
                    ->on('invitation_links')
                    ->onDelete('cascade');
                $table->index('invitation_link_id');
                $table->index('referred_user_id');
            });
        }
    }
};
