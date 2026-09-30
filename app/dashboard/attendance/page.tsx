import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AttendanceQr from "@/components/attendance-qr";

function workingMinutes(punches: Array<{ punch_type: string; punch_at: string }>) {
  let start: number | null = null;
  let total = 0;
  for (const punch of punches) {
    const t = new Date(punch.punch_at).getTime();
    if (punch.punch_type === "PUNCH_IN") start = t;
    if (punch.punch_type === "PUNCH_OUT" && start !== null && t > start) {
      total += Math.floor((t - start) / 60000);
      start = null;
    }
  }
  return total;
}

export default async function StaffAttendancePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) redirect("/login");

  const { data: membership } = await supabase.from("school_users").select("school_id").eq("user_id", claims.sub).eq("is_active", true).not("school_id", "is", null).limit(1).maybeSingle();
  if (!membership?.school_id) return <main className="content"><div className="card"><h1>School access is not configured</h1></div></main>;

  const schoolId = membership.school_id;
  const [{ data: school }, { data: qrData }] = await Promise.all([
    supabase.from("schools").select("name").eq("id", schoolId).single(),
    supabase.rpc("ensure_daily_attendance_qr", { p_school_id: schoolId }),
  ]);
  const qrToken = Array.isArray(qrData) ? qrData[0]?.qr_token : qrData?.qr_token;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const punchUrl = qrToken ? `${proto}://${host}/staff/punch?school=${schoolId}&qr=${encodeURIComponent(qrToken)}` : "";

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [{ data: staff }, { data: punches }] = await Promise.all([
    supabase.from("staff").select("id, name, employee_no, designation").eq("school_id", schoolId).eq("status", "active").order("name"),
    supabase.from("attendance_punches").select("staff_id, punch_type, punch_at").eq("school_id", schoolId).gte("punch_at", today + "T00:00:00+05:30").lt("punch_at", today + "T23:59:59+05:30").order("punch_at"),
  ]);
  const grouped = new Map<string, Array<{ punch_type: string; punch_at: string }>>();
  for (const punch of punches ?? []) grouped.set(punch.staff_id, [...(grouped.get(punch.staff_id) ?? []), punch]);

  return <div className="shell"><aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">
    <a href="/dashboard">Dashboard</a><a href="/dashboard/staff">Teachers & Staff</a><a className="active" href="/dashboard/attendance">Attendance</a><a href="/dashboard/fees">Fees</a>
  </div></aside>
  <main className="main"><header className="top"><strong>{school?.name ?? "School"}</strong><span className="muted">Staff Attendance</span></header>
    <section className="content"><div className="hero"><div><h1>Staff Attendance</h1><p className="muted">Daily QR + PIN attendance with automatic IN/OUT pairing.</p></div><span className="badge">7:40 AM – 2:30 PM</span></div>
      <div className="grid">
        <div className="card"><h2>Today’s School QR</h2><p className="muted">Display this QR at the school entrance. Staff scan it and enter their personal PIN.</p>{qrToken ? <><AttendanceQr value={punchUrl}/><p className="muted" style={{wordBreak:"break-all"}}>{punchUrl}</p></> : <p className="error">Could not create today’s QR. Check your school membership.</p>}</div>
        <div className="card"><h2>Attendance Rules</h2><div className="row"><span>First punch</span><strong>PUNCH IN</strong></div><div className="row"><span>Next punch</span><strong>PUNCH OUT</strong></div><div className="row"><span>Then</span><strong>IN / OUT / IN / OUT…</strong></div><div className="row"><span>Duplicate window</span><strong>60 seconds</strong></div><div className="row"><span>Working time</span><strong>Closed IN → OUT pairs</strong></div></div>
      </div>
      <div className="card" style={{marginTop:16,overflowX:"auto"}}><h2>Today’s Staff Status</h2><table className="data-table"><thead><tr><th>Staff</th><th>Employee No.</th><th>Last Punch</th><th>Working Time</th></tr></thead><tbody>
      {(staff ?? []).map(s => { const p=grouped.get(s.id)??[]; const last=p.at(-1); const mins=workingMinutes(p); return <tr key={s.id}><td><strong>{s.name}</strong><div className="muted">{s.designation??"—"}</div></td><td>{s.employee_no??"—"}</td><td>{last ? last.punch_type.replace("PUNCH_","") : "Not punched"}{last ? <div className="muted">{new Date(last.punch_at).toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit"})}</div>:null}</td><td><strong>{Math.floor(mins/60)}h {mins%60}m</strong></td></tr>})}
      </tbody></table></div>
    </section>
  </main></div>;
}
