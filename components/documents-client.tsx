"use client";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
type Doc={id:string;owner_type:string;category:string;file_name:string;storage_path:string;mime_type:string;size_bytes:number;created_at:string};
export default function DocumentsClient({schoolId,userId,initial}:{schoolId:string;userId:string;initial:Doc[]}) {
 const [docs,setDocs]=useState(initial),[busy,setBusy]=useState(false),[msg,setMsg]=useState(""),ref=useRef<HTMLInputElement>(null);
 async function upload(e:React.ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0]; if(!file)return;
  if(file.size>10*1024*1024){setMsg("Maximum file size is 10 MB.");return}
  setBusy(true);setMsg(""); const sb=createClient(); const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_"); const path=schoolId+"/general/"+crypto.randomUUID()+"-"+safe;
  const up=await sb.storage.from("school-documents").upload(path,file,{contentType:file.type||"application/octet-stream",upsert:false});
  if(up.error){setMsg("Upload failed: "+up.error.message);setBusy(false);return}
  const ins=await sb.from("documents").insert({school_id:schoolId,owner_type:"school",owner_id:schoolId,category:"general",file_name:file.name,storage_path:path,mime_type:file.type||null,size_bytes:file.size,uploaded_by:userId}).select("id,owner_type,category,file_name,storage_path,mime_type,size_bytes,created_at").single();
  if(ins.error){await sb.storage.from("school-documents").remove([path]);setMsg("Could not save document record: "+ins.error.message);setBusy(false);return}
  setDocs(x=>[ins.data,...x]);setMsg("Document uploaded.");setBusy(false);if(ref.current)ref.current.value="";
 }
 async function download(d:Doc){const {data,error}=await createClient().storage.from("school-documents").createSignedUrl(d.storage_path,300);if(error||!data?.signedUrl){setMsg("Could not create secure download link.");return}window.open(data.signedUrl,"_blank","noopener,noreferrer")}
 async function remove(d:Doc){if(!confirm("Delete this document?"))return;setBusy(true);const sb=createClient();const r=await sb.storage.from("school-documents").remove([d.storage_path]);if(r.error){setMsg(r.error.message);setBusy(false);return}const x=await sb.from("documents").delete().eq("id",d.id);if(x.error){setMsg(x.error.message);setBusy(false);return}setDocs(v=>v.filter(a=>a.id!==d.id));setMsg("Document deleted.");setBusy(false)}
 return <div><div className="card"><h2>Upload Document</h2><p className="muted">Secure school documents. PDF, Word, Excel and common images up to 10 MB.</p><input ref={ref} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp" onChange={upload} disabled={busy}/>{msg&&<div className={msg.includes("failed")||msg.includes("Could not")?"error":"success"} style={{marginTop:12}}>{msg}</div>}</div><div className="card" style={{marginTop:16}}><h2>Document Library</h2>{!docs.length?<p className="muted">No documents uploaded yet.</p>:<div className="table-wrap"><table className="data-table"><thead><tr><th>File</th><th>Category</th><th>Size</th><th>Uploaded</th><th>Actions</th></tr></thead><tbody>{docs.map(d=><tr key={d.id}><td><strong>{d.file_name}</strong></td><td>{d.category}</td><td>{Math.max(1,Math.round(d.size_bytes/1024))} KB</td><td>{new Date(d.created_at).toLocaleString("en-IN")}</td><td><button className="button" onClick={()=>download(d)}>View / Download</button> <button className="button" onClick={()=>remove(d)} disabled={busy}>Delete</button></td></tr>)}</tbody></table></div>}</div></div>
}