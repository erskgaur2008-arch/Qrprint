"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Exam = { id:string; name:string; exam_type:string; start_date:string; end_date:string; status:string };
type Schedule = { id:string; exam_id:string; class_id:string|null; section_id:string|null; subject_id:string; exam_date:string; start_time:string|null; duration_minutes:number; max_marks:number };
type Item = { id:string; name:string; display_order?:number; class_id?:string; code?:string|null };
type Student = { id:string; name:string; admission_no:string|null; class_id:string|null; section_id:string|null; class_name:string|null; section:string|null; status:string };
type Mark = { id:string; exam_schedule_id:string; student_id:string; marks:number; grade:string|null; remarks:string|null };

function gradeFor(p:number){ if(p>=90)return "A+"; if(p>=80)return "A"; if(p>=70)return "B+"; if(p>=60)return "B"; if(p>=50)return "C"; if(p>=40)return "D"; return "F"; }

export default function ExamsClient({schoolId, exams, schedules, classes, sections, subjects, students, marks, userId}:{schoolId:string; exams:Exam[]; schedules:Schedule[]; classes:Item[]; sections:Item[]; subjects:Item[]; students:Student[]; marks:Mark[]; userId:string}){
 const supabase=createClient();
 const [tab,setTab]=useState<"exams"|"schedule"|"marks"|"results">("exams");
 const [examList,setExamList]=useState(exams); const [scheduleList,setScheduleList]=useState(schedules); const [markList,setMarkList]=useState(marks);
 const [selectedExam,setSelectedExam]=useState(exams[0]?.id||""); const [selectedSchedule,setSelectedSchedule]=useState(schedules[0]?.id||""); const [scheduleClassId,setScheduleClassId]=useState(""); const [scheduleSectionId,setScheduleSectionId]=useState("");
 const [loading,setLoading]=useState(false); const [message,setMessage]=useState("");

 const examSchedules=useMemo(()=>scheduleList.filter(x=>x.exam_id===selectedExam),[scheduleList,selectedExam]);
 const activeSchedule=scheduleList.find(x=>x.id===selectedSchedule);
 const className=(id:string|null)=>classes.find(x=>x.id===id)?.name||"All Classes";
 const sectionName=(id:string|null)=>sections.find(x=>x.id===id)?.name||"All Sections";
 const subjectName=(id:string)=>subjects.find(x=>x.id===id)?.name||"Subject";
 const normalize=(v:string|null|undefined)=> (v??"").trim().toLowerCase().replace(/\\s+/g," ");
 const examStudents=useMemo(()=>{
  if(!activeSchedule)return [];
  return students
   .filter(s=>["active","admitted","promoted"].includes(normalize(s.status)))
   .filter(s=>!activeSchedule.class_id || s.class_id===activeSchedule.class_id)
   .filter(s=>!activeSchedule.section_id || s.section_id===activeSchedule.section_id)
   .sort((a,b)=>a.name.localeCompare(b.name));
 },[activeSchedule,students]);
 const getMark=(studentId:string)=>markList.find(m=>m.exam_schedule_id===selectedSchedule&&m.student_id===studentId);

 async function createExam(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault(); setLoading(true); setMessage("");
  const f=new FormData(e.currentTarget);
  const payload={school_id:schoolId,academic_year_id:null,name:String(f.get("name")),exam_type:String(f.get("exam_type")),start_date:String(f.get("start_date")),end_date:String(f.get("end_date")),status:"draft",created_by:userId};
  const {data,error}=await supabase.from("exams").insert(payload).select("id,name,exam_type,start_date,end_date,status").single();
  if(error)setMessage(error.message); else if(data){setExamList([data,...examList]);setSelectedExam(data.id);e.currentTarget.reset();setMessage("Exam created successfully.");}
  setLoading(false);
 }
 async function createSchedule(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(!selectedExam){setMessage("Select an exam first.");return;}
  setLoading(true);setMessage("");
  const form=e.currentTarget;
  const f=new FormData(form);
  const classId=String(f.get("class_id")||"").trim();
  const sectionId=String(f.get("section_id")||"").trim();
  const subjectId=String(f.get("subject_id")||"").trim();
  const examDate=String(f.get("exam_date")||"").trim();
  const startTime=String(f.get("start_time")||"").trim();
  if(!classId||!subjectId||!examDate){setMessage("Please select Class, Subject and Exam Date.");setLoading(false);return;}
  const payload={school_id:schoolId,exam_id:selectedExam,class_id:classId,section_id:sectionId||null,subject_id:subjectId,exam_date:examDate,start_time:startTime||null,duration_minutes:Number(f.get("duration_minutes")||120),max_marks:Number(f.get("max_marks")||80)};
  try{
   const {data,error}=await supabase.from("exam_schedules").insert(payload).select("id,exam_id,class_id,section_id,subject_id,exam_date,start_time,duration_minutes,max_marks").single();
   if(error){setMessage("Could not save schedule: "+error.message);return;}
   if(data){setScheduleList(prev=>[...prev,data]);setSelectedSchedule(data.id);form.reset();setScheduleClassId("");setScheduleSectionId("");setMessage("Subject schedule added successfully.");}
  }catch(error){setMessage("Could not save schedule. Please try again.");}
  finally{setLoading(false);}
 }
 async function saveMark(studentId:string,value:string){
  if(!activeSchedule)return;
  const max=Number(activeSchedule.max_marks); const num=Math.min(Math.max(Number(value)||0,max),max); const grade=gradeFor((num/max)*100); const existing=getMark(studentId);
  const payload={school_id:schoolId,exam_schedule_id:activeSchedule.id,student_id:studentId,marks:num,grade,entered_by:userId,updated_at:new Date().toISOString()};
  if(existing){const {data,error}=await supabase.from("exam_marks").update(payload).eq("id",existing.id).select("id,exam_schedule_id,student_id,marks,grade,remarks").single(); if(error)setMessage(error.message); else if(data)setMarkList(prev=>prev.map(x=>x.id===existing.id?data as Mark:x));}
  else {const {data,error}=await supabase.from("exam_marks").insert(payload).select("id,exam_schedule_id,student_id,marks,grade,remarks").single(); if(error)setMessage(error.message); else if(data)setMarkList(prev=>[...prev,data as Mark]);}
 }
 async function generateResults(){
  if(!selectedExam)return; setLoading(true);setMessage("");
  const examSchedules=scheduleList.filter(s=>s.exam_id===selectedExam); const examMark=markList.filter(m=>examSchedules.some(s=>s.id===m.exam_schedule_id)); const studentIds=[...new Set(examMark.map(m=>m.student_id))];
  for(const sid of studentIds){
   const rows=examMark.filter(m=>m.student_id===sid); const total=rows.reduce((a,m)=>a+Number(m.marks),0); const max=examSchedules.filter(s=>rows.some(r=>r.exam_schedule_id===s.id)).reduce((a,s)=>a+Number(s.max_marks),0); const pct=max?Number(((total/max)*100).toFixed(2)):0;
   await supabase.from("report_cards").upsert({school_id:schoolId,exam_id:selectedExam,student_id:sid,total_marks:total,max_marks:max,percentage:pct,overall_grade:gradeFor(pct),status:"draft",generated_by:userId,updated_at:new Date().toISOString()},{onConflict:"exam_id,student_id"});
  }
  setMessage("Result summaries generated. Open Results to review them.");setLoading(false);setTab("results");
 }

 return <div>
  {message&&<div className="card" style={{marginBottom:16}}>{message}</div>}
  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
   <button className={tab==="exams"?"button":"button secondary"} onClick={()=>setTab("exams")}>Exam Setup</button>
   <button className={tab==="schedule"?"button":"button secondary"} onClick={()=>setTab("schedule")}>Subject Schedule</button>
   <button className={tab==="marks"?"button":"button secondary"} onClick={()=>setTab("marks")}>Marks Entry</button>
   <button className={tab==="results"?"button":"button secondary"} onClick={()=>setTab("results")}>Results / Report Cards</button>
  </div>

  {tab==="exams"&&<div className="grid two">
   <div className="card"><h2>Create Exam</h2><form onSubmit={createExam} className="form-grid">
    <label>Exam Name<input name="name" required placeholder="Half Yearly Examination"/></label>
    <label>Exam Type<select name="exam_type" defaultValue="half_yearly"><option value="periodic">Periodic</option><option value="unit_test">Unit Test</option><option value="half_yearly">Half Yearly</option><option value="annual">Annual</option><option value="custom">Custom</option></select></label>
    <label>Start Date<input type="date" name="start_date" required/></label><label>End Date<input type="date" name="end_date" required/></label>
    <button className="button" disabled={loading}>{loading?"Saving...":"Create Exam"}</button>
   </form></div>
   <div className="card"><h2>Exams</h2><div className="table-wrap"><table><thead><tr><th>Exam</th><th>Dates</th><th>Status</th></tr></thead><tbody>{examList.map(e=><tr key={e.id}><td><button className="link-button" onClick={()=>setSelectedExam(e.id)}>{e.name}</button><div className="muted">{e.exam_type}</div></td><td>{e.start_date} → {e.end_date}</td><td><span className="badge">{e.status}</span></td></tr>)}</tbody></table></div></div>
  </div>}

  {tab==="schedule"&&<div className="grid two">
   <div className="card"><h2>Add Subject Schedule</h2><label>Exam<select value={selectedExam} onChange={e=>setSelectedExam(e.target.value)}>{examList.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
   <form onSubmit={createSchedule} className="form-grid">
    <label>Class<select name="class_id" required value={scheduleClassId} onChange={e=>{setScheduleClassId(e.target.value);setScheduleSectionId("");}}><option value="">Select class</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Section<select name="section_id" required value={scheduleSectionId} onChange={e=>setScheduleSectionId(e.target.value)} disabled={!scheduleClassId}><option value="">{scheduleClassId?"Select section":"Select class first"}</option>{sections.filter(s=>s.class_id===scheduleClassId).filter((s,i,a)=>a.findIndex(x=>x.name.trim().toLowerCase()===s.name.trim().toLowerCase())===i).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <label>Subject<select name="subject_id" required><option value="">Select subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
    <label>Exam Date<input type="date" name="exam_date" required/></label><label>Start Time<input type="time" name="start_time"/></label>
    <label>Duration (minutes)<input name="duration_minutes" type="number" defaultValue="120" min="15"/></label><label>Maximum Marks<input name="max_marks" type="number" defaultValue="80" min="1"/></label>
    <button className="button" disabled={loading}>{loading?"Saving...":"Add Schedule"}</button>
   </form></div>
   <div className="card"><h2>{examList.find(e=>e.id===selectedExam)?.name||"Exam"} Schedule</h2>{examSchedules.length===0?<p className="muted">No subject schedules yet.</p>:<div className="table-wrap"><table><thead><tr><th>Date</th><th>Class</th><th>Subject</th><th>Marks</th></tr></thead><tbody>{examSchedules.map(s=><tr key={s.id}><td>{s.exam_date}</td><td>{className(s.class_id)} {s.section_id?"· "+sectionName(s.section_id):""}</td><td>{subjectName(s.subject_id)}</td><td>{s.max_marks}</td></tr>)}</tbody></table></div>}</div>
  </div>}

  {tab==="marks"&&<div className="card"><h2>Marks Entry</h2><label>Subject Schedule<select value={selectedSchedule} onChange={e=>setSelectedSchedule(e.target.value)}>{scheduleList.map(s=><option key={s.id} value={s.id}>{(examList.find(e=>e.id===s.exam_id)?.name||"Exam")+" · "+className(s.class_id)+" · "+subjectName(s.subject_id)+" · "+s.exam_date}</option>)}</select></label>
   {!activeSchedule?<p className="muted">Create a subject schedule first.</p>:examStudents.length===0?<div className="card" style={{marginTop:16}}><strong>No students found for this class/section.</strong><p className="muted">Schedule: {className(activeSchedule.class_id)}{activeSchedule.section_id?" · "+sectionName(activeSchedule.section_id):""}. Check the students' class and section.</p></div>:<div className="table-wrap"><table><thead><tr><th>Student</th><th>Admission No.</th><th>Marks / {activeSchedule.max_marks}</th><th>Grade</th></tr></thead><tbody>{examStudents.map(s=>{const m=getMark(s.id);return <tr key={s.id}><td>{s.name}</td><td>{s.admission_no||"—"}</td><td><input type="number" min="0" max={Number(activeSchedule.max_marks)} defaultValue={m?.marks??""} onBlur={e=>saveMark(s.id,e.target.value)} placeholder="Enter marks"/></td><td>{m?.grade||"—"}</td></tr>})}</tbody></table></div>}
  </div>}

  {tab==="results"&&<div className="card"><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><h2>Results & Report Cards</h2><p className="muted">Generate a student summary from entered marks.</p></div><button className="button" onClick={generateResults} disabled={loading||!selectedExam}>{loading?"Generating...":"Generate Results"}</button></div><ResultsTable schoolId={schoolId} examId={selectedExam} students={students} supabase={supabase}/></div>}
 </div>;
}

function ResultsTable({schoolId,examId,students,supabase}:{schoolId:string;examId:string;students:Student[];supabase:any}){
 const [rows,setRows]=useState<any[]>([]); const [loaded,setLoaded]=useState(false);
 if(!loaded&&examId){setLoaded(true);supabase.from("report_cards").select("id,student_id,total_marks,max_marks,percentage,overall_grade,status").eq("school_id",schoolId).eq("exam_id",examId).order("percentage",{ascending:false}).then(({data}:any)=>setRows(data||[]));}
 const map=new Map(students.map(s=>[s.id,s.name]));
 return <div className="table-wrap" style={{marginTop:16}}>{!examId?<p className="muted">Select an exam.</p>:rows.length===0?<p className="muted">No generated results yet. Enter marks, then click Generate Results.</p>:<table><thead><tr><th>Student</th><th>Total</th><th>%</th><th>Grade</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{map.get(r.student_id)||"Student"}</td><td>{r.total_marks} / {r.max_marks}</td><td>{r.percentage}%</td><td><strong>{r.overall_grade}</strong></td><td>{r.status}</td></tr>)}</tbody></table>}</div>;
}
