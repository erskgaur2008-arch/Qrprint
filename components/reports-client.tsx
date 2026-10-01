"use client";

import { useMemo, useState } from "react";

type Row = Record<string, string | number | null>;
type Props = {
  summary: { students:number; staff:number; parents:number; attendance:number; attendancePresent:number; billed:number; paid:number; pending:number; enquiries:number; applications:number; marks:number };
  students: Row[]; attendance: Row[]; fees: Row[]; admissions: Row[]; exams: Row[]; staff: Row[];
};

const reports = [
  ["overview","Overview"],["students","Student Report"],["attendance","Attendance Report"],
  ["fees","Fee Collection"],["admissions","Admission Report"],["exams","Exam Results"],["staff","Staff Report"]
] as const;

function money(n:number){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);}
function csv(rows:Row[]){
  if(!rows.length)return "";
  const keys=Object.keys(rows[0]);
  return [keys.join(","),...rows.map(r=>keys.map(k=>'"'+String(r[k]??"").replaceAll('"','""')+'"').join(","))].join("\n");
}
function download(name:string, rows:Row[]){
  const blob=new Blob([csv(rows)],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);
}

export default function ReportsClient({summary,students,attendance,fees,admissions,exams,staff}:Props){
  const [kind,setKind]=useState<(typeof reports)[number][0]>("overview");
  const [search,setSearch]=useState("");
  const [from,setFrom]=useState("");
  const [to,setTo]=useState("");
  const [classFilter,setClassFilter]=useState("all");
  const [statusFilter,setStatusFilter]=useState("all");

  const classes=useMemo(()=>Array.from(new Set(students.map(r=>String(r.class||"")).filter(Boolean))).sort(),[students]);
  const source=kind==="students"?students:kind==="attendance"?attendance:kind==="fees"?fees:kind==="admissions"?admissions:kind==="exams"?exams:kind==="staff"?staff:[];
  const filtered=useMemo(()=>source.filter(r=>{
    const hay=Object.values(r).join(" ").toLowerCase();
    if(search && !hay.includes(search.toLowerCase()))return false;
    if(classFilter!=="all" && String(r.class??"")!==classFilter)return false;
    if(statusFilter!=="all" && String(r.status??"").toLowerCase()!==statusFilter.toLowerCase())return false;
    const d=String(r.date??r.due_date??r.paid_at??r.exam_date??"").slice(0,10);
    if(from && d && d<from)return false;
    if(to && d && d>to)return false;
    return true;
  }),[source,search,classFilter,statusFilter,from,to]);

  function reset(){setSearch("");setFrom("");setTo("");setClassFilter("all");setStatusFilter("all");}
  const exportRows=kind==="overview"?[
    {metric:"Students",value:summary.students},{metric:"Staff",value:summary.staff},{metric:"Parents",value:summary.parents},
    {metric:"Attendance Records",value:summary.attendance},{metric:"Attendance Present",value:summary.attendancePresent},
    {metric:"Fee Billed",value:summary.billed},{metric:"Fee Paid",value:summary.paid},{metric:"Fee Pending",value:summary.pending},
    {metric:"Admission Enquiries",value:summary.enquiries},{metric:"Applications",value:summary.applications},{metric:"Marks Entered",value:summary.marks}
  ]:filtered;

  return <div>
    <div className="report-tabs">{reports.map(([id,label])=><button key={id} className={kind===id?"report-tab active":"report-tab"} onClick={()=>{setKind(id);reset();}}>{label}</button>)}</div>
    <div className="card report-toolbar">
      <div><label>Search<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search report..." /></label></div>
      {kind!=="overview" && kind!=="staff" && <label>Class<select value={classFilter} onChange={e=>setClassFilter(e.target.value)}><option value="all">All classes</option>{classes.map(c=><option key={c}>{c}</option>)}</select></label>}
      {kind!=="overview" && <label>Status<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All statuses</option>{Array.from(new Set(source.map(r=>String(r.status??"")).filter(Boolean))).map(s=><option key={s}>{s}</option>)}</select></label>}
      {kind!=="overview" && <><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)} /></label></>}
      <div className="report-actions"><button className="button secondary" onClick={reset}>Reset</button><button className="button secondary" onClick={()=>download("school-report-"+kind+".csv",exportRows)}>Export CSV</button><button className="button" onClick={()=>window.print()}>Print</button></div>
    </div>

    {kind==="overview" ? <div className="cards">
      <div className="card"><div className="label">Students</div><div className="value">{summary.students}</div></div>
      <div className="card"><div className="label">Staff</div><div className="value">{summary.staff}</div></div>
      <div className="card"><div className="label">Parents</div><div className="value">{summary.parents}</div></div>
      <div className="card"><div className="label">Attendance Present</div><div className="value">{summary.attendancePresent}/{summary.attendance}</div></div>
      <div className="card"><div className="label">Fees Collected</div><div className="value">{money(summary.paid)}</div></div>
      <div className="card"><div className="label">Fees Pending</div><div className="value">{money(summary.pending)}</div></div>
      <div className="card"><div className="label">Enquiries</div><div className="value">{summary.enquiries}</div></div>
      <div className="card"><div className="label">Applications</div><div className="value">{summary.applications}</div></div>
    </div> : <div className="card" style={{marginTop:16,overflowX:"auto"}}>
      <div className="row"><h2>{reports.find(r=>r[0]===kind)?.[1]}</h2><span className="muted">{filtered.length} records</span></div>
      {filtered.length===0?<p className="muted">No records match the selected filters.</p>:<table className="data-table"><thead><tr>{Object.keys(filtered[0]).map(k=><th key={k}>{k.replaceAll("_"," ")}</th>)}</tr></thead><tbody>{filtered.map((r,i)=><tr key={i}>{Object.keys(filtered[0]).map(k=><td key={k}>{String(r[k]??"—")}</td>)}</tr>)}</tbody></table>}
    </div>}
  </div>;
}
