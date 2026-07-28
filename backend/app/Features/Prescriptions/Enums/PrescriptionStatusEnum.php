<?php

namespace App\Features\Prescriptions\Enums;

enum PrescriptionStatusEnum: string
{
    case Active = 'active';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
