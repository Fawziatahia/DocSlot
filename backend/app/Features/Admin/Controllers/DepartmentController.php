<?php

namespace App\Features\Admin\Controllers;

use App\Models\Department;
use App\Features\Admin\Requests\StoreDepartmentRequest;
use App\Features\Admin\Requests\UpdateDepartmentRequest;
use App\Features\Admin\Resources\DepartmentResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $query = Department::withCount('doctors');

        if (! $request->user('sanctum')?->hasRole('admin')) {
            $query->where('is_active', true);
        }

        $departments = $query->latest()->paginate((int) $request->input('per_page', 15));

        return $this->paginated($departments, DepartmentResource::class);
    }

    public function show(int $id): JsonResponse
    {
        $department = Department::withCount('doctors')->findOrFail($id);
        return $this->success(new DepartmentResource($department));
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create($request->validated());
        return response()->json([
            'success' => true,
            'data' => new DepartmentResource($department),
            'message' => 'Department created successfully.',
        ], 201);
    }

    public function update(UpdateDepartmentRequest $request, int $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $department->update($request->validated());
        return $this->success(new DepartmentResource($department->fresh()), 'Department updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $department->delete();
        return $this->noContent();
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $department->update(['is_active' => !$department->is_active]);
        return $this->success(new DepartmentResource($department->fresh()), 'Department status updated.');
    }
}
