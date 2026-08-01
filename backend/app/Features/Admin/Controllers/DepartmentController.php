<?php

namespace App\Features\Admin\Controllers;

use App\Models\Department;
use App\Features\Admin\Requests\StoreDepartmentRequest;
use App\Features\Admin\Requests\UpdateDepartmentRequest;
use App\Features\Admin\Resources\DepartmentResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Features\Shared\Traits\AuditableTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController
{
    use ApiResponseTrait, AuditableTrait;

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
        $this->audit('created', 'Department', $department->id, null, $department->toArray());
        return response()->json([
            'success' => true,
            'data' => new DepartmentResource($department),
            'message' => 'Department created successfully.',
        ], 201);
    }

    public function update(UpdateDepartmentRequest $request, int $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $oldValues = $department->getOriginal();
        $department->update($request->validated());
        $this->audit('updated', 'Department', $department->id, $oldValues, $department->fresh()->toArray());
        return $this->success(new DepartmentResource($department->fresh()), 'Department updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $this->audit('deleted', 'Department', $department->id, $department->toArray(), null);
        $department->delete();
        return $this->noContent();
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $oldValues = $department->getOriginal();
        $department->update(['is_active' => !$department->is_active]);
        $this->audit('updated', 'Department', $department->id, $oldValues, $department->fresh()->toArray());
        return $this->success(new DepartmentResource($department->fresh()), 'Department status updated.');
    }
}
