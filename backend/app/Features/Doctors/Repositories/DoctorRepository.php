<?php

namespace App\Features\Doctors\Repositories;

use App\Models\Doctor;
use App\Features\Shared\Interfaces\RepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class DoctorRepository implements RepositoryInterface
{
    public function all(array $columns = ['*']): Collection
    {
        return Doctor::with(['user', 'specialization', 'department'])->get($columns);
    }

    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return Doctor::with(['user', 'specialization', 'department'])
            ->paginate($perPage, $columns);
    }

    public function find(int $id, array $columns = ['*']): ?Model
    {
        return Doctor::with(['user', 'specialization', 'department'])->find($id, $columns);
    }

    public function findOrFail(int $id, array $columns = ['*']): Model
    {
        return Doctor::with(['user', 'specialization', 'department'])->findOrFail($id, $columns);
    }

    public function findWithSchedules(int $id): Model
    {
        return Doctor::with(['user', 'specialization', 'department', 'schedules'])->findOrFail($id);
    }

    public function create(array $data): Model
    {
        return Doctor::create($data);
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

    /**
     * @return LengthAwarePaginator<Doctor>
     */
    public function search(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Doctor::with(['user', 'specialization', 'department'])
            ->where('status', 'active');

        if (! empty($filters['q'])) {
            $q = $filters['q'];
            $query->whereHas('user', function ($qry) use ($q) {
                $qry->where('name', 'like', "%{$q}%");
            });
        }

        if (! empty($filters['specialization_id'])) {
            $query->where('specialization_id', $filters['specialization_id']);
        }

        if (! empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (! empty($filters['min_fee'])) {
            $query->where('consultation_fee', '>=', (float) $filters['min_fee']);
        }

        if (! empty($filters['max_fee'])) {
            $query->where('consultation_fee', '<=', (float) $filters['max_fee']);
        }

        return $query->paginate($perPage);
    }
}
