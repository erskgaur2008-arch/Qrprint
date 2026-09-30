import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const authenticated = Boolean(data);

  return (
    <main className="content">
      <div className="hero">
        <div>
          <h1>School Dashboard</h1>
          <p className="muted">Authenticated CRM workspace.</p>
        </div>
        <span className="badge">
          {authenticated ? "Authenticated" : "Guest preview"}
        </span>
      </div>

      <div className="cards">
        {[
          ["Students", "—"],
          ["Teachers", "—"],
          ["Attendance", "—"],
          ["Pending Fees", "—"],
        ].map(([label, value]) => (
          <div className="card" key={label}>
            <div className="label">{label}</div>
            <div className="value">{value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Phase 1 foundation</h2>
        <p className="muted">
          Authentication and tenant database connection are ready to be
          connected to the dedicated School CRM Supabase project.
        </p>
      </div>
    </main>
  );
}
