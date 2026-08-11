<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #1f2937; font-size: 12px; margin: 0; }
        .wrap { padding: 30px 34px 56px; }
        table { border-collapse: collapse; width: 100%; }

        /* Header: prescribing doctor's details left, brand mark top-right */
        .header-table td { vertical-align: top; }
        .doctor-cell { width: 64%; }
        .doctor-name { font-size: 17px; font-weight: bold; color: #111827; }
        .doctor-line { font-size: 10.5px; color: #4b5563; margin-top: 2px; }
        .doctor-line strong { color: #1f2937; }

        .brand-cell { width: 36%; text-align: right; }
        .brand-cell img { height: 68px; }
        .brand-tag { font-size: 9px; color: #9ca3af; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 4px; }

        .rule { border: none; border-top: 3px solid #111827; margin: 14px 0 20px; }

        /* Patient info line, styled like a printed prescription pad's fill-in line */
        .patient-line { margin-bottom: 8px; }
        .patient-line td { font-size: 12px; padding-bottom: 5px; vertical-align: bottom; white-space: nowrap; }
        .patient-line .lbl { color: #6b7280; padding-right: 4px; }
        .patient-line .val { font-weight: bold; color: #111827; border-bottom: 1px dotted #9ca3af; padding: 0 10px 2px; }
        .patient-line .val.name-val { min-width: 190px; }
        .patient-line .val.wide { min-width: 90px; }
        .patient-line .spacer { width: 100%; }

        /* Rx opening mark + status line */
        .rx-row { margin: 6px 0 22px; }
        .rx-mark { font-size: 36px; font-weight: bold; color: #2563eb; font-style: italic; }
        .rx-mark sub { font-size: 20px; bottom: -0.3em; }

        /* Two-column body: diagnosis left, medicines right */
        .body-table > tbody > tr > td { vertical-align: top; }
        .col-left { width: 38%; padding-right: 16px; }
        .col-right { width: 62%; padding-left: 16px; border-left: 1px solid #e5e7eb; }

        .section-title { font-size: 12px; font-weight: bold; margin: 0 0 8px; color: #111827; text-transform: uppercase; letter-spacing: 0.4px; }

        .box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; font-size: 12px; line-height: 1.5; }

        .med-item { border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; }
        .med-item table { width: 100%; }
        .med-name { font-size: 12.5px; font-weight: bold; color: #111827; }
        .med-dosage { text-align: right; font-size: 11px; font-weight: bold; color: #2563eb; }
        .med-meta { font-size: 10px; color: #6b7280; margin-top: 3px; }
        .med-instructions { font-size: 10px; color: #374151; margin-top: 3px; font-style: italic; }
        .no-meds { text-align: center; color: #9ca3af; padding: 14px; }

        /* Pinned to the bottom of every page */
        .footer { position: fixed; bottom: 16px; left: 34px; right: 34px; color: #9ca3af; font-size: 9px; text-align: center; }
    </style>
</head>
<body>
    <div class="wrap">
        <table class="header-table">
            <tr>
                <td class="doctor-cell">
                    <div class="doctor-name">{{ $prescription->doctor->user->name }}</div>
                    @if ($prescription->doctor->specialization || $prescription->doctor->department)
                        <div class="doctor-line">
                            {{ $prescription->doctor->specialization?->name }}
                            @if ($prescription->doctor->specialization && $prescription->doctor->department)
                                &middot;
                            @endif
                            {{ $prescription->doctor->department?->name }}
                        </div>
                    @endif
                    @if ($prescription->doctor->qualifications)
                        <div class="doctor-line">{{ $prescription->doctor->qualifications }}</div>
                    @endif
                    @if ($prescription->doctor->license_number)
                        <div class="doctor-line"><strong>License No.</strong> {{ $prescription->doctor->license_number }}</div>
                    @endif
                    <div class="doctor-line">
                        @if ($prescription->doctor->user->phone)
                            {{ $prescription->doctor->user->phone }} &middot;
                        @endif
                        {{ $prescription->doctor->user->email }}
                    </div>
                </td>
                <td class="brand-cell">
                    <img src="{{ $logoDataUri }}" alt="DocSlot Health Care">
                    <div class="brand-tag">Medical Prescription</div>
                </td>
            </tr>
        </table>

        <hr class="rule">

        <table class="patient-line">
            <tr>
                <td class="lbl">Name :</td>
                <td class="val name-val">{{ $prescription->patient->user->name }}</td>
                <td class="lbl">Age :</td>
                <td class="val">{{ $prescription->patient->date_of_birth?->age ?? '—' }}</td>
                <td class="lbl">Sex :</td>
                <td class="val">{{ $prescription->patient->gender ? ucfirst($prescription->patient->gender) : '—' }}</td>
                <td class="lbl">Date :</td>
                <td class="val wide">{{ $prescription->created_at->format('M j, Y') }}</td>
                <td class="spacer"></td>
            </tr>
        </table>

        <div class="rx-row">
            <span class="rx-mark">R<sub>x</sub></span>
        </div>

        <table class="body-table">
            <tr>
                <td class="col-left">
                    <div class="section-title">Diagnosis</div>
                    <div class="box">{{ $prescription->diagnosis ?: 'Not specified.' }}</div>

                    @if ($prescription->notes)
                        <div class="section-title" style="margin-top: 16px;">Notes</div>
                        <div class="box">{{ $prescription->notes }}</div>
                    @endif

                    @if ($prescription->advice)
                        <div class="section-title" style="margin-top: 16px;">Advice</div>
                        <div class="box">{{ $prescription->advice }}</div>
                    @endif
                </td>
                <td class="col-right">
                    <div class="section-title">Medicines</div>
                    @forelse ($prescription->medications as $med)
                        <div class="med-item">
                            <table>
                                <tr>
                                    <td class="med-name">{{ $med->medication_name }}</td>
                                    <td class="med-dosage">{{ $med->dosage }}</td>
                                </tr>
                            </table>
                            <div class="med-meta">
                                {{ $med->frequency }}
                                @if ($med->duration)
                                    &middot; {{ $med->duration }}
                                @endif
                            </div>
                            @if ($med->instructions)
                                <div class="med-instructions">{{ $med->instructions }}</div>
                            @endif
                        </div>
                    @empty
                        <div class="no-meds">No medications listed.</div>
                    @endforelse
                </td>
            </tr>
        </table>

    </div>

    <div class="footer">
        This prescription was generated by DocSlot Health Care on {{ now()->format('M j, Y g:i A') }}.
        It is valid only with the prescribing doctor's authorization.
    </div>
</body>
</html>
