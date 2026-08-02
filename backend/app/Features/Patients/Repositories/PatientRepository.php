<?php

namespace App\Features\Patients\Repositories;

use App\Models\Patient;
use App\Features\Shared\Interfaces\RepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class PatientRepository implements RepositoryInterface
{
    public function all(array $columns = ['*']): Collection
    {
        return Patient::with('user')->get($columns);
    }

    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return Patient::with('user')->paginate($perPage, $columns);
    }

    public function find(int $id, array $columns = ['*']): ?Model
    {
        return Patient::with('user')->find($id, $columns);
    }

    public function findOrFail(int $id, array $columns = ['*']): Model
    {
        return Patient::with('user')->findOrFail($id, $columns);
    }

    /**
     * Look up a patient by their public-facing ID (e.g. "p7894622"), used by every
     * route that identifies a patient from a URL segment.
     */
    public function findByPublicId(string $publicId, array $columns = ['*']): Model
    {
        return Patient::with('user')->where('public_id', $publicId)->firstOrFail($columns);
    }

    /**
     * Search patients for the admin/doctor patient list.
     *
     * `q` matches a patient ID exactly first (so pasting "p7894622" lands on
     * that record), then falls back to a partial match on name, email or
     * phone.
     *
     * @param  array<string, mixed>  $filters
     */
    public function search(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Patient::with('user');

        if (! empty($filters['q'])) {
            $q = trim($filters['q']);
            $query->where(function ($qry) use ($q) {
                $qry->where('public_id', $q)
                    ->orWhere('public_id', 'like', "{$q}%")
                    ->orWhereHas('user', function ($u) use ($q) {
                        $u->where('name', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%")
                            ->orWhere('phone', 'like', "%{$q}%");
                    });
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest('id')->paginate($perPage);
    }

    public function create(array $data): Model
    {
        return Patient::create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);

        return $model;
    }

    public function delete(Model $model): bool
    {
        return $model->delete();
    }

    public function forceDelete(Model $model): bool
    {
        return $model->forceDelete();
    }
}
