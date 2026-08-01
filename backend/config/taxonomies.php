<?php

use App\Models\Department;
use App\Models\Specialization;

return [
    'departments' => [
        'model' => Department::class,
        'label' => 'Department',
    ],
    'specializations' => [
        'model' => Specialization::class,
        'label' => 'Specialization',
    ],
];
