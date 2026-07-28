<?php

namespace App\Features\Doctors\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('doctor')) {
            $doctor = \App\Models\Doctor::where('user_id', $user->id)->firstOrFail();

            return (int) $this->route('id') === $doctor->id;
        }

        return false;
    }

    public function rules(): array
    {
        return [
            'days' => ['required', 'array', 'min:1', 'max:7'],
            'days.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'days.*.start_time' => ['required', 'date_format:H:i'],
            'days.*.end_time' => ['required', 'date_format:H:i', 'after:days.*.start_time'],
            'days.*.slot_duration' => ['nullable', 'integer', 'min:15', 'max:120'],
            'days.*.max_daily_appointments' => ['nullable', 'integer', 'min:1', 'max:100'],
            'days.*.is_available' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'days.*.day_of_week.unique' => 'Duplicate day_of_week entries are not allowed.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Ensure no duplicate days in the request
        $this->merge([
            'days' => collect($this->input('days', []))
                ->unique('day_of_week')
                ->values()
                ->toArray(),
        ]);
    }
}
