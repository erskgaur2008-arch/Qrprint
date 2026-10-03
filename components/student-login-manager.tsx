"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StudentLoginManager({ studentId, studentName, currentLogin, currentEmail }: { studentId:string; studentName:string; currentLogin:boolean; currentEmail?:string|null }) {
  const [open,setOpen]=useState(false),[email,setEmail]=useState(currentEmail??""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
  async function createLogin(){
    if(!email.trim()||password.length<8){setMsg("Email and password (minimum 8 characters) are required.");return}
    setBusy(true);setMsg("");
    const {data,error}=await createClient().functions.invoke("create-student-login",{body:{student_id:studentId,email:email.trim().toLowerCase(),password}});
    if(error||data?.error){setMsg(data?.error||error?.message||"Could not create login.");setBusy(false);return}
    setMsg("Student login created successfully.");setPassword("");setBusy(false);
  }
  if(currentLogin) return <span className="badge">Login linked</span>;
  return <><button className="button" onClick={()=>setOpen(true)}>Create Login</button>{open&&<div className="modal-backdrop"><div className="modal-card"><h2>Create Student Login</h2><p className="muted">{studentName}</p><label className="field"><span>Login Email</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label className="field"><span>Temporary Password</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8}/></label>{msg&&<div className={msg.includes("successfully")?"success":"error"}>{msg}</div>}<div className="settings-actions"><button className="button" onClick={()=>setOpen(false)} disabled={busy}>Cancel</button><button className="button primary" onClick={createLogin} disabled={busy}>{busy?"Creating…":"Create Login"}</button></div></div></div>}</>;
}