"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StaffPunchForm({ schoolId, qrToken }: { schoolId: string; qrToken: string }) {
  const [employeeNo, setEmployeeNo] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; type?: string; minutes?: number } | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("record_staff_punch", {
      p_school_id: schoolId,
      p_qr_token: qrToken,
      p_employee_no: employeeNo.trim(),
      p_pin: pin.trim(),
    });
    setBusy(false);

    if (error) {
      setResult({ ok: false, message: error.message.replace(/^.*?: /, "") });
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    const minutes = Number(row?.working_minutes ?? 0);
    setResult({
      ok: true,
      message: `${row?.staff_name ?? "Staff"} — ${row?.punch_type === "PUNCH_IN" ? "Punch In" : "Punch Out"} recorded successfully.`,
      type: row?.punch_type,
      minutes,
    });
    setPin("");
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="brand-mark">🕘</div>
      <h1>Staff Attendance</h1>
      <p className="muted">Scan the school QR code, then enter your employee number and personal PIN.</p>
      <div className="auth-card form-stack">
        <label>Employee Number<input value={employeeNo} onChange={e => setEmployeeNo(e.target.value)} required autoComplete="username" /></label>
        <label>Personal PIN<input value={pin} onChange={e => setPin(e.target.value)} required inputMode="numeric" pattern="[0-9]{4,8}" maxLength={8} type="password" autoComplete="current-password" /></label>
        <button disabled={busy}>{busy ? "Recording…" : "Punch Attendance"}</button>
      </div>
      {result && (
        <div className={result.ok ? "success" : "error"}>
          <strong>{result.ok ? "Attendance Updated" : "Punch Not Recorded"}</strong>
          <p>{result.message}</p>
          {result.ok && <small>Completed working time today: {Math.floor((result.minutes ?? 0) / 60)}h {(result.minutes ?? 0) % 60}m</small>}
        </div>
      )}
    </form>
  );
}
