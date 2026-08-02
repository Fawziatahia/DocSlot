<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Records can now carry an uploaded PDF or image instead of only a link.
     *
     * `file_path` keeps its meaning for rows created before this — an external
     * URL — and holds a private-disk path for anything uploaded from now on;
     * the presence of `file_name` is what distinguishes the two.
     */
    public function up(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $table->string('file_name', 255)->nullable()->after('file_path');
            $table->string('file_mime', 100)->nullable()->after('file_name');
            $table->unsignedBigInteger('file_size')->nullable()->after('file_mime');
        });
    }

    public function down(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropColumn(['file_name', 'file_mime', 'file_size']);
        });
    }
};
