<?php

namespace App\Features\Doctors\Enums;

enum DoctorStatusEnum: string
{
    case Active = 'active';
    case Suspended = 'suspended';
}
