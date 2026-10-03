import Link from "next/link";

const capabilities = [
  ["Student records", "Keep student information organized by school."],
  ["Attendance", "Track daily attendance and review records."],
  ["Fees & payments", "Manage fee records and payment activity."],
  ["Academics", "Bring timetables, homework and exams together."],
  ["Staff & roles", "Organize school teams and access permissions."],
  ["Communication", "Keep notices, events and school updates in one place."],
];

export default function Home() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-brand">🎓 <span>SchoolConnect</span></div>
        <div className="landing-content">
          <div className="landing-copy">
            <span className="landing-kicker">School management platform</span>
            <h1>Less paperwork. More time for learning.</h1>
            <p>SchoolConnect brings everyday school administration into one workspace—from student records and attendance to fees, academics and communication.</p>
            <div className="landing-actions">
              <Link className="landing-button primary" href="/login">School Admin Login</Link>
              <Link className="landing-button secondary" href="/teacher-login">Teacher Login</Link>
            </div>
          </div>
          <div className="landing-card">
            <div className="landing-icon" aria-hidden="true">🏫</div>
            <h2>One workspace for your school</h2>
            <p>Sign in with your school account to access the tools and information assigned to your role.</p>
            <div className="landing-teacher-link">School teams · Academic workflows · Administration</div>
          </div>
        </div>
      </section>
      <section className="content" aria-labelledby="capabilities-heading">
        <div className="hero">
          <div>
            <span className="landing-kicker">Core capabilities</span>
            <h2 id="capabilities-heading">The essentials, connected</h2>
            <p className="muted">Access depends on your account and school permissions.</p>
          </div>
        </div>
        <div className="cards">
          {capabilities.map(([title, description]) => (
            <article className="card" key={title}>
              <h3>{title}</h3>
              <p className="muted">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="landing-footer">SchoolConnect · School management and administration</footer>
    </main>
  );
}
