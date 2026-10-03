import {createClient} from "@/lib/supabase/server";import {redirect} from "next/navigation";
export default async function SuperAdminPage(){
 const sb=await createClient();const{data:c}=await sb.auth.getClaims();const uid=c?.claims?.sub;if(!uid)redirect("/login");
 const{data:urs}=await sb.from("user_roles").select("role_id").eq("user_id",uid);const roleIds=(urs??[]).map(x=>x.role_id);
 const{data:roles}=roleIds.length?await sb.from("roles").select("id,name").in("id",roleIds):{data:[]};
 if(!(roles??[]).some(r=>r.name==="super_admin"))return <main className="content"><div className="card"><h1>Platform access restricted</h1><p className="muted">This area is available only to the super administrator role.</p></div></main>;
 const[{data:schools},{data:subs},{data:plans}]=await Promise.all([
  sb.from("schools").select("id,name,slug,status,city,state,created_at").order("created_at",{ascending:false}),
  sb.from("subscriptions").select("school_id,plan_id,status,billing_cycle,trial_ends_at,current_period_end"),
  sb.from("subscription_plans").select("id,name,monthly_price,annual_price,max_students,max_staff,is_active").order("monthly_price")
 ]);
 const planMap=new Map((plans??[]).map(p=>[p.id,p]));const subMap=new Map((subs??[]).map(s=>[s.school_id,s]));
 const active=(schools??[]).filter(s=>s.status==="active").length;
 return <main className="content"><div className="hero"><div><span className="landing-kicker">SaaS Control Center</span><h1>Super Admin</h1><p className="muted">Platform-wide school and subscription administration.</p></div><span className="badge">Platform</span></div>
 <div className="cards"><div className="card"><div className="label">Schools</div><div className="value">{schools?.length??0}</div></div><div className="card"><div className="label">Active Schools</div><div className="value">{active}</div></div><div className="card"><div className="label">Subscriptions</div><div className="value">{subs?.length??0}</div></div><div className="card"><div className="label">Plans</div><div className="value">{plans?.length??0}</div></div></div>
 <div className="card" style={{marginTop:16}}><h2>School Tenants</h2><div className="table-wrap"><table className="data-table"><thead><tr><th>School</th><th>Location</th><th>Status</th><th>Plan</th><th>Billing</th><th>Subscription</th></tr></thead><tbody>{(schools??[]).map(s=>{const sub=subMap.get(s.id);const plan=sub?planMap.get(sub.plan_id):null;return <tr key={s.id}><td><strong>{s.name}</strong><div className="muted">{s.slug}</div></td><td>{s.city??""}{s.state?", "+s.state:""}</td><td><span className="badge">{s.status}</span></td><td>{plan?.name??"—"}</td><td>{sub?.billing_cycle??"—"}</td><td>{sub?.status??"—"}</td></tr>})}</tbody></table></div></div>
 <div className="card" style={{marginTop:16}}><h2>Subscription Plans</h2><div className="grid">{(plans??[]).map(p=><div className="card" key={p.id}><h3>{p.name}</h3><p className="muted">{p.max_students} students · {p.max_staff} staff</p><div className="row"><span>Monthly</span><strong>₹{Number(p.monthly_price).toLocaleString("en-IN")}</strong></div><div className="row"><span>Annual</span><strong>₹{Number(p.annual_price).toLocaleString("en-IN")}</strong></div><span className="badge">{p.is_active?"active":"inactive"}</span></div>)}</div></div></main>;
}