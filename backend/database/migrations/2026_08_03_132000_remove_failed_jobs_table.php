<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drops the failed_jobs table. Failed-job logging is disabled (the queue
 * failed driver now defaults to "null" in config/queue.php), so failing jobs
 * are no longer recorded. The stock create_jobs_table migration has been
 * updated to stop creating this table on fresh installs; jobs and job_batches
 * are unaffected.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('failed_jobs');
    }

    public function down(): void
    {
        if (! Schema::hasTable('failed_jobs')) {
            Schema::create('failed_jobs', function (Blueprint $table) {
                $table->id();
                $table->string('uuid')->unique();
                $table->text('connection');
                $table->text('queue');
                $table->longText('payload');
                $table->longText('exception');
                $table->timestamp('failed_at')->useCurrent();
            });
        }
    }
};
