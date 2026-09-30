"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Notice={id:string;title:string;content:string;audience:string;publish_date:string;status:string};
type Event={id:string;title:string;description:string|null;event_date:string;start_time:string|null;end_time:string|null;location:string|null;status:string};

export default function NoticesClient({schoolId,userId,notices,events}:{schoolId:string;userId:string;notices:Notice[];events:Event[]}){
 const supabase=createClient(); const [tab,setTab]=useState<"notices"|"events">("notices"); const [noticeList,setNoticeList]=useState(notices); const [eventList,setEventList]=useState(events); const [loading,setLoading]=useState(false); const [message,setMessage]=useState("");
 async function addNotice(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setMessage("");const f=new FormData(e.currentTarget);const p={school_id:schoolId,title:String(f.get("title")),content:String(f.get("content")),audience:String(f.get("audience")),publish_date:String(f.get("publish_date")),status:String(f.get("status")),created_by:userId};const {data,error}=await supabase.from("notices").insert(p).select("id,title,content,audience,publish_date,status").single();if(error)setMessage(error.message);else if(data){setNoticeList([data,...noticeList]);e.currentTarget.reset();setMessage("Notice saved.");}setLoading(false);}
 async function addEvent(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setMessage("");const f=new FormData(e.currentTarget);const p={school_id:schoolId,title:String(f.get("title")),description:String(f.get("description")||""),event_date:String(f.get("event_date")),start_time:String(f.get("start_time")||"")||null,end_time:String(f.get("end_time")||"")||null,location:String(f.get("location")||"")||null,status:"upcoming",created_by:userId};const {data,error}=await supabase.from("events").insert(p).select("id,title,description,event_date,start_time,end_time,location,status").single();if(error)setMessage(error.message);else if(data){setEventList([data,...eventList]);e.currentTarget.reset();setMessage("Event created.");}setLoading(false);}
 async function updateNotice(id:string,status:string){const {error}=await supabase.from("notices").update({status,updated_at:new Date().toISOString()}).eq("id",id);if(!error)setNoticeList(x=>x.map(n=>n.id===id?{...n,status}:n));}
 async function updateEvent(id:string,status:string){const {error}=await supabase.from("events").update({status,updated_at:new Date().toISOString()}).eq("id",id);if(!error)setEventList(x=>x.map(n=>n.id===id?{...n,status}:n));}
 return <div>
 {message&&<div className="card" style={{marginBottom:16}}>{message}</div>}
 <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}><button className={tab==="notices"?"button":"button secondary"} onClick={()=>setTab("notices")}>Notices</button><button className={tab==="events"?"button":"button secondary"} onClick={()=>setTab("events")}>Events</button></div>
 {tab==="notices"&&<div className="grid two">
  <div className="card"><h2>Create Notice</h2><form onSubmit={addNotice} className="form-grid">
   <label>Title<input name="title" required placeholder="Parent-Teacher Meeting"/></label>
   <label>Audience<select name="audience" defaultValue="all"><option value="all">Everyone</option><option value="students">Students</option><option value="parents">Parents</option><option value="teachers">Teachers</option><option value="staff">Staff</option></select></label>
   <label>Publish Date<input type="date" name="publish_date" required defaultValue={new Date().toISOString().slice(0,10)}/></label>
   <label>Status<select name="status" defaultValue="draft"><option value="draft">Draft</option><option value="published">Published</option></select></label>
   <label style={{gridColumn:"1/-1"}}>Notice Content<textarea name="content" required rows={7} placeholder="Write the announcement..."/></label>
   <button className="button" disabled={loading}>{loading?"Saving...":"Save Notice"}</button>
  </form></div>
  <div className="card"><h2>Notice Board</h2>{noticeList.length===0?<p className="muted">No notices yet.</p>:<div className="table-wrap"><table><thead><tr><th>Notice</th><th>Audience</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>{noticeList.map(n=><tr key={n.id}><td><strong>{n.title}</strong><div className="muted">{n.content.slice(0,90)}{n.content.length>90?"…":""}</div></td><td>{n.audience}</td><td>{n.publish_date}</td><td><span className="badge">{n.status}</span></td><td>{n.status==="draft"?<button className="button secondary" onClick={()=>updateNotice(n.id,"published")}>Publish</button>:n.status==="published"?<button className="button secondary" onClick={()=>updateNotice(n.id,"archived")}>Archive</button>:null}</td></tr>)}</tbody></table></div>}</div>
 </div>}
 {tab==="events"&&<div className="grid two">
  <div className="card"><h2>Create Event</h2><form onSubmit={addEvent} className="form-grid">
   <label>Event Title<input name="title" required placeholder="Annual Sports Day"/></label>
   <label>Date<input type="date" name="event_date" required/></label>
   <label>Start Time<input type="time" name="start_time"/></label><label>End Time<input type="time" name="end_time"/></label>
   <label>Location<input name="location" placeholder="School Ground"/></label>
   <label style={{gridColumn:"1/-1"}}>Description<textarea name="description" rows={5} placeholder="Event details..."/></label>
   <button className="button" disabled={loading}>{loading?"Saving...":"Create Event"}</button>
  </form></div>
  <div className="card"><h2>Upcoming Events</h2>{eventList.length===0?<p className="muted">No events yet.</p>:<div className="table-wrap"><table><thead><tr><th>Event</th><th>Date</th><th>Time</th><th>Location</th><th>Status</th></tr></thead><tbody>{eventList.map(ev=><tr key={ev.id}><td><strong>{ev.title}</strong><div className="muted">{ev.description||""}</div></td><td>{ev.event_date}</td><td>{ev.start_time||"—"}{ev.end_time?" – "+ev.end_time:""}</td><td>{ev.location||"—"}</td><td><select value={ev.status} onChange={e=>updateEvent(ev.id,e.target.value)}><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody></table></div>}</div>
 </div>}
 </div>;
}