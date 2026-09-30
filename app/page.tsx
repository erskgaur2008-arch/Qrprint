const stats=[["Students","1,248"],["Teachers","86"],["Today's Attendance","94.6%"],["Pending Fees","₹4.82L"]];
const activities=[["New admission enquiry","Aarav Sharma — Class 6","Today"],["Fee payment received","Demo Parent — ₹18,500","Today"],["Attendance submitted","Class 8-A — 32 students","10 min ago"],["Homework published","Mathematics — Class 7","25 min ago"]];
export default function Home(){
 return <div className="shell">
  <aside className="sidebar"><div className="brand">🎓 SchoolConnect</div><div className="nav">{["Dashboard","Students","Parents","Teachers & Staff","Admissions","Attendance","Fees","Academics","Homework","Exams & Results","Notices & Events","Reports","Settings"].map((x,i)=><div className={i===0?"active":""} key={x}>{x}</div>)}</div></aside>
  <main className="main">
   <header className="top"><strong>Demo Public School</strong><span className="muted">School Admin · Santraj</span></header>
   <section className="content">
    <div className="hero"><div><h1>Good morning, Santraj</h1><p className="muted">School overview for the current academic session.</p></div><span className="badge">System Ready</span></div>
    <div className="cards">{stats.map(([a,b])=><div className="card" key={a}><div className="label">{a}</div><div className="value">{b}</div></div>)}</div>
    <div className="grid"><div className="card"><h2>Recent Activity</h2>{activities.map(([a,b,c])=><div className="row" key={a}><div><strong>{a}</strong><div className="muted">{b}</div></div><small className="muted">{c}</small></div>)}</div><div className="card"><h2>Quick Actions</h2>{["Add Student","New Admission","Collect Fee","Mark Attendance","Create Notice"].map(x=><div className="row" key={x}><strong>{x}</strong><span>→</span></div>)}</div></div>
   </section>
  </main>
 </div>
}