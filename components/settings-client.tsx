"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SettingsFieldProps = {
 label: string;
 k: string;
 area?: boolean;
 source: any;
 setter: (updater: any) => void;
};

function SettingsField({label,k,area=false,source,setter}:SettingsFieldProps){
 const handleFocus=(e:React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
  if(typeof window!=="undefined" && window.innerWidth<=700){
   const target=e.currentTarget;
   window.setTimeout(()=>target.scrollIntoView({block:"center",inline:"nearest"}),180);
  }
 };
 return <label className="field"><span>{label}</span>{area?
  <textarea value={source?.[k]||""} onFocus={handleFocus} onChange={e=>setter((x:any)=>({...x,[k]:e.target.value}))}/>: 
  <input value={source?.[k]||""} onFocus={handleFocus} onChange={e=>setter((x:any)=>({...x,[k]:e.target.value}))}/>}</label>;
}

export default function SettingsClient({schoolId,school,branding,settings}:any){
 const supabase=createClient();
 const [profile,setProfile]=useState({...school});
 const [brand,setBrand]=useState({...branding});
 const [config,setConfig]=useState({...settings});
 const [saving,setSaving]=useState(false); const [msg,setMsg]=useState("");
 const Field=SettingsField;
 async function save(){
  setSaving(true);setMsg("");
  const {error:e1}=await supabase.from("schools").update({name:profile.name,slug:profile.slug,address:profile.address,city:profile.city,state:profile.state,country:profile.country,phone:profile.phone,email:profile.email}).eq("id",schoolId);
  const {error:e2}=await supabase.from("school_branding").upsert({school_id:schoolId,logo_url:brand.logo_url||null,favicon_url:brand.favicon_url||null,primary_color:brand.primary_color,secondary_color:brand.secondary_color,accent_color:brand.accent_color});
  const {error:e3}=await supabase.from("school_settings").upsert({...config,school_id:schoolId});
  setSaving(false); setMsg(e1||e2||e3 ? (e1||e2||e3)!.message : "Settings saved successfully.");
 }
 return <div>
  <div className="card"><h2>School Profile</h2><div className="form-grid">
   <Field label="School Name" k="name" source={profile} setter={setProfile}/><Field label="School Code / Slug" k="slug" source={profile} setter={setProfile}/><Field label="Address" k="address" source={profile} setter={setProfile}/><Field label="City" k="city" source={profile} setter={setProfile}/><Field label="State" k="state" source={profile} setter={setProfile}/><Field label="Country" k="country" source={profile} setter={setProfile}/><Field label="Phone" k="phone" source={profile} setter={setProfile}/><Field label="Email" k="email" source={profile} setter={setProfile}/><Field label="Website" k="website" source={config} setter={setConfig}/><Field label="Principal / Head" k="principal_name" source={config} setter={setConfig}/><Field label="School Description" k="description" area source={config} setter={setConfig}/>
  </div></div>
  <div className="card"><h2>Branding</h2><div className="form-grid"><Field label="Logo URL" k="logo_url" source={brand} setter={setBrand}/><Field label="Favicon URL" k="favicon_url" source={brand} setter={setBrand}/><Field label="Primary Color" k="primary_color" source={brand} setter={setBrand}/><Field label="Secondary Color" k="secondary_color" source={brand} setter={setBrand}/><Field label="Accent Color" k="accent_color" source={brand} setter={setBrand}/></div><div className="brand-preview" style={{background:brand.primary_color||"#173B63"}}><div><strong>{profile.name||"School Name"}</strong><span>{config.description||"SchoolConnect"}</span></div><div className="color-chip" style={{background:brand.accent_color||"#E7B84B"}}>Preview</div></div></div>
  <div className="card"><h2>Academic & System Settings</h2><div className="form-grid"><Field label="Timezone" k="timezone" source={config} setter={setConfig}/><Field label="Currency" k="currency" source={config} setter={setConfig}/><Field label="Date Format" k="date_format" source={config} setter={setConfig}/><Field label="Language" k="language" source={config} setter={setConfig}/><Field label="Attendance Start" k="attendance_start" source={config} setter={setConfig}/><Field label="Attendance End" k="attendance_end" source={config} setter={setConfig}/><Field label="Grading System" k="grading_system" source={config} setter={setConfig}/><Field label="Admission Number Prefix" k="admission_number_prefix" source={config} setter={setConfig}/><Field label="Receipt Number Prefix" k="receipt_number_prefix" source={config} setter={setConfig}/></div></div>
  <div className="card"><h2>Current School Preview</h2><p><strong>{profile.name}</strong></p><p className="muted">{profile.address}, {profile.city}, {profile.state}, {profile.country}</p><p className="muted">{profile.phone||"No phone"} · {profile.email||"No email"}</p></div>
  <div className="settings-actions"><button className="button primary" disabled={saving} onClick={save}>{saving?"Saving...":"Save All Settings"}</button>{msg&&<span className="save-message">{msg}</span>}</div>
 </div>;
}
