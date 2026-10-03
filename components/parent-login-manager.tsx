"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ParentLoginManager({ parentId, parentName, currentEmail, hasLogin, onDone }: { parentId:string; parentName:string; currentEmail?:string|null; hasLogin:boolean; onDone?:()=>void }) {
  const [open,setOpen]=useState(false),[email,setEmail]=useState(currentEmail??""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
  async function createLogin(){
    if(!email.trim()||password.length<8){setMsg("Email and password (minimum 8 characters) are required.");return}
    setBusy(true);setMsg("");
    const {data,error}=await createClient().functions.invoke("create-parent-login",{body:{parent_id:parentId,email:email.trim().toLowerCase(),password}});
    if(error||data?.error){setMsg(data?.error||error?.message||"Could not create login.");setBusy(false);return}
    setMsg("Parent login created successfully.");
    setPassword(""); setBusy(false); onDone?.();
  }
  if(hasLogin) return <span className="badge">Login linked</span>;
  return <><button className="button" onClick={()=>setOpen(true)}>Create Login</button>{open&&<div className="modal-backdrop"><div className="modal-card"><h2>Create Parent Login</h2><p className="muted">{parentName}</p><label className="field"><span>Login Email</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label className="field"><span>Temporary Password</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8}/></label>{msg&&<div className={msg.includes("successfully")?"success":"error"}>{msg}</div>}<div className="settings-actions"><button className="button" onClick={()=>setOpen(false)} disabled={busy}>Cancel</button><button className="button primary" onClick={createLogin} disabled={busy}>{busy?"Creating…":"Create Login"}</button></div></div></div>}</>;
}