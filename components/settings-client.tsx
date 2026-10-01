"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsClient({schoolId,school,branding,settings}:any){
 const supabase=createClient();
 const [profile,setProfile]=useState({...school});
 const [brand,setBrand]=useState({...branding});
 const [config,setConfig]=useState({...settings});
 const [saving,setSaving]=useState(false); const [msg,setMsg]=useState("");
 const set=(setter:any,key:string)=>(e:any)=>setter((x:any)=>({...x,[key]:e.target.value}));
 async function save(){
  setSaving(true);setMsg("");
  const {error:e1}=await supabase.from("schools").update({name:profile.name,slug:profile.slug,address:profile.address,city:profile.city,state:profile.state,country:profile.country,phone:profile.phone,email:profile.email}).eq("id",schoolId);
  const {error:e2}=await supabase.from("school_branding").upsert({school_id:schoolId,logo_url:brand.logo_url||null,favicon_url:brand.favicon_url||null,primary_color:brand.primary_color,secondary_color:brand.secondary_color,accent_color:brand.accent_color});
  const {error:e3}=await supabase.from("school_settings").upsert({...config,school_id:schoolId});
  setSaving(false); setMsg(e1||e2||e3 ? (e1||e2||e3)!.message : "Settings saved successfully.");
 }
 const Field=({label,k,area=false,source=profile}:any)=><label className="field"><span>{label}</span>{area?<textarea value={source[k]||""} onChange={set(source===profile?setProfile:setConfig,k)}/>:<input value={source[k]||""} onChange={set(source===profile?setProfile:setConfig,k)}/>}</label>;
 return <div>
  <div className="card"><h2>School Profile</h2><div className="form-grid">
   <Field label="School Name" k="name"/><Field label="School Code / Slug" k="slug"/><Field label="Address" k="address"/><Field label="City" k="city"/><Field label="State" k="state"/><Field label="Country" k="country"/><Field label="Phone" k="phone"/><Field label="Email" k="email"/><Field label="Website" k="website" source={config}/><Field label="Principal / Head" k="principal_name" source={config}/><Field label="School Description" k="description" area source={config}/>
  </div></div>
  <div className="card"><h2>Branding</h2><div className="form-grid"><Field label="Logo URL" k="logo_url" source={brand}/><Field label="Favicon URL" k="favicon_url" source={brand}/><Field label="Primary Color" k="primary_color" source={brand}/><Field label="Secondary Color" k="secondary_color" source={brand}/><Field label="Accent Color" k="accent_color" source={brand}/></div><div className="brand-preview" style={{background:brand.primary_color||"#173B63"}}><div><strong>{profile.name||"School Name"}</strong><span>{config.description||"SchoolConnect"}</span></div><div className="color-chip" style={{background:brand.accent_color||"#E7B84B"}}>Preview</div></div></div>
  <div className="card"><h2>Academic & System Settings</h2><div className="form-grid"><Field label="Timezone" k="timezone" source={config}/><Field label="Currency" k="currency" source={config}/><Field label="Date Format" k="date_format" source={config}/><Field label="Language" k="language" source={config}/><Field label="Attendance Start" k="attendance_start" source={config}/><Field label="Attendance End" k="attendance_end" source={config}/><Field label="Grading System" k="grading_system" source={config}/><Field label="Admission Number Prefix" k="admission_number_prefix" source={config}/><Field label="Receipt Number Prefix" k="receipt_number_prefix" source={config}/></div></div>
  <div className="card"><h2>Current School Preview</h2><p><strong>{profile.name}</strong></p><p className="muted">{profile.address}, {profile.city}, {profile.state}, {profile.country}</p><p className="muted">{profile.phone||"No phone"} · {profile.email||"No email"}</p></div>
  <div className="settings-actions"><button className="button primary" disabled={saving} onClick={save}>{saving?"Saving...":"Save All Settings"}</button>{msg&&<span className="save-message">{msg}</span>}</div>
 </div>;
}
