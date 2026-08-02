<?php

namespace App\Features\Admin\Controllers;

use App\Features\Admin\Requests\StoreTaxonomyRequest;
use App\Features\Admin\Requests\UpdateTaxonomyRequest;
use App\Features\Admin\Resources\TaxonomyResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Features\Shared\Traits\AuditableTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxonomyController
{
    use ApiResponseTrait, AuditableTrait;

    public function index(Request $request, string $resource): JsonResponse
    {
        $query = $this->modelClass($resource)::withCount('doctors');

        if (! $request->user('sanctum')?->hasRole('admin')) {
            $query->where('is_active', true);
        }

        if ($q = $request->input('q')) {
            $query->where(function ($qry) use ($q) {
                $qry->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        $items = $query->latest()->paginate((int) $request->input('per_page', 15));

        return $this->paginated($items, TaxonomyResource::class);
    }

    public function show(string $resource, int $id): JsonResponse
    {
        $item = $this->modelClass($resource)::withCount('doctors')->findOrFail($id);

        return $this->success(new TaxonomyResource($item));
    }

    public function store(StoreTaxonomyRequest $request, string $resource): JsonResponse
    {
        $item = $this->modelClass($resource)::create($request->validated());
        $this->audit('created', $this->label($resource), $item->id, null, $item->toArray());

        return $this->created(new TaxonomyResource($item), "{$this->label($resource)} created successfully.");
    }

    public function update(UpdateTaxonomyRequest $request, string $resource, int $id): JsonResponse
    {
        $item = $this->modelClass($resource)::findOrFail($id);
        $oldValues = $item->getOriginal();
        $item->update($request->validated());
        $this->audit('updated', $this->label($resource), $item->id, $oldValues, $item->fresh()->toArray());

        return $this->success(new TaxonomyResource($item->fresh()), "{$this->label($resource)} updated successfully.");
    }

    public function destroy(string $resource, int $id): JsonResponse
    {
        $item = $this->modelClass($resource)::findOrFail($id);
        $this->audit('deleted', $this->label($resource), $item->id, $item->toArray(), null);
        $item->delete();

        return $this->noContent();
    }

    public function toggleStatus(string $resource, int $id): JsonResponse
    {
        $item = $this->modelClass($resource)::findOrFail($id);
        $oldValues = $item->getOriginal();
        $item->update(['is_active' => ! $item->is_active]);
        $this->audit('updated', $this->label($resource), $item->id, $oldValues, $item->fresh()->toArray());

        return $this->success(new TaxonomyResource($item->fresh()), "{$this->label($resource)} status updated.");
    }

    /**
     * @return class-string<Model>
     */
    private function modelClass(string $resource): string
    {
        return config("taxonomies.{$resource}.model");
    }

    private function label(string $resource): string
    {
        return config("taxonomies.{$resource}.label");
    }
}
