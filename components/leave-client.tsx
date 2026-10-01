"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Person={id:string;name:string;employee_no?:string|null;class_name?:string|null;section?:string|null};
type Leave={id:string;requester_type:"staff"|"student";requester_id:string;leave_type:string;start_date:string;end_date:string;reason:string|null;status:string;review_notes:string|null;created_at:string;};

export default function LeaveClient({schoolId,userId,staff,students,initial}:{schoolId:string;userId:string;staff:Person[];students:Person[];initial:Leave[]}){
 const supabase=createClient();
 const [rows,setRows]=useState(initial);
 const [type,setType]=useState<"staff"|"student">("staff");
 const [requester,setRequester]=useState("");
 const [leaveType,setLeaveType]=useState("Casual");
 const [start,setStart]=useState("");
 const [end,setEnd]=useState("");
 const [reason,setReason]=useState("");
 const [status,setStatus]=useState("all");
 const [search,setSearch]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");

 const people=type==="staff"?staff:students;
 const names=useMemo(()=>new Map([...staff,...students].map(p=>[p.id,p.name])),[staff,students]);
 const filtered=rows.filter(r=>{
   if(status!=="all"&&r.status!==status)return false;
   const name=names.get(r.requester_id)??"";
   return !search||((name+" "+r.leave_type+" "+(r.reason??"")).toLowerCase().includes(search.toLowerCase()));
 });
 async function add(){
   if(!requester||!start||!end){setMessage("Select requester and leave dates.");return}
   if(end<start){setMessage("End date cannot be before start date.");return}
   setBusy(true);setMessage("");
   const {data,error}=await supabase.from("leave_requests").insert({
     school_id:schoolId,requester_type:type,requester_id:requester,leave_type:leaveType,
     start_date:start,end_date:end,reason:reason||null,status:"pending",created_by:userId
   }).select("*").single();
   if(error)setMessage(error.message);
   else {setRows(v=>[data,...v]);setRequester("");setStart("");setEnd("");setReason("");setMessage("Leave request created.");}
   setBusy(false);
 }
 async function review(id:string,next:string){
   setBusy(true);setMessage("");
   const {data,error}=await supabase.from("leave_requests").update({status:next,reviewed_by:userId,reviewed_at:new Date().toISOString()}).eq("id",id).select("*").single();
   if(error)setMessage(error.message); else setRows(v=>v.map(x=>x.id===id?data:x));
   setBusy(false);
 }
 return <div>
   <div className="grid">
    <div className="card">
      <h2>New Leave Request</h2><p className="muted">Create a leave request for a staff member or student.</p>
      <div className="form-grid">
       <label>Requester Type<select value={type} onChange={e=>{setType(e.target.value as "staff"|"student");setRequester("")}}><option value="staff">Staff</option><option value="student">Student</option></select></label>
       <label>Requester<select value={requester} onChange={e=>setRequester(e.target.value)}><option value="">Select requester</option>{people.map(p=><option key={p.id} value={p.id}>{p.name}{p.employee_no?" · "+p.employee_no:""}</option>)}</select></label>
       <label>Leave Type<select value={leaveType} onChange={e=>setLeaveType(e.target.value)}><option>Casual</option><option>Medical</option><option>Earned</option><option>Emergency</option><option>Other</option></select></label>
       <label>Start Date<input type="date" value={start} onChange={e=>setStart(e.target.value)}/></label>
       <label>End Date<input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></label>
       <label>Reason<textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason for leave"/></label>
      </div>
      <button className="button" disabled={busy} onClick={add}>{busy?"Saving…":"Create Leave Request"}</button>
      {message&&<p className={message.includes("created")?"success":"error"}>{message}</p>}
    </div>
    <div className="card">
      <h2>Leave Summary</h2>
      <div className="cards">
       <div className="card"><div className="label">Pending</div><div className="value">{rows.filter(r=>r.status==="pending").length}</div></div>
       <div className="card"><div className="label">Approved</div><div className="value">{rows.filter(r=>r.status==="approved").length}</div></div>
       <div className="card"><div className="label">Rejected</div><div className="value">{rows.filter(r=>r.status==="rejected").length}</div></div>
      </div>
    </div>
   </div>
   <div className="card" style={{marginTop:16,overflowX:"auto"}}>
    <div className="row"><div><h2>Leave Requests</h2><p className="muted">{filtered.length} records</p></div><div className="row">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" />
      <select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option></select>
    </div></div>
    <table className="data-table"><thead><tr><th>Requester</th><th>Type</th><th>Leave</th><th>Dates</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {filtered.map(r=><tr key={r.id}><td><strong>{names.get(r.requester_id)??"Unknown"}</strong></td><td>{r.requester_type}</td><td>{r.leave_type}</td><td>{r.start_date} → {r.end_date}</td><td>{r.reason??"—"}</td><td><span className="badge">{r.status}</span></td><td>{r.status==="pending"?<div className="row"><button className="button" disabled={busy} onClick={()=>review(r.id,"approved")}>Approve</button><button className="button secondary" disabled={busy} onClick={()=>review(r.id,"rejected")}>Reject</button></div>:"—"}</td></tr>)}
      {!filtered.length&&<tr><td colSpan={7}><p className="muted">No leave requests match your filters.</p></td></tr>}
    </tbody></table>
   </div>
 </div>;
}
