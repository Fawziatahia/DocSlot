@php
    $statusColors = [
        'pending' => ['bg' => '#fff3cd', 'text' => '#664d03'],
        'confirmed' => ['bg' => '#cff4fc', 'text' => '#055160'],
        'in_progress' => ['bg' => '#cfe2ff', 'text' => '#052c65'],
        'completed' => ['bg' => '#d1e7dd', 'text' => '#0f5132'],
        'cancelled' => ['bg' => '#f8d7da', 'text' => '#58151c'],
    ];
    $colors = $statusColors[$status] ?? ['bg' => '#e2e3e5', 'text' => '#41464b'];
    $label = ucfirst(str_replace('_', ' ', $status));
@endphp
<span style="display: inline-block; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 700; text-transform: capitalize; letter-spacing: 0.02em; padding: 5px 14px; border-radius: 999px; background: {{ $colors['bg'] }}; color: {{ $colors['text'] }};">
    {{ $label }}
</span>
