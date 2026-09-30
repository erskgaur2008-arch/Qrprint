import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) redirect("/login");

  const { data: membership } = await supabase.from("school_users").select("school_id").eq("user_id", claims.sub).eq("is_active", true).not("school_id", "is", null).limit(1).maybeSingle();
  if (!membership?.school_id) return <main className="content"><div className="card"><h1>School access is not configured</h1><p className="muted">Your account has not been assigned to a school.</p></div></main>;

  const schoolId = membership.school_id;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [{ data: school }, { data: staff }, { data: punches }] = await Promise.all([
    supabase.from("schools").select("name").eq("id", schoolId).single(),
    supabase.from("staff").select("id, employee_no, name, designation, department, phone, email, joining_date, status").eq("school_id", schoolId).order("name"),
    supabase.from("attendance_punches").select("staff_id, punch_type, punch_at").eq("school_id", schoolId).gte("punch_at", today + "T00:00:00+05:30").lt("punch_at", today + "T23:59:59+05:30").order("punch_at"),
  ]);

  const grouped = new Map<string, Array<{ punch_type: string; punch_at: string }>>();
  for (const punch of punches ?? []) grouped.set(punch.staff_id, [...(grouped.get(punch.staff_id) ?? []), punch]);
  const checkedIn = (staff ?? []).filter(s => (grouped.get(s.id) ?? []).at(-1)?.punch_type === "PUNCH_IN").length;
  const checkedOut = (staff ?? []).filter(s => (grouped.get(s.id) ?? []).at(-1)?.punch_type === "PUNCH_OUT").length;

  return <div className="shell">
    <aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">
      <a href="/dashboard">Dashboard</a><a href="/dashboard/students">Students</a><a href="/dashboard/parents">Parents</a>
      <a className="active" href="/dashboard/staff">Teachers & Staff</a><a href="/dashboard/attendance">Attendance</a><a href="/dashboard/fees">Fees</a>
    </div></aside>
    <main className="main"><header className="top"><strong>{school?.name ?? "School"}</strong><span className="muted">Teachers & Staff</span></header>
      <section className="content">
        <div className="hero"><div><h1>Teachers & Staff</h1><p className="muted">Live staff directory and today’s punch status.</p></div><span className="badge">Live · Supabase</span></div>
        <div className="cards">
          <div className="card"><div className="label">Active Staff</div><div className="value">{(staff ?? []).filter(s => s.status === "active").length}</div></div>
          <div className="card"><div className="label">Teachers</div><div className="value">{(staff ?? []).filter(s => String(s.designation ?? "").toLowerCase().includes("teacher")).length}</div></div>
          <div className="card"><div className="label">Currently In</div><div className="value">{checkedIn}</div></div>
          <div className="card"><div className="label">Punched Out</div><div className="value">{checkedOut}</div></div>
        </div>
        <div className="card" style={{ marginTop: 16, overflowX: "auto" }}>
          <h2>Staff Directory & Today’s Attendance</h2>
          <table className="data-table"><thead><tr><th>Staff</th><th>Employee No.</th><th>Designation</th><th>Department</th><th>Phone</th><th>Status</th><th>Working Today</th></tr></thead>
          <tbody>{(staff ?? []).map(s => {
            const p = grouped.get(s.id) ?? [];
            const mins = workingMinutes(p);
            const last = p.at(-1);
            return <tr key={s.id}><td><strong>{s.name}</strong><div className="muted">{s.email ?? "—"}</div></td><td>{s.employee_no ?? "—"}</td><td>{s.designation ?? "—"}</td><td>{s.department ?? "—"}</td><td>{s.phone ?? "—"}</td><td><span className="badge">{s.status}</span></td><td><strong>{Math.floor(mins / 60)}h {mins % 60}m</strong><div className="muted">{last ? last.punch_type.replace("PUNCH_", "") : "No punch"}</div></td></tr>;
          })}</tbody></table>
        </div>
      </section>
    </main>
  </div>;
}
