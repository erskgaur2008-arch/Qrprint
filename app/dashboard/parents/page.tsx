import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ParentLoginManager from "@/components/parent-login-manager";

export default async function ParentsPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) redirect("/login");

  const { data: membership } = await supabase
    .from("school_users")
    .select("school_id")
    .eq("user_id", claims.sub)
    .eq("is_active", true)
    .not("school_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (!membership?.school_id) {
    return <main className="content"><div className="card"><h1>School access is not configured</h1><p className="muted">Your account has not been assigned to a school.</p></div></main>;
  }

  const { data: school } = await supabase.from("schools").select("name").eq("id", membership.school_id).single();
  const { data: parents } = await supabase
    .from("parents")
    .select("id, name, phone, email, address, user_id")
    .eq("school_id", membership.school_id)
    .order("name");

  const parentIds = (parents ?? []).map(p => p.id);
  const { data: links } = parentIds.length
    ? await supabase.from("student_parents").select("parent_id, student_id, relationship, is_primary").in("parent_id", parentIds)
    : { data: [] };

  const studentIds = [...new Set((links ?? []).map(l => l.student_id))];
  const { data: students } = studentIds.length
    ? await supabase.from("students").select("id, name").in("id", studentIds)
    : { data: [] };

  const studentMap = new Map((students ?? []).map(s => [s.id, s.name]));
  const childrenMap = new Map<string, string[]>();
  for (const link of links ?? []) {
    const list = childrenMap.get(link.parent_id) ?? [];
    const name = studentMap.get(link.student_id);
    if (name) list.push(name);
    childrenMap.set(link.parent_id, list);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">🎓 SchoolConnect</div>
        <div className="nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/dashboard/students">Students</a>
          <a className="active" href="/dashboard/parents">Parents</a>
          <a href="/dashboard/fees">Fees</a>
        </div>
      </aside>
      <main className="main">
        <header className="top"><strong>{school?.name ?? "School"}</strong><span className="muted">Parents</span></header>
        <section className="content parents-page">
          <div className="hero">
            <div><h1>Parents & Guardians</h1><p className="muted">Parent directory with linked children.</p></div>
            <span className="badge">Live · Supabase</span>
          </div>
          <div className="cards">
            <div className="card"><div className="label">Total Parents</div><div className="value">{parents?.length ?? 0}</div></div>
            <div className="card"><div className="label">Linked Children</div><div className="value">{new Set((links ?? []).map(l => l.student_id)).size}</div></div>
            <div className="card"><div className="label">Primary Contacts</div><div className="value">{(links ?? []).filter(l => l.is_primary).length}</div></div>
            <div className="card"><div className="label">With Email</div><div className="value">{(parents ?? []).filter(p => !!p.email).length}</div></div>
          </div>
          <div className="card" style={{ marginTop: 16, overflowX: "auto" }}>
            <h2>Parent Directory</h2>
            {(parents ?? []).length === 0 ? <p className="muted">No parents found.</p> : (
              <table className="data-table">
                <thead><tr><th>Parent / Guardian</th><th>Phone</th><th>Email</th><th>Children</th><th>Address</th><th>Login</th></tr></thead>
                <tbody>
                  {(parents ?? []).map(parent => (
                    <tr key={parent.id}>
                      <td><strong>{parent.name}</strong></td>
                      <td>{parent.phone ?? "—"}</td>
                      <td>{parent.email ?? "—"}</td>
                      <td>{(childrenMap.get(parent.id) ?? []).join(", ") || "—"}</td>
                      <td>{parent.address ?? "—"}</td><td><ParentLoginManager parentId={parent.id} parentName={parent.name} currentEmail={parent.email} hasLogin={!!parent.user_id} /></td>
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
