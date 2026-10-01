import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) redirect("/login");

  const { data: membership } = await supabase
    .from("school_users")
    .select("school_id, display_name")
    .eq("user_id", claims.sub)
    .eq("is_active", true)
    .not("school_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (!membership?.school_id) {
    return <main className="content"><div className="card"><h1>School access is not configured</h1><p className="muted">Your account has not been assigned to a school.</p></div></main>;
  }

  const { data: school } = await supabase.from("schools").select("name").eq("id", membership.school_id).single();
  const { data: students } = await supabase
    .from("students")
    .select("id, student_id, admission_no, name, date_of_birth, gender, blood_group, class_id, section_id, class_name, section, roll_no, admission_date, status")
    .eq("school_id", membership.school_id)
    .order("name");
  const [{ data: classRows }, { data: sectionRows }] = await Promise.all([
    supabase.from("classes").select("id,name").eq("school_id", membership.school_id).eq("is_active", true),
    supabase.from("sections").select("id,name").eq("school_id", membership.school_id).eq("is_active", true)
  ]);
  const classMap = new Map((classRows ?? []).map(c => [c.id, c.name]));
  const sectionMap = new Map((sectionRows ?? []).map(s => [s.id, s.name]));

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">🎓 SchoolConnect</div>
        <div className="nav">
          <a href="/dashboard">Dashboard</a>
          <a className="active" href="/dashboard/students">Students</a>
          <a href="/dashboard/parents">Parents</a>
          <a href="/dashboard/fees">Fees</a>
        </div>
      </aside>
      <main className="main">
        <header className="top">
          <strong>{school?.name ?? "School"}</strong>
          <span className="muted">Students</span>
        </header>
        <section className="content">
          <div className="hero">
            <div>
              <h1>Students</h1>
              <p className="muted">Live student directory for this school.</p>
            </div>
            <span className="badge">Live · Supabase</span>
          </div>
          <div className="cards">
            <div className="card"><div className="label">Total Students</div><div className="value">{students?.length ?? 0}</div></div>
            <div className="card"><div className="label">Active / Admitted</div><div className="value">{(students ?? []).filter(s => ["active","admitted","promoted"].includes(s.status)).length}</div></div>
            <div className="card"><div className="label">Boys</div><div className="value">{(students ?? []).filter(s => String(s.gender).toLowerCase() === "male").length}</div></div>
            <div className="card"><div className="label">Girls</div><div className="value">{(students ?? []).filter(s => String(s.gender).toLowerCase() === "female").length}</div></div>
          </div>
          <div className="card" style={{ marginTop: 16, overflowX: "auto" }}>
            <h2>Student Directory</h2>
            {(students ?? []).length === 0 ? <p className="muted">No students found.</p> : (
              <table className="data-table">
                <thead><tr><th>Student</th><th>Admission No.</th><th>Class</th><th>Roll No.</th><th>DOB</th><th>Gender</th><th>Status</th></tr></thead>
                <tbody>
                  {(students ?? []).map(student => (
                    <tr key={student.id}>
                      <td><strong>{student.name}</strong><div className="muted">{student.student_id}</div></td>
                      <td>{student.admission_no ?? "—"}</td>
                      <td>{(student.class_id ? classMap.get(student.class_id) : null) ?? student.class_name ?? "—"}{(student.section_id ? sectionMap.get(student.section_id) : null) ? " · " + sectionMap.get(student.section_id) : (student.section ? " · " + student.section : "")}</td>
                      <td>{student.roll_no ?? "—"}</td>
                      <td>{student.date_of_birth ?? "—"}</td>
                      <td>{student.gender ?? "—"}</td>
                      <td><span className="badge">{student.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
