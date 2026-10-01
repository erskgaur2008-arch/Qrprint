"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Notification={
 id:string; title:string; message:string; notification_type:string; target_type:string;
 target_role:string|null; recipient_user_id:string|null; scheduled_at:string|null;
 published_at:string|null; status:string; created_at:string;
};
type User={user_id:string;display_name:string|null};
type Role={name:string};

export default function CommunicationClient({schoolId,userId,notifications,users,roles,readIds}:{schoolId:string;userId:string;notifications:Notification[];users:User[];roles:Role[];readIds:string[]}){
 const supabase=createClient();
 const [list,setList]=useState(notifications);
 const [read,setRead]=useState(new Set(readIds));
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState("");

 const unread=list.filter(n=>n.status==="published" && !read.has(n.id)).length;
 const visible=list.filter(n=>n.status!=="archived");
 const roleNames=useMemo(()=>roles.map(r=>r.name).filter(Boolean),[roles]);

 async function createNotification(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault(); setLoading(true); setMessage("");
  const f=new FormData(e.currentTarget);
  const targetType=String(f.get("target_type"));
  const payload={
   school_id:schoolId,title:String(f.get("title")),message:String(f.get("message")),
   notification_type:String(f.get("notification_type")),target_type:targetType,
   target_role:targetType==="role"?String(f.get("target_role")||""):null,
   recipient_user_id:targetType==="user"?String(f.get("recipient_user_id")||""):null,
   status:String(f.get("status")),published_at:String(f.get("status"))==="published"?new Date().toISOString():null,
   scheduled_at:String(f.get("scheduled_at")||"")||null,created_by:userId
  };
  const {data,error}=await supabase.from("notifications").insert(payload).select("id,title,message,notification_type,target_type,target_role,recipient_user_id,scheduled_at,published_at,status,created_at").single();
  if(error)setMessage(error.message); else if(data){setList([data,...list]);e.currentTarget.reset();setMessage("Notification created.");}
  setLoading(false);
 }

 async function publish(id:string){
  const {data,error}=await supabase.from("notifications").update({status:"published",published_at:new Date().toISOString()}).eq("id",id).select("id,status,published_at").single();
  if(error)setMessage(error.message); else if(data)setList(x=>x.map(n=>n.id===id?{...n,status:data.status,published_at:data.published_at}:n));
 }
 async function archive(id:string){
  const {error}=await supabase.from("notifications").update({status:"archived"}).eq("id",id);
  if(error)setMessage(error.message); else setList(x=>x.map(n=>n.id===id?{...n,status:"archived"}:n));
 }
 async function markRead(id:string){
  const {error}=await supabase.from("notification_reads").upsert({notification_id:id,user_id:userId},{onConflict:"notification_id,user_id"});
  if(!error)setRead(x=>new Set([...x,id]));
 }
 return <div>
  {message&&<div className="card" style={{marginBottom:16}}>{message}</div>}
  <div className="cards" style={{marginBottom:16}}>
   <div className="card"><div className="label">Visible Messages</div><div className="value">{visible.length}</div></div>
   <div className="card"><div className="label">Unread</div><div className="value">{unread}</div></div>
   <div className="card"><div className="label">Published</div><div className="value">{list.filter(n=>n.status==="published").length}</div></div>
   <div className="card"><div className="label">Draft / Scheduled</div><div className="value">{list.filter(n=>n.status==="draft"||n.status==="scheduled").length}</div></div>
  </div>

  <div className="grid two">
   <div className="card">
    <h2>Send Notification</h2>
    <p className="muted">Create an in-app message for the school, a role, or one user.</p>
    <form onSubmit={createNotification} className="form-grid">
     <label>Title<input name="title" required maxLength={180} placeholder="Fee reminder"/></label>
     <label>Type<select name="notification_type" defaultValue="general"><option value="general">General</option><option value="fee">Fee</option><option value="attendance">Attendance</option><option value="homework">Homework</option><option value="exam">Exam</option><option value="event">Event</option><option value="admission">Admission</option><option value="system">System</option></select></label>
     <label>Audience<select name="target_type" defaultValue="school" onChange={(e)=>{const el=e.currentTarget.form?.querySelector("[name=target_role]") as HTMLSelectElement|null; const user=e.currentTarget.form?.querySelector("[name=recipient_user_id]") as HTMLSelectElement|null; if(el)el.disabled=e.currentTarget.value!=="role"; if(user)user.disabled=e.currentTarget.value!=="user";}}><option value="school">Entire School</option><option value="role">Role</option><option value="user">Individual User</option></select></label>
     <label>Role<select name="target_role" disabled defaultValue={roleNames[0]||"Teacher"}>{roleNames.map(r=><option key={r} value={r}>{r}</option>)}</select></label>
     <label style={{gridColumn:"1/-1"}}>Individual User<select name="recipient_user_id" disabled defaultValue={userId}><option value="">Select user</option>{users.map(u=><option key={u.user_id} value={u.user_id}>{u.display_name||u.user_id}</option>)}</select></label>
     <label>Status<select name="status" defaultValue="published"><option value="published">Publish now</option><option value="draft">Save as draft</option><option value="scheduled">Scheduled</option></select></label>
     <label>Scheduled At<input type="datetime-local" name="scheduled_at"/></label>
     <label style={{gridColumn:"1/-1"}}>Message<textarea name="message" required rows={7} maxLength={5000} placeholder="Write the message..."/></label>
     <button className="button" disabled={loading}>{loading?"Saving...":"Send Notification"}</button>
    </form>
   </div>

   <div className="card">
    <h2>Notification Center</h2>
    {visible.length===0?<p className="muted">No notifications yet.</p>:<div className="table-wrap"><table><thead><tr><th>Message</th><th>Audience</th><th>Status</th><th></th></tr></thead><tbody>
     {visible.map(n=><tr key={n.id}>
      <td><strong>{n.title}</strong><div className="muted">{n.message.slice(0,120)}{n.message.length>120?"…":""}</div><small className="muted">{new Date(n.created_at).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}</small></td>
      <td>{n.target_type==="school"?"Everyone":n.target_type==="role"?n.target_role:"Individual"}</td>
      <td><span className="badge">{n.status}{n.status==="published"&&!read.has(n.id)?" · unread":""}</span></td>
      <td>{n.status==="draft"||n.status==="scheduled"?<button className="button secondary" onClick={()=>publish(n.id)}>Publish</button>:n.status==="published"?<button className="button secondary" onClick={()=>markRead(n.id)} disabled={read.has(n.id)}>{read.has(n.id)?"Read":"Mark read"}</button>:null}{n.status!=="archived"&&<button className="button secondary" style={{marginLeft:6}} onClick={()=>archive(n.id)}>Archive</button>}</td>
     </tr>)}
    </tbody></table></div>}
   </div>
  </div>
 </div>;
}