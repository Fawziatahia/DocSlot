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
