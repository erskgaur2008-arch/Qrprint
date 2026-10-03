import { createClient } from "@/lib/supabase/server";import { redirect } from "next/navigation";import SuperAdminClient from "@/components/super-admin-client";
export default async function SuperAdminPage(){
 const sb=await createClient();const{data:c}=await sb.auth.getClaims();const uid=c?.claims?.sub;if(!uid)redirect("/login");
 const{data:urs}=await sb.from("user_roles").select("role_id").eq("user_id",uid);const roleIds=(urs??[]).map(x=>x.role_id);
 const{data:roles}=roleIds.length?await sb.from("roles").select("id,name").in("id",roleIds):{data:[]};
 if(!(roles??[]).some(r=>r.name==="super_admin"))return <main className="content"><div className="card"><h1>Platform access restricted</h1><p className="muted">This area is available only to the super administrator role.</p></div></main>;
 const[{data:schools},{data:subs},{data:plans}]=await Promise.all([
  sb.from("schools").select("id,name,slug,address,city,state,phone,email,status,created_at").order("created_at",{ascending:false}),
  sb.from("subscriptions").select("id,school_id,plan_id,status,billing_cycle,trial_ends_at,current_period_start,current_period_end"),
  sb.from("subscription_plans").select("id,name,description,monthly_price,annual_price,max_students,max_staff,features,is_active").order("monthly_price")
 ]);
 return <main className="content"><div className="hero"><div><span className="landing-kicker">SaaS Control Center</span><h1>Super Admin</h1><p className="muted">Manage school tenants, subscription plans and subscriptions from one secure platform workspace.</p></div><span className="badge">Platform</span></div><SuperAdminClient initialSchools={schools??[]} initialPlans={plans??[]} initialSubscriptions={subs??[]}/></main>;
}