"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Item={id:string;class_id:string;section_id:string;subject_id:string;teacher_id:string|null;day_of_week:number;period_no:number;start_time:string;end_time:string;room:string|null;status:string};
type Ref={id:string;name:string;class_id?:string;employee_no?:string|null};

const days=[["1","Monday"],["2","Tuesday"],["3","Wednesday"],["4","Thursday"],["5","Friday"],["6","Saturday"]];

export default function TimetableClient({schoolId,userId,classes,sections,subjects,teachers,initial}:{schoolId:string;userId:string;classes:Ref[];sections:Ref[];subjects:Ref[];teachers:Ref[];initial:Item[]}){
 const supabase=createClient(); const [rows,setRows]=useState(initial); const [classId,setClassId]=useState(classes[0]?.id??""); const [sectionId,setSectionId]=useState(""); const [day,setDay]=useState(1); const [period,setPeriod]=useState(1); const [subjectId,setSubjectId]=useState(""); const [teacherId,setTeacherId]=useState(""); const [start,setStart]=useState("08:00"); const [end,setEnd]=useState("08:40"); const [room,setRoom]=useState(""); const [filterDay,setFilterDay]=useState(1); const [filterClass,setFilterClass]=useState("all"); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");

 const filteredSections=sections.filter(s=>s.class_id===classId);
 const visible=useMemo(()=>rows.filter(r=>(filterClass==="all"||r.class_id===filterClass)&&r.day_of_week===filterDay&&r.status==="active").sort((a,b)=>a.start_time.localeCompare(b.start_time)),[rows,filterClass,filterDay]);
 const cn=new Map(classes.map(x=>[x.id,x.name])), sn=new Map(sections.map(x=>[x.id,x.name])), subn=new Map(subjects.map(x=>[x.id,x.name])), tn=new Map(teachers.map(x=>[x.id,x.name]));
 async function add(){
   if(!classId||!sectionId||!subjectId||!start||!end){setMessage("Select class, section, subject and time.");return}
   if(end<=start){setMessage("End time must be after start time.");return}
   const conflict=rows.find(r=>r.status==="active"&&r.day_of_week===day&&r.start_time<end&&r.end_time>start&&((r.class_id===classId&&r.section_id===sectionId)||(teacherId&&r.teacher_id===teacherId)));
   if(conflict){setMessage("Timetable conflict: this class/section or teacher is already scheduled in this time.");return}
   setBusy(true);setMessage("");
   const {data,error}=await supabase.from("timetables").insert({school_id:schoolId,class_id:classId,section_id:sectionId,subject_id:subjectId,teacher_id:teacherId||null,day_of_week:day,period_no:period,start_time:start,end_time:end,room:room||null,created_by:userId}).select("*").single();
   if(error)setMessage(error.message); else {setRows(v=>[...v,data]);setMessage("Timetable period added.");}
   setBusy(false);
 }
 async function remove(id:string){setBusy(true);const {error}=await supabase.from("timetables").update({status:"cancelled"}).eq("id",id);if(!error)setRows(v=>v.map(x=>x.id===id?{...x,status:"cancelled"}:x));else setMessage(error.message);setBusy(false)}
 return <div>
  <div className="grid">
   <div className="card"><h2>Add Period</h2><div className="form-grid">
    <label>Class<select value={classId} onChange={e=>{setClassId(e.target.value);setSectionId("")}}>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Section<select value={sectionId} onChange={e=>setSectionId(e.target.value)}><option value="">Select section</option>{filteredSections.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <label>Day<select value={day} onChange={e=>setDay(Number(e.target.value))}>{days.map(d=><option key={d[0]} value={d[0]}>{d[1]}</option>)}</select></label>
    <label>Period<select value={period} onChange={e=>setPeriod(Number(e.target.value))}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
    <label>Subject<select value={subjectId} onChange={e=>setSubjectId(e.target.value)}><option value="">Select subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <label>Teacher<select value={teacherId} onChange={e=>setTeacherId(e.target.value)}><option value="">Unassigned</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}{t.employee_no?" · "+t.employee_no:""}</option>)}</select></label>
    <label>Start<input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label><label>End<input type="time" value={end} onChange={e=>setEnd(e.target.value)}/></label><label>Room<input value={room} onChange={e=>setRoom(e.target.value)} placeholder="e.g. Room 1"/></label>
   </div><button className="button" disabled={busy} onClick={add}>{busy?"Saving…":"Add Period"}</button>{message&&<p className={message.includes("added")?"success":"error"}>{message}</p>}</div>
   <div className="card"><h2>Weekly View</h2><div className="form-grid"><label>Class<select value={filterClass} onChange={e=>setFilterClass(e.target.value)}><option value="all">All classes</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Day<select value={filterDay} onChange={e=>setFilterDay(Number(e.target.value))}>{days.map(d=><option key={d[0]} value={d[0]}>{d[1]}</option>)}</select></label></div><p className="muted">{visible.length} periods</p>{visible.map(r=><div className="row" key={r.id}><div><strong>{r.start_time.slice(0,5)}–{r.end_time.slice(0,5)} · {subn.get(r.subject_id)??"Subject"}</strong><div className="muted">{cn.get(r.class_id)} · {sn.get(r.section_id)} · {tn.get(r.teacher_id??"")??"No teacher"}{r.room?" · "+r.room:""}</div></div><button className="button secondary" disabled={busy} onClick={()=>remove(r.id)}>Remove</button></div>)}</div>
  </div>
 </div>
}