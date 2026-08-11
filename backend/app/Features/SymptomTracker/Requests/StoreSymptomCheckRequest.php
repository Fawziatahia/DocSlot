<?php

namespace App\Features\SymptomTracker\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSymptomCheckRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'symptoms' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }
}
