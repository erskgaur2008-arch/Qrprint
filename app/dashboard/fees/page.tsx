import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function FeesPage() {
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
    return (
      <main className="content">
        <div className="card">
          <h1>School access is not configured</h1>
          <p className="muted">Your account has not been assigned to a school.</p>
        </div>
      </main>
    );
  }

  const schoolId = membership.school_id;

  const [schoolResult, feeResult, paymentResult] = await Promise.all([
    supabase.from("schools").select("name").eq("id", schoolId).single(),
    supabase
      .from("student_fees")
      .select("id, student_id, description, amount, discount, due_date, status")
      .eq("school_id", schoolId)
      .order("due_date", { ascending: false }),
    supabase
      .from("payments")
      .select("student_fee_id, amount, payment_mode, paid_at")
      .eq("school_id", schoolId)
      .order("paid_at", { ascending: false }),
  ]);

  const fees = feeResult.data ?? [];
  const payments = paymentResult.data ?? [];
  const studentIds = [...new Set(fees.map((fee) => fee.student_id))];

  const { data: students } = studentIds.length
    ? await supabase
        .from("students")
        .select("id, name, admission_no, class_name, section")
        .in("id", studentIds)
    : { data: [] };

  const studentMap = new Map(
    (students ?? []).map((student) => [
      student.id,
      {
        name: student.name,
        admissionNo: student.admission_no,
        className: student.class_name,
        sectionName: student.section,
      },
    ]),
  );

  const paidByFee = new Map<string, number>();
  for (const payment of payments) {
    paidByFee.set(
      payment.student_fee_id,
      (paidByFee.get(payment.student_fee_id) ?? 0) + Number(payment.amount),
    );
  }

  const totalBilled = fees.reduce(
    (sum, fee) => sum + Number(fee.amount) - Number(fee.discount),
    0,
  );
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalPending = Math.max(0, totalBilled - totalPaid);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">🎓 SchoolConnect</div>
        <div className="nav">
          <a href="/dashboard">Dashboard</a>
          <a className="active" href="/dashboard/fees">Fees</a>
        </div>
      </aside>

      <main className="main">
        <header className="top">
          <strong>{schoolResult.data?.name ?? "School"}</strong>
          <span className="muted">Fees & Payments</span>
        </header>

        <section className="content fees-page">
          <div className="hero">
            <div>
              <h1>Fees & Payments</h1>
              <p className="muted">Live fee ledger for this school.</p>
            </div>
            <span className="badge">Live · Supabase</span>
          </div>

          <div className="cards">
            <div className="card">
              <div className="label">Total Billed</div>
              <div className="value">{money(totalBilled)}</div>
            </div>
            <div className="card">
              <div className="label">Collected</div>
              <div className="value">{money(totalPaid)}</div>
            </div>
            <div className="card">
              <div className="label">Pending</div>
              <div className="value">{money(totalPending)}</div>
            </div>
            <div className="card">
              <div className="label">Fee Records</div>
              <div className="value">{fees.length}</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16, overflowX: "auto" }}>
            <h2>Student Fee Ledger</h2>
            {fees.length === 0 ? (
              <p className="muted">No fee records have been created yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Description</th>
                    <th>Due</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => {
                    const student = studentMap.get(fee.student_id);
                    const net = Number(fee.amount) - Number(fee.discount);
                    const paid = paidByFee.get(fee.id) ?? 0;
                    const balance = Math.max(0, net - paid);

                    return (
                      <tr key={fee.id}>
                        <td>
                          <strong>{student?.name ?? "Student"}</strong>
                          <div className="muted">{student?.admissionNo ?? "—"}</div>
                        </td>
                        <td>
                          {student?.className ?? "—"}
                          {student?.sectionName ? " · " + student.sectionName : ""}
                        </td>
                        <td>{fee.description}</td>
                        <td>{fee.due_date ?? "—"}</td>
                        <td>{money(paid)}</td>
                        <td>{money(balance)}</td>
                        <td>
                          <span className="badge">
                            {balance === 0 ? "paid" : fee.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
