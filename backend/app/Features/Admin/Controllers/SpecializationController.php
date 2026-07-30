<?php

namespace App\Features\Admin\Controllers;

use App\Models\Specialization;
use App\Features\Admin\Requests\StoreSpecializationRequest;
use App\Features\Admin\Requests\UpdateSpecializationRequest;
use App\Features\Admin\Resources\SpecializationResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpecializationController
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $query = Specialization::withCount('doctors');

        if (! $request->user('sanctum')?->hasRole('admin')) {
            $query->where('is_active', true);
        }

        $specializations = $query->latest()->paginate((int) $request->input('per_page', 15));

        return $this->paginated($specializations, SpecializationResource::class);
    }

    public function show(int $id): JsonResponse
    {
        $specialization = Specialization::withCount('doctors')->findOrFail($id);
        return $this->success(new SpecializationResource($specialization));
    }

    public function store(StoreSpecializationRequest $request): JsonResponse
    {
        $specialization = Specialization::create($request->validated());
        return response()->json([
            'success' => true,
            'data' => new SpecializationResource($specialization),
            'message' => 'Specialization created successfully.',
        ], 201);
    }

    public function update(UpdateSpecializationRequest $request, int $id): JsonResponse
    {
        $specialization = Specialization::findOrFail($id);
        $specialization->update($request->validated());
        return $this->success(new SpecializationResource($specialization->fresh()), 'Specialization updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $specialization = Specialization::findOrFail($id);
        $specialization->delete();
        return $this->noContent();
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $specialization = Specialization::findOrFail($id);
        $specialization->update(['is_active' => !$specialization->is_active]);
        return $this->success(new SpecializationResource($specialization->fresh()), 'Specialization status updated.');
    }
}
