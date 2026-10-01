import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function formatPercent(value: number) { return value.toFixed(1) + "%"; }
function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) redirect("/login");

  const { data: membership } = await supabase.from("school_users")
    .select("school_id, display_name, is_active").eq("user_id", claims.sub)
    .eq("is_active", true).not("school_id", "is", null).limit(1).maybeSingle();

  if (!membership?.school_id) return <main className="content"><div className="card"><span className="badge">Authenticated</span><h1>School access is not configured</h1><p className="muted">Your account is signed in, but it has not been assigned to a school yet.</p></div></main>;

  const schoolId = membership.school_id;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  const [schoolResult, studentsResult, staffResult, attendanceResult, feeResult, paymentResult, activityResult] = await Promise.all([
    supabase.from("schools").select("name, city, state").eq("id", schoolId).single(),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("school_id", schoolId).in("status", ["admitted", "active", "promoted"]),
    supabase.from("staff").select("id", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "active"),
    supabase.from("student_attendance").select("id, status", { count: "exact" }).eq("school_id", schoolId).eq("attendance_date", today),
    supabase.from("student_fees").select("id, amount, discount, status").eq("school_id", schoolId).in("status", ["pending", "partial", "overdue"]),
    supabase.from("payments").select("student_fee_id, amount").eq("school_id", schoolId),
    supabase.from("audit_logs").select("id, action, table_name, created_at").eq("school_id", schoolId).order("created_at", { ascending: false }).limit(5),
  ]);

  const attendanceRows = attendanceResult.data ?? [];
  const attendanceTotal = attendanceRows.length;
  const attendancePresent = attendanceRows.filter(row => row.status === "present" || row.status === "late").length;
  const attendancePercent = attendanceTotal > 0 ? (attendancePresent / attendanceTotal) * 100 : 0;

  const paidByFee = new Map<string, number>();
  for (const payment of paymentResult.data ?? []) paidByFee.set(payment.student_fee_id, (paidByFee.get(payment.student_fee_id) ?? 0) + Number(payment.amount));
  const pendingFees = (feeResult.data ?? []).reduce((total, fee) => total + Math.max(0, Number(fee.amount) - Number(fee.discount) - (paidByFee.get(fee.id) ?? 0)), 0);

  const activities = (activityResult.data ?? []).map(item => ({
    id: item.id, title: item.action.replaceAll("_", " "), detail: item.table_name ?? "School activity",
    time: new Date(item.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }),
  }));

  const schoolName = schoolResult.data?.name ?? "School";
  const displayName = membership.display_name || claims.email || "Admin";

  const nav = [
    ["Dashboard", "/dashboard"], ["Students", "/dashboard/students"], ["Parents", "/dashboard/parents"],
    ["Teachers & Staff", "/dashboard/staff"], ["Admissions", "/dashboard/admissions"], ["Attendance", "/dashboard/attendance"], ["Fees", "/dashboard/fees"],
    ["Academics", "/dashboard/academics"], ["Timetable", "/dashboard/timetable"], ["Homework", "/dashboard/homework"], ["Exams & Results", "/dashboard/exams"], ["Notices & Events", "/dashboard/notices"], ["Communication", "/dashboard/communication"], ["Reports", "/dashboard/reports"], ["Leave Management", "/dashboard/leave"], ["Users & Roles", "/dashboard/users"], ["Settings", "/dashboard/settings"],
  ];

  return <div className="shell">
    <aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">
      {nav.map(([item, href]) => <Link className={item === "Dashboard" ? "active" : ""} href={href} key={item}>{item}</Link>)}
    </div></aside>
    <main className="main">
      <header className="top"><strong>{schoolName}</strong><span className="muted">School Admin · {displayName}</span></header>
      <section className="content">
        <div className="hero"><div><h1>Good morning, {displayName}</h1><p className="muted">Live overview for the current school session.</p></div><span className="badge">Live · Supabase</span></div>
        <div className="cards">
          <div className="card"><div className="label">Students</div><div className="value">{studentsResult.count ?? 0}</div></div>
          <div className="card"><div className="label">Active Teachers & Staff</div><div className="value">{staffResult.count ?? 0}</div></div>
          <div className="card"><div className="label">Today's Attendance</div><div className="value">{attendanceTotal > 0 ? formatPercent(attendancePercent) : "—"}</div></div>
          <div className="card"><div className="label">Pending Fees</div><div className="value">{formatCurrency(pendingFees)}</div></div>
        </div>
        <div className="grid">
          <div className="card"><h2>Recent Activity</h2>{activities.length ? activities.map(activity => <div className="row" key={activity.id}><div><strong>{activity.title}</strong><div className="muted">{activity.detail}</div></div><small className="muted">{activity.time}</small></div>) : <p className="muted">No audit activity has been recorded for this school yet.</p>}</div>
          <div className="card"><h2>Quick Actions</h2>{[["Add Student","/dashboard/students"],["New Admission","/dashboard/admissions"],["Collect Fee","/dashboard/fees"],["Mark Attendance","/dashboard/attendance"],["Create Notice","/dashboard/notices"]].map(([item,href]) => <Link className="row" href={href} key={item}><strong>{item}</strong><span>→</span></Link>)}</div>
        </div>
        <div className="card" style={{ marginTop: 16 }}><div className="label">Connected school</div><h2>{schoolName}</h2><p className="muted">{schoolResult.data?.city ? schoolResult.data.city + ", " + (schoolResult.data.state ?? "India") : "School location not configured"}</p></div>
      </section>
    </main>
  </div>;
}
