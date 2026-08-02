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

    /**
     * Look up a doctor by their public-facing ID (e.g. "d7802721"), used by every
     * route that identifies a doctor from a URL segment.
     */
    public function findByPublicId(string $publicId, array $columns = ['*']): Model
    {
        return Doctor::with(['user', 'specialization', 'department'])
            ->where('public_id', $publicId)
            ->firstOrFail($columns);
    }

    public function findWithSchedules(string $publicId): Model
    {
        return Doctor::with(['user', 'specialization', 'department', 'schedules'])
            ->where('public_id', $publicId)
            ->firstOrFail();
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
     * Search the doctor directory.
     *
     * `q` matches a doctor ID exactly first (so pasting "d8681108" jumps
     * straight to that record), then falls back to a partial match on name,
     * specialization and department. Admins additionally match on licence
     * number and email, and see suspended/deactivated doctors — everyone
     * else only sees the publicly bookable ones.
     *
     * @return LengthAwarePaginator<Doctor>
     */
    public function search(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $privileged = ! empty($filters['privileged']);

        $query = Doctor::with(['user', 'specialization', 'department']);

        if (! $privileged) {
            $query->where('status', 'active')
                ->whereHas('user', function ($qry) {
                    $qry->where('is_active', true);
                });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['q'])) {
            $q = trim($filters['q']);
            $query->where(function ($qry) use ($q, $privileged) {
                $qry->where('public_id', $q)
                    ->orWhere('public_id', 'like', "{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$q}%"))
                    ->orWhereHas('specialization', fn ($s) => $s->where('name', 'like', "%{$q}%"))
                    ->orWhereHas('department', fn ($d) => $d->where('name', 'like', "%{$q}%"));

                if ($privileged) {
                    $qry->orWhere('license_number', 'like', "%{$q}%")
                        ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$q}%"));
                }
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
