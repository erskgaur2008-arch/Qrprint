"use client";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Enquiry = {
  id:string; enquiry_no:string; student_name:string; class_interested:string|null;
  parent_name:string|null; parent_phone:string|null; source:string|null; status:string;
  next_follow_up_at:string|null; notes:string|null;
};

const stages=["enquiry","contacted","interested","visit_scheduled","application_started","application_submitted","document_verification","entrance_test","approved","fee_pending","admitted","lost","future_follow_up"];

export default function AdmissionsClient({schoolId, initial}:{schoolId:string;initial:Enquiry[]}) {
  const [rows,setRows]=useState(initial); const [open,setOpen]=useState(false); const [saving,setSaving]=useState(false);
  const [filter,setFilter]=useState("all"); const [q,setQ]=useState(""); const [message,setMessage]=useState("");
  const [form,setForm]=useState({student_name:"",class_interested:"",parent_name:"",parent_phone:"",parent_email:"",source:"website",status:"enquiry",notes:""});
  const filtered=useMemo(()=>rows.filter(r=>(filter==="all"||r.status===filter)&&(!q||[r.student_name,r.parent_name,r.parent_phone,r.enquiry_no].join(" ").toLowerCase().includes(q.toLowerCase()))),[rows,filter,q]);
  const counts=stages.reduce((m,s)=>(m[s]=rows.filter(r=>r.status===s).length,m),{} as Record<string,number>);
  async function save(e:React.FormEvent){e.preventDefault();setSaving(true);setMessage("");const supabase=createClient();
    const enquiry_no="ENQ-"+new Date().getFullYear()+"-"+String(rows.length+1).padStart(3,"0");
    const {data,error}=await supabase.from("admission_enquiries").insert({...form,school_id:schoolId,enquiry_no}).select("id,enquiry_no,student_name,class_interested,parent_name,parent_phone,source,status,next_follow_up_at,notes").single();
    if(error)setMessage(error.message); else {setRows([data,...rows]);setOpen(false);setForm({student_name:"",class_interested:"",parent_name:"",parent_phone:"",parent_email:"",source:"website",status:"enquiry",notes:""});setMessage("Enquiry added successfully.");}
    setSaving(false);
  }
  async function updateStatus(id:string,status:string){const supabase=createClient();const {error}=await supabase.from("admission_enquiries").update({status,updated_at:new Date().toISOString()}).eq("id",id).eq("school_id",schoolId);if(!error)setRows(rows.map(r=>r.id===id?{...r,status}:r));else setMessage(error.message);}
  return <div>
    {message&&<div className="success">{message}</div>}
    <div className="cards" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:16}}>
      {[[ "Total Enquiries",rows.length],["Active Pipeline",rows.filter(r=>!["lost","admitted"].includes(r.status)).length],["Visits / Applications",rows.filter(r=>["visit_scheduled","application_started","application_submitted"].includes(r.status)).length],["Admitted",counts.admitted||0]].map(([a,b])=><div className="card" key={String(a)}><div className="label">{a}</div><div className="value">{b}</div></div>)}
    </div>
    <div className="card">
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input placeholder="Search student, parent, phone..." value={q} onChange={e=>setQ(e.target.value)} style={{padding:11,border:"1px solid #d9e0e8",borderRadius:10,minWidth:220}}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:11,border:"1px solid #d9e0e8",borderRadius:10}}><option value="all">All stages</option>{stages.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></div>
        <button onClick={()=>setOpen(true)} style={{padding:"11px 16px",border:0,borderRadius:10,background:"#173b63",color:"#fff",fontWeight:700}}>+ New Enquiry</button>
      </div>
      <div style={{overflowX:"auto"}}><table className="data-table"><thead><tr><th>Enquiry</th><th>Student</th><th>Parent</th><th>Class</th><th>Source</th><th>Stage</th><th>Action</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td>{r.enquiry_no}</td><td><strong>{r.student_name}</strong><div className="muted">{r.parent_phone??""}</div></td><td>{r.parent_name??"—"}</td><td>{r.class_interested??"—"}</td><td>{r.source??"—"}</td><td><select value={r.status} onChange={e=>updateStatus(r.id,e.target.value)} style={{padding:7,border:"1px solid #d9e0e8",borderRadius:8}}>{stages.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></td><td><button onClick={()=>setMessage(r.notes||"No notes")} style={{border:0,background:"transparent",cursor:"pointer"}}>View</button></td></tr>)}</tbody></table></div>
      {!filtered.length&&<p className="muted">No enquiries match your filters.</p>}
    </div>
    {open&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",display:"grid",placeItems:"center",padding:20,zIndex:100}}>
      <form onSubmit={save} className="card" style={{width:"min(720px,100%)",maxHeight:"90vh",overflowY:"auto"}}><div style={{display:"flex",justifyContent:"space-between"}}><h2>New Admission Enquiry</h2><button type="button" onClick={()=>setOpen(false)}>✕</button></div>
      <div className="cards" style={{gridTemplateColumns:"repeat(2,1fr)"}}>
        {[["student_name","Student name *"],["class_interested","Class interested"],["parent_name","Parent / guardian"],["parent_phone","Parent phone"],["parent_email","Parent email"],["source","Source"]].map(([k,l])=><label key={k} style={{display:"grid",gap:6,fontWeight:600,fontSize:14}}>{l}<input required={k==="student_name"} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={{padding:11,border:"1px solid #d9e0e8",borderRadius:10}} /></label>)}
      </div><label style={{display:"grid",gap:6,marginTop:14,fontWeight:600,fontSize:14}}>Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={4} style={{padding:11,border:"1px solid #d9e0e8",borderRadius:10}}/></label>
      <button disabled={saving} style={{marginTop:16,padding:13,border:0,borderRadius:10,background:"#173b63",color:"#fff",fontWeight:700,width:"100%"}}>{saving?"Saving...":"Create Enquiry"}</button></form>
    </div>}
  </div>;
}