<?php

namespace App\Features\MedicalRecords\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicalRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient' => $this->whenLoaded('patient', fn () => [
                'id' => $this->patient->id,
                'public_id' => $this->patient->public_id,
                'name' => $this->patient->user->name,
            ]),
            'doctor' => $this->whenLoaded('doctor', fn () => [
                'id' => $this->doctor->id,
                'public_id' => $this->doctor->public_id,
                'name' => $this->doctor->user->name,
            ]),
            'appointment_id' => $this->appointment_id,
            'record_type' => $this->record_type,
            'title' => $this->title,
            'description' => $this->description,
            // Uploads are described by `file` and fetched through the
            // authenticated download route; `external_url` covers the older
            // records that only ever held a link.
            'file' => $this->when($this->hasStoredFile(), fn () => [
                'name' => $this->file_name,
                'mime' => $this->file_mime,
                'size' => $this->file_size,
                'is_image' => str_starts_with((string) $this->file_mime, 'image/'),
                'url' => "/medical-records/{$this->id}/file",
            ]),
            'external_url' => $this->when(
                $this->file_path && ! $this->file_name,
                fn () => $this->file_path
            ),
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
