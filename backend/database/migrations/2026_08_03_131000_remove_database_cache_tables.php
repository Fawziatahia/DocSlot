<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Drops the database cache tables. The app runs on the `file` cache and session
 * drivers, so these tables were never used. The stock create_cache_table
 * migration has been removed alongside this one; its migration record is purged
 * here so migrate:status / migrate:fresh stay consistent.
 *
 * If database cache is ever needed again, run `php artisan cache:table` to
 * regenerate the migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');

        DB::table('migrations')
            ->where('migration', '0001_01_01_000001_create_cache_table')
            ->delete();
    }

    public function down(): void
    {
        if (! Schema::hasTable('cache')) {
            Schema::create('cache', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->mediumText('value');
                $table->bigInteger('expiration')->index();
            });
        }

        if (! Schema::hasTable('cache_locks')) {
            Schema::create('cache_locks', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->string('owner');
                $table->bigInteger('expiration')->index();
            });
        }
    }
};
