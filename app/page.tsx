import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-brand">🎓 <span>SchoolConnect</span></div>
        <div className="landing-content">
          <div className="landing-copy">
            <span className="landing-kicker">School CRM & Communication</span>
            <h1>Everything your school needs, in one place.</h1>
            <p>Manage academics, attendance, homework, exams, fees, communication and more from one secure school platform.</p>
            <div className="landing-actions">
              <Link className="landing-button primary" href="/teacher-login">Teacher Login</Link>
              <Link className="landing-button secondary" href="/login">School Admin Login</Link>
            </div>
          </div>
          <div className="landing-card">
            <div className="landing-icon">👩‍🏫</div>
            <h2>Teacher Portal</h2>
            <p>Sign in to access your classes, attendance, homework, exams, timetable, leave and communication.</p>
            <Link className="landing-teacher-link" href="/teacher-login">Go to Teacher Login →</Link>
          </div>
        </div>
      </section>
      <footer className="landing-footer">Demo Public School · SchoolConnect Multi-School SaaS</footer>
    </main>
  );
}
