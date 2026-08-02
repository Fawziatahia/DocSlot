<?php

namespace App\Features\MedicalRecords\Services;

use App\Features\MedicalRecords\Repositories\MedicalRecordRepository;
use App\Models\MedicalRecord;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MedicalRecordService
{
    /**
     * Attachments are patient health data, so they live on the private disk
     * and are only ever served through the authenticated download route —
     * never from a guessable public URL.
     */
    private const DISK = 'local';

    private const DIRECTORY = 'medical-records';

    public function __construct(
        private readonly MedicalRecordRepository $medicalRecordRepository,
    ) {}

    public function createRecord(array $data, int $doctorId, ?UploadedFile $file = null): MedicalRecord
    {
        return $this->medicalRecordRepository->create([
            'patient_id' => $data['patient_id'],
            'doctor_id' => $doctorId,
            'appointment_id' => $data['appointment_id'] ?? null,
            'record_type' => $data['record_type'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'notes' => $data['notes'] ?? null,
            ...$this->fileAttributes($file, $data['file_path'] ?? null),
        ]);
    }

    /**
     * Replace a record's attachment, deleting whatever it had before so
     * superseded scans don't linger on disk.
     */
    public function replaceFile(MedicalRecord $record, UploadedFile $file): array
    {
        $this->deleteFile($record);

        return $this->fileAttributes($file);
    }

    public function deleteFile(MedicalRecord $record): void
    {
        if ($record->hasStoredFile()) {
            Storage::disk(self::DISK)->delete($record->file_path);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function fileAttributes(?UploadedFile $file, ?string $externalUrl = null): array
    {
        if (! $file) {
            return [
                'file_path' => $externalUrl,
                'file_name' => null,
                'file_mime' => null,
                'file_size' => null,
            ];
        }

        return [
            'file_path' => $file->store(self::DIRECTORY, self::DISK),
            'file_name' => $file->getClientOriginalName(),
            'file_mime' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ];
    }

    public function disk(): string
    {
        return self::DISK;
    }
}
