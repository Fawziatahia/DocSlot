<?php

namespace App\Features\Patients\Enums;

enum PatientStatusEnum: string
{
    case Active = 'active';
    case Suspended = 'suspended';
}
