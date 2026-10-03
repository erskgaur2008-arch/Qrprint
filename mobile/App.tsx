import React, { useEffect, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Linking, RefreshControl
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, Session } from "@supabase/supabase-js";

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const db = createClient(URL, KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }
});

type Role = "school_admin" | "teacher" | "parent" | "student" | "super_admin" | "user";
type Screen = "home"|"students"|"staff"|"admissions"|"attendance"|"fees"|"academics"|"homework"|"results"|"timetable"|"notices"|"reports"|"communication"|"documents"|"leave"|"settings"|"schools"|"subscriptions";

const C = { navy:"#173B63", blue:"#245EA8", gold:"#E7B84B", bg:"#F7F9FC", text:"#172033", muted:"#667085", border:"#E4E7EC", green:"#16845B", red:"#D64545", white:"#FFFFFF" };
const names:Record<string,string> = {
 home:"Dashboard",students:"Students",staff:"Teachers & Staff",admissions:"Admissions",attendance:"Attendance",
 fees:"Fees",academics:"Academics",homework:"Homework",results:"Exams & Results",timetable:"Timetable",
 notices:"Notices & Events",reports:"Reports",communication:"Messages",documents:"Documents",leave:"Leave",
 settings:"Settings",schools:"Schools",subscriptions:"Subscriptions"
};
const roleScreens:Record<string,Screen[]> = {
 parent:["home","attendance","fees","homework","results","timetable","notices","leave","communication"],
 student:["home","attendance","fees","homework","results","timetable","notices","leave","communication"],
 teacher:["home","students","attendance","homework","results","timetable","leave","communication"],
 school_admin:["home","students","staff","admissions","attendance","fees","academics","homework","results","timetable","notices","reports","communication","documents","leave","settings"],
 super_admin:["home","schools","subscriptions","reports","communication"]
};
function err(e:any){ return e && e.message ? e.message : "Something went wrong."; }
function money(v:any){ return "₹" + Number(v || 0).toLocaleString("en-IN"); }
function dateNow(){ return new Date().toISOString().slice(0,10); }
function Button(p:{title:string,onPress:()=>void,secondary?:boolean,danger?:boolean,disabled?:boolean}) {
 return <TouchableOpacity disabled={p.disabled} onPress={p.onPress} style={[S.button,p.secondary&&S.secondary,p.danger&&S.danger,p.disabled&&S.disabled]}>
  <Text style={[S.buttonText,p.secondary&&S.secondaryText]}>{p.title}</Text>
 </TouchableOpacity>;
}
function Input(p:{label:string,value:string,onChangeText:(v:string)=>void,placeholder?:string,multiline?:boolean,secure?:boolean}) {
 return <View style={{marginBottom:11}}><Text style={S.label}>{p.label}</Text><TextInput value={p.value} onChangeText={p.onChangeText} placeholder={p.placeholder} secureTextEntry={p.secure} multiline={p.multiline} style={[S.input,p.multiline&&S.multi]}/></View>;
}
function Card(p:any){ return <View style={S.card}>{p.children}</View>; }
function Stat(p:any){ return <View style={S.statBox}><Text style={S.stat}>{String(p.value)}</Text><Text style={S.muted}>{p.label}</Text></View>; }

export default function App(){
 const [session,setSession]=useState<Session|null>(null),[role,setRole]=useState<Role>("user"),[schoolId,setSchoolId]=useState(""),[school,setSchool]=useState<any>(null),[loading,setLoading]=useState(true),[screen,setScreen]=useState<Screen>("home"),[tick,setTick]=useState(0);
 async function identity(s:Session|null){
  if(!s){setSession(null);setRole("user");setSchoolId("");setSchool(null);return;}
  setSession(s);
  const ur=await db.from("user_roles").select("role_id, roles(name)").eq("user_id",s.user.id).limit(1).maybeSingle();
  const r=((ur.data as any)?.roles?.name || "user") as Role; setRole(r);
  const su=await db.from("school_users").select("school_id").eq("user_id",s.user.id).limit(1).maybeSingle();
  const sid=su.data?.school_id || ""; setSchoolId(sid);
  if(sid){const sc=await db.from("schools").select("id,name,slug,address,city,state,phone,email,status").eq("id",sid).maybeSingle();setSchool(sc.data);}
 }
 useEffect(()=>{db.auth.getSession().then(async x=>{await identity(x.data.session);setLoading(false);});const a=db.auth.onAuthStateChange((_e,s)=>{identity(s);});return()=>a.data.subscription.unsubscribe();},[]);
 if(loading)return <SafeAreaView style={S.safe}><ActivityIndicator size="large" color={C.blue}/></SafeAreaView>;
 if(!session)return <Login onLogin={identity}/>;
 const allowed=roleScreens[role]||roleScreens.student;
 const go=(x:Screen)=>setScreen(x);
 return <SafeAreaView style={S.safe}>
  <View style={S.header}><View style={{flex:1}}><Text style={S.headerTitle}>{school?.name || "SchoolConnect"}</Text><Text style={S.headerSub}>{names[screen]} · {role.replace("_"," ")}</Text></View><TouchableOpacity onPress={()=>db.auth.signOut()}><Text style={S.logout}>Logout</Text></TouchableOpacity></View>
  <ScrollView style={{flex:1}} contentContainerStyle={S.content} refreshControl={<RefreshControl refreshing={false} onRefresh={()=>setTick(tick+1)}/>}>
   {screen==="home" ? <Home role={role} school={school} nav={go} tick={tick}/> : <Page screen={screen} role={role} schoolId={schoolId} userId={session.user.id} tick={tick}/>}
  </ScrollView>
  <View style={S.bottom}>{allowed.slice(0,5).map(x=><TouchableOpacity key={x} style={S.tab} onPress={()=>go(x)}><Text style={[S.tabText,screen===x&&S.tabActive]}>{names[x]}</Text></TouchableOpacity>)}</View>
 </SafeAreaView>;
}

function Login({onLogin}:{onLogin:(s:Session|null)=>Promise<void>}){
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function sign(){setBusy(true);setError("");const x=await db.auth.signInWithPassword({email:email.trim(),password});if(x.error)setError(err(x.error));else await onLogin(x.data.session);setBusy(false);}
 return <SafeAreaView style={S.safe}><ScrollView contentContainerStyle={S.login}><Card><Text style={S.logo}>🎓</Text><Text style={S.title}>SchoolConnect</Text><Text style={S.muted}>Secure mobile school portal</Text><Input label="Email" value={email} onChangeText={setEmail} placeholder="name@school.com"/><Input label="Password" value={password} onChangeText={setPassword} secure placeholder="Password"/>{error?<Text style={S.error}>{error}</Text>:null}<Button title={busy?"Signing in…":"Sign in"} onPress={sign} disabled={busy}/><Text style={S.muted}>Your mobile login uses the same Supabase account as the web portal.</Text></Card></ScrollView></SafeAreaView>;
}

function Home({role,school,nav,tick}:{role:Role,school:any,nav:(x:Screen)=>void,tick:number}){
 const [stats,setStats]=useState<any>({});
 useEffect(()=>{(async()=>{if(!school?.id)return;const a=await db.from("students").select("id",{count:"exact",head:true}).eq("school_id",school.id);const b=await db.from("staff").select("id",{count:"exact",head:true}).eq("school_id",school.id);const c=await db.from("student_fees").select("amount,discount").eq("school_id",school.id);const d=await db.from("student_attendance").select("status").eq("school_id",school.id).eq("attendance_date",dateNow());const e=await db.from("notifications").select("id",{count:"exact",head:true}).eq("school_id",school.id).eq("status","published");setStats({students:a.count||0,staff:b.count||0,fees:(c.data||[]).reduce((n,r)=>n+Number(r.amount||0)-Number(r.discount||0),0),attendance:(d.data||[]).length,notifications:e.count||0});})()},[school?.id,tick]);
 return <View><Text style={S.pageTitle}>Dashboard</Text><Text style={S.muted}>{school?.address ? school.address+", "+(school.city||"") : "Your school workspace"}</Text>
  <View style={S.stats}>{role==="parent"||role==="student"?<><Stat label="Published messages" value={stats.notifications||0}/><Stat label="Today attendance rows" value={stats.attendance||0}/></>:<><Stat label="Students" value={stats.students||0}/><Stat label="Staff" value={stats.staff||0}/><Stat label="Fee billed" value={money(stats.fees)}/><Stat label="Today attendance" value={stats.attendance||0}/></>}</View>
  <Text style={S.section}>Quick access</Text><View style={S.grid}>{(roleScreens[role]||roleScreens.student).filter(x=>x!=="home").map(x=><TouchableOpacity key={x} style={S.tile} onPress={()=>nav(x)}><Text style={S.icon}>{icon(x)}</Text><Text style={S.tileText}>{names[x]}</Text></TouchableOpacity>)}</View>
 </View>;
}
function icon(x:string){const m:any={students:"👨‍🎓",staff:"👩‍🏫",attendance:"✓",fees:"₹",academics:"🎓",homework:"📚",results:"🏆",timetable:"🗓",notices:"📢",reports:"📊",communication:"🔔",documents:"📁",leave:"📝",settings:"⚙",admissions:"🧾",schools:"🏫",subscriptions:"💳"};return m[x]||"•";}

function Page(p:{screen:Screen,role:Role,schoolId:string,userId:string,tick:number}){
 const x=p.screen;
 if(x==="students")return <Students {...p}/>;
 if(x==="staff")return <Staff {...p}/>;
 if(x==="attendance")return <Attendance {...p}/>;
 if(x==="fees")return <Fees {...p}/>;
 if(x==="academics")return <Academics {...p}/>;
 if(x==="homework")return <Homework {...p}/>;
 if(x==="results")return <Results {...p}/>;
 if(x==="timetable")return <Timetable {...p}/>;
 if(x==="notices")return <Notices {...p}/>;
 if(x==="leave")return <Leave {...p}/>;
 if(x==="communication")return <Communication {...p}/>;
 if(x==="admissions")return <Admissions {...p}/>;
 if(x==="reports")return <Reports {...p}/>;
 if(x==="documents")return <Documents {...p}/>;
 if(x==="settings")return <Settings {...p}/>;
 if(x==="schools")return <Schools {...p}/>;
 if(x==="subscriptions")return <Subscriptions {...p}/>;
 return <Card><Text style={S.muted}>Module not available for this account.</Text></Card>;
}

function Students(p:any){
 const [rows,setRows]=useState<any[]>([]),[q,setQ]=useState(""),[form,setForm]=useState(false),[name,setName]=useState(""),[adm,setAdm]=useState(""),[cls,setCls]=useState(""),[sec,setSec]=useState("");
 async function load(){let qy=db.from("students").select("id,name,admission_no,class_name,section,status").eq("school_id",p.schoolId).order("name");if(q)qy=qy.ilike("name","%"+q+"%");const x=await qy;if(x.error)Alert.alert("Students",err(x.error));setRows(x.data||[]);}
 useEffect(()=>{load()},[p.schoolId,p.tick,q]);
 async function add(){if(!name.trim())return Alert.alert("Required","Student name is required.");const x=await db.from("students").insert({school_id:p.schoolId,name:name.trim(),admission_no:adm.trim()||null,class_name:cls.trim()||null,section:sec.trim()||null,status:"active"});if(x.error)Alert.alert("Students",err(x.error));else{setForm(false);setName("");setAdm("");setCls("");setSec("");load();}}
 return <View><Text style={S.pageTitle}>Students</Text>{p.role==="school_admin"&&<Button title={form?"Close":"Add student"} onPress={()=>setForm(!form)}/>}
 {form&&<Card><Input label="Name" value={name} onChangeText={setName}/><Input label="Admission No." value={adm} onChangeText={setAdm}/><Input label="Class" value={cls} onChangeText={setCls}/><Input label="Section" value={sec} onChangeText={setSec}/><Button title="Save student" onPress={add}/></Card>}
 <Input label="Search" value={q} onChangeText={setQ} placeholder="Student name"/>{rows.map(r=><Card key={r.id}><Text style={S.row}>{r.name}</Text><Text style={S.muted}>{r.admission_no||"No admission no."} · {r.class_name||"Class not set"} {r.section||""}</Text><Text style={S.badge}>{r.status}</Text></Card>)}</View>;
}

function Staff(p:any){
 const [rows,setRows]=useState<any[]>([]);useEffect(()=>{(async()=>{const x=await db.from("staff").select("id,employee_no,name,designation,department,phone,email,status,user_id").eq("school_id",p.schoolId).order("name");if(x.error)Alert.alert("Staff",err(x.error));setRows(x.data||[]);})()},[p.schoolId,p.tick]);
 return <View><Text style={S.pageTitle}>Teachers & Staff</Text>{rows.map(r=><Card key={r.id}><Text style={S.row}>{r.name}</Text><Text style={S.muted}>{r.employee_no} · {r.designation||"Staff"} · {r.department||"General"}</Text><Text style={S.badge}>{r.status} · {r.user_id?"Login linked":"No login"}</Text></Card>)}</View>;
}

function Attendance(p:any){
 const [students,setStudents]=useState<any[]>([]),[date,setDate]=useState(dateNow()),[saving,setSaving]=useState(false);
 async function load(){const st=await db.from("students").select("id,name,class_name,section").eq("school_id",p.schoolId).in("status",["active","admitted"]).order("name");const at=await db.from("student_attendance").select("student_id,status").eq("school_id",p.schoolId).eq("attendance_date",date);const map:any={};(at.data||[]).forEach((r:any)=>map[r.student_id]=r.status);setStudents((st.data||[]).map((r:any)=>({...r,status:map[r.id]||"present"})));}
 useEffect(()=>{load()},[p.schoolId,p.tick,date]);
 async function save(){setSaving(true);for(const r of students){const x=await db.from("student_attendance").upsert({school_id:p.schoolId,student_id:r.id,attendance_date:date,status:r.status,marked_by:p.userId},{onConflict:"student_id,attendance_date"});if(x.error){Alert.alert("Attendance",err(x.error));setSaving(false);return;}}setSaving(false);Alert.alert("Attendance","Attendance saved successfully.");}
 const can=p.role==="teacher"||p.role==="school_admin";
 return <View><Text style={S.pageTitle}>Student Attendance</Text><Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate}/>{students.map(r=><Card key={r.id}><Text style={S.row}>{r.name}</Text><Text style={S.muted}>{r.class_name||""} {r.section||""}</Text>{can?<View style={S.chips}>{["present","absent","late","leave"].map(v=><TouchableOpacity key={v} onPress={()=>setStudents(a=>a.map(x=>x.id===r.id?{...x,status:v}:x))} style={[S.chip,r.status===v&&S.chipOn]}><Text style={r.status===v?S.chipOnText:S.chipText}>{v}</Text></TouchableOpacity>)}</View>:<Text style={S.badge}>{r.status}</Text>}</Card>)}{can&&students.length>0&&<Button title={saving?"Saving…":"Save attendance"} onPress={save} disabled={saving}/>}</View>;
}

function Fees(p:any){
 const [rows,setRows]=useState<any[]>([]),[selected,setSelected]=useState<any>(null),[amount,setAmount]=useState(""),[mode,setMode]=useState("cash");
 async function load(){const x=await db.from("student_fees").select("id,student_id,description,amount,discount,due_date,status,students(name,admission_no)").eq("school_id",p.schoolId).order("due_date");if(x.error)Alert.alert("Fees",err(x.error));setRows(x.data||[]);}
 useEffect(()=>{load()},[p.schoolId,p.tick]);
 async function pay(){if(!selected||!amount)return Alert.alert("Required","Enter a payment amount.");const x=await db.from("payments").insert({school_id:p.schoolId,student_fee_id:selected.id,student_id:selected.student_id,amount:Number(amount),payment_mode:mode,paid_at:new Date().toISOString(),created_by:p.userId});if(x.error)return Alert.alert("Payment",err(x.error));await db.from("student_fees").update({status:"paid"}).eq("id",selected.id);Alert.alert("Payment","Payment recorded. Receipt is available from the web portal.");setSelected(null);setAmount("");load();}
 return <View><Text style={S.pageTitle}>Fees</Text>{rows.map(r=><Card key={r.id}><Text style={S.row}>{(r.students as any)?.name||"Student"}</Text><Text style={S.muted}>{r.description||"Fee"} · Due {r.due_date}</Text><Text style={S.amount}>{money(Number(r.amount)-Number(r.discount||0))}</Text><Text style={S.badge}>{r.status}</Text>{p.role!=="parent"&&p.role!=="student"&&<Button title="Record payment" onPress={()=>setSelected(r)}/>}</Card>)}{selected&&<Card><Text style={S.section}>Record payment</Text><Input label="Amount" value={amount} onChangeText={setAmount} placeholder="3000"/><Input label="Mode" value={mode} onChangeText={setMode} placeholder="cash / UPI / bank / cheque"/><Button title="Save payment" onPress={pay}/><Button title="Cancel" secondary onPress={()=>setSelected(null)}/></Card>}</View>;
}

function Academics(p:any){
 const [classes,setClasses]=useState<any[]>([]),[sections,setSections]=useState<any[]>([]),[subjects,setSubjects]=useState<any[]>([]);
 useEffect(()=>{(async()=>{const a=await db.from("classes").select("id,name,is_active").eq("school_id",p.schoolId).order("display_order");const b=await db.from("sections").select("id,name,class_id,is_active").eq("school_id",p.schoolId).order("name");const c=await db.from("subjects").select("id,name,code,is_active").eq("school_id",p.schoolId).order("name");setClasses(a.data||[]);setSections(b.data||[]);setSubjects(c.data||[]);})()},[p.schoolId,p.tick]);
 return <View><Text style={S.pageTitle}>Academics</Text><View style={S.stats}><Stat label="Classes" value={classes.length}/><Stat label="Sections" value={sections.length}/><Stat label="Subjects" value={subjects.length}/></View>{classes.map(c=><Card key={c.id}><Text style={S.row}>{c.name}</Text><Text style={S.muted}>{sections.filter(x=>x.class_id===c.id).map(x=>x.name).join(", ")||"No sections"}</Text></Card>)}</View>;
}

function Homework(p:any){
 const [rows,setRows]=useState<any[]>([]),[form,setForm]=useState(false),[title,setTitle]=useState(""),[desc,setDesc]=useState(""),[due,setDue]=useState(dateNow());
 async function load(){const x=await db.from("homework").select("id,title,description,assigned_date,due_date,status").eq("school_id",p.schoolId).order("due_date",{ascending:false});if(x.error)Alert.alert("Homework",err(x.error));setRows(x.data||[]);}
 useEffect(()=>{load()},[p.schoolId,p.tick]);
 async function add(){const st=await db.from("staff").select("id").eq("user_id",p.userId).eq("school_id",p.schoolId).maybeSingle();if(!st.data)return Alert.alert("Profile","Your staff profile is not linked.");const cl=await db.from("classes").select("id").eq("school_id",p.schoolId).eq("is_active",true).limit(1).maybeSingle();const sec=cl.data?await db.from("sections").select("id").eq("class_id",cl.data.id).eq("is_active",true).limit(1).maybeSingle():{data:null} as any;const sub=await db.from("subjects").select("id").eq("school_id",p.schoolId).eq("is_active",true).limit(1).maybeSingle();if(!cl.data||!sec.data||!sub.data)return Alert.alert("Setup","Create an active class, section and subject first.");const x=await db.from("homework").insert({school_id:p.schoolId,class_id:cl.data.id,section_id:sec.data.id,subject_id:sub.data.id,teacher_id:st.data.id,title,description:desc,assigned_date:dateNow(),due_date:due,status:"assigned",created_by:p.userId});if(x.error)Alert.alert("Homework",err(x.error));else{setForm(false);setTitle("");setDesc("");load();}}
 return <View><Text style={S.pageTitle}>Homework</Text>{(p.role==="teacher"||p.role==="school_admin")&&<Button title={form?"Close":"Create homework"} onPress={()=>setForm(!form)}/>} {form&&<Card><Input label="Title" value={title} onChangeText={setTitle}/><Input label="Description" value={desc} onChangeText={setDesc} multiline/><Input label="Due date" value={due} onChangeText={setDue}/><Button title="Publish homework" onPress={add}/></Card>}{rows.map(r=><Card key={r.id}><Text style={S.row}>{r.title}</Text><Text style={S.muted}>{r.description||"No description"}</Text><Text style={S.badge}>Due {r.due_date} · {r.status}</Text></Card>)}</View>;
}

function Results(p:any){
 const [rows,setRows]=useState<any[]>([]);useEffect(()=>{(async()=>{const x=await db.from("report_cards").select("id,student_id,total_marks,max_marks,percentage,overall_grade,remarks,status,students(name,admission_no)").eq("school_id",p.schoolId).order("percentage",{ascending:false});if(x.error)Alert.alert("Results",err(x.error));setRows(x.data||[]);})()},[p.schoolId,p.tick]);
 return <View><Text style={S.pageTitle}>Exams & Results</Text>{rows.length===0&&<Card><Text style={S.muted}>No report cards available.</Text></Card>}{rows.map(r=><Card key={r.id}><Text style={S.row}>{(r.students as any)?.name||"Student"}</Text><Text style={S.amount}>{Number(r.percentage||0).toFixed(1)}%</Text><Text style={S.badge}>Grade {r.overall_grade||"—"} · {r.status}</Text>{r.remarks?<Text style={S.muted}>{r.remarks}</Text>:null}</Card>)}</View>;
}

function Timetable(p:any){
 const [rows,setRows]=useState<any[]>([]);useEffect(()=>{(async()=>{let q=db.from("timetables").select("id,day_of_week,period_no,start_time,end_time,room,status,classes(name),sections(name),subjects(name),staff(name)").eq("school_id",p.schoolId).eq("status","active").order("day_of_week").order("period_no");if(p.role==="teacher"){const st=await db.from("staff").select("id").eq("user_id",p.userId).maybeSingle();if(st.data)q=q.eq("teacher_id",st.data.id);}const x=await q;if(x.error)Alert.alert("Timetable",err(x.error));setRows(x.data||[]);})()},[p.schoolId,p.userId,p.role,p.tick]);const days=["","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
 return <View><Text style={S.pageTitle}>Timetable</Text>{rows.map(r=><Card key={r.id}><Text style={S.row}>{days[r.day_of_week]||"Day"} · Period {r.period_no}</Text><Text style={S.muted}>{(r.subjects as any)?.name||"Subject"} · {(r.classes as any)?.name||""} {(r.sections as any)?.name||""}</Text><Text style={S.badge}>{String(r.start_time||"").slice(0,5)}–{String(r.end_time||"").slice(0,5)} {r.room||""}</Text></Card>)}</View>;
}

function Notices(p:any){
 const [rows,setRows]=useState<any[]>([]),[form,setForm]=useState(false),[title,setTitle]=useState(""),[content,setContent]=useState("");
 async function load(){const x=await db.from("notices").select("id,title,content,audience,publish_date,status").eq("school_id",p.schoolId).order("publish_date",{ascending:false});if(x.error)Alert.alert("Notices",err(x.error));setRows(x.data||[]);}
 useEffect(()=>{load()},[p.schoolId,p.tick]);
 async function add(){const x=await db.from("notices").insert({school_id:p.schoolId,title,content,audience:"school",publish_date:dateNow(),status:"published",created_by:p.userId});if(x.error)Alert.alert("Notice",err(x.error));else{setForm(false);setTitle("");setContent("");load();}}
 return <View><Text style={S.pageTitle}>Notices & Events</Text>{p.role==="school_admin"&&<Button title={form?"Close":"Create notice"} onPress={()=>setForm(!form)}/>} {form&&<Card><Input label="Title" value={title} onChangeText={setTitle}/><Input label="Message" value={content} onChangeText={setContent} multiline/><Button title="Publish" onPress={add}/></Card>}{rows.map(r=><Card key={r.id}><Text style={S.row}>{r.title}</Text><Text style={S.muted}>{r.content}</Text><Text style={S.badge}>{r.status} · {r.publish_date}</Text></Card>)}</View>;
}

function Leave(p:any){
 const [rows,setRows]=useState<any[]>([]),[form,setForm]=useState(false),[start,setStart]=useState(dateNow()),[end,setEnd]=useState(dateNow()),[type,setType]=useState("casual"),[reason,setReason]=useState("");
 async function load(){let q=db.from("leave_requests").select("id,requester_type,requester_id,leave_type,start_date,end_date,reason,status,review_notes").eq("school_id",p.schoolId).order("created_at",{ascending:false});if(p.role!=="school_admin"&&p.role!=="super_admin"){const table=p.role==="teacher"?"staff":"students";const me=await db.from(table).select("id").eq("user_id",p.userId).maybeSingle();if(me.data)q=q.eq("requester_id",me.data.id);}const x=await q;if(x.error)Alert.alert("Leave",err(x.error));setRows(x.data||[]);}
 useEffect(()=>{load()},[p.schoolId,p.userId,p.role,p.tick]);
 async function submit(){const table=p.role==="teacher"?"staff":"students";const me=await db.from(table).select("id").eq("user_id",p.userId).maybeSingle();if(!me.data)return Alert.alert("Profile","Your profile is not linked.");const x=await db.from("leave_requests").insert({school_id:p.schoolId,requester_type:p.role==="teacher"?"staff":"student",requester_id:me.data.id,leave_type:type,start_date:start,end_date:end,reason,created_by:p.userId,status:"pending"});if(x.error)Alert.alert("Leave",err(x.error));else{setForm(false);setReason("");load();}}
 async function review(id:string,status:string){const x=await db.from("leave_requests").update({status,reviewed_by:p.userId,review_notes:status==="approved"?"Approved from mobile":"Rejected from mobile",reviewed_at:new Date().toISOString()}).eq("id",id);if(x.error)Alert.alert("Leave",err(x.error));else load();}
 return <View><Text style={S.pageTitle}>Leave Management</Text>{p.role!=="school_admin"&&p.role!=="super_admin"&&<Button title={form?"Close":"Apply for leave"} onPress={()=>setForm(!form)}/>} {form&&<Card><Input label="Leave type" value={type} onChangeText={setType}/><Input label="Start date" value={start} onChangeText={setStart}/><Input label="End date" value={end} onChangeText={setEnd}/><Input label="Reason" value={reason} onChangeText={setReason} multiline/><Button title="Submit leave" onPress={submit}/></Card>}{rows.map(r=><Card key={r.id}><Text style={S.row}>{r.leave_type}</Text><Text style={S.muted}>{r.start_date} → {r.end_date}</Text><Text style={S.badge}>{r.status}</Text>{(p.role==="school_admin"||p.role==="super_admin")&&r.status==="pending"&&<View style={S.rowButtons}><Button title="Approve" onPress={()=>review(r.id,"approved")}/><Button title="Reject" danger onPress={()=>review(r.id,"rejected")}/></View>}</Card>)}</View>;
}

function Communication(p:any){
 const [rows,setRows]=useState<any[]>([]),[form,setForm]=useState(false),[title,setTitle]=useState(""),[message,setMessage]=useState("");
 async function load(){const x=await db.from("notifications").select("id,title,message,notification_type,status,published_at").eq("school_id",p.schoolId).eq("status","published").order("created_at",{ascending:false});if(x.error)Alert.alert("Messages",err(x.error));setRows(x.data||[]);}
 useEffect(()=>{load()},[p.schoolId,p.userId,p.tick]);
 async function send(){const x=await db.from("notifications").insert({school_id:p.schoolId,title,message,notification_type:"general",target_type:"school",status:"published",published_at:new Date().toISOString(),created_by:p.userId});if(x.error)Alert.alert("Messages",err(x.error));else{setForm(false);setTitle("");setMessage("");load();}}
 async function read(id:string){const x=await db.from("notification_reads").upsert({notification_id:id,user_id:p.userId},{onConflict:"notification_id,user_id"});if(x.error)Alert.alert("Messages",err(x.error));}
 return <View><Text style={S.pageTitle}>Communication</Text>{p.role==="school_admin"&&<Button title={form?"Close":"Send notification"} onPress={()=>setForm(!form)}/>} {form&&<Card><Input label="Title" value={title} onChangeText={setTitle}/><Input label="Message" value={message} onChangeText={setMessage} multiline/><Button title="Publish notification" onPress={send}/></Card>}{rows.map(r=><TouchableOpacity key={r.id} onPress={()=>read(r.id)}><Card><Text style={S.row}>{r.title}</Text><Text style={S.muted}>{r.message}</Text><Text style={S.badge}>{r.notification_type}</Text></Card></TouchableOpacity>)}</View>;
}

function Admissions(p:any){
 const [rows,setRows]=useState<any[]>([]),[form,setForm]=useState(false),[name,setName]=useState(""),[parent,setParent]=useState(""),[phone,setPhone]=useState(""),[cls,setCls]=useState("");
 async function load(){const x=await db.from("admission_enquiries").select("id,enquiry_no,student_name,parent_name,parent_phone,class_interested,status").eq("school_id",p.schoolId).order("created_at",{ascending:false});if(x.error)Alert.alert("Admissions",err(x.error));setRows(x.data||[]);}
 useEffect(()=>{load()},[p.schoolId,p.tick]);
 async function add(){const x=await db.from("admission_enquiries").insert({school_id:p.schoolId,student_name:name,parent_name:parent,parent_phone:phone,class_interested:cls,status:"enquiry",source:"mobile"});if(x.error)Alert.alert("Admissions",err(x.error));else{setForm(false);setName("");setParent("");setPhone("");setCls("");load();}}
 return <View><Text style={S.pageTitle}>Admissions CRM</Text><Button title={form?"Close":"New enquiry"} onPress={()=>setForm(!form)}/>{form&&<Card><Input label="Student name" value={name} onChangeText={setName}/><Input label="Parent name" value={parent} onChangeText={setParent}/><Input label="Phone" value={phone} onChangeText={setPhone}/><Input label="Class interested" value={cls} onChangeText={setCls}/><Button title="Save enquiry" onPress={add}/></Card>}{rows.map(r=><Card key={r.id}><Text style={S.row}>{r.student_name}</Text><Text style={S.muted}>{r.enquiry_no||"Enquiry"} · {r.parent_name} · {r.parent_phone}</Text><Text style={S.badge}>{r.status} · {r.class_interested||""}</Text></Card>)}</View>;
}

function Reports(p:any){
 const [students,setStudents]=useState(0),[billed,setBilled]=useState(0),[paid,setPaid]=useState(0),[present,setPresent]=useState(0);
 useEffect(()=>{(async()=>{const a=await db.from("students").select("id",{count:"exact",head:true}).eq("school_id",p.schoolId);const b=await db.from("student_fees").select("amount,discount").eq("school_id",p.schoolId);const c=await db.from("payments").select("amount").eq("school_id",p.schoolId);const d=await db.from("student_attendance").select("status").eq("school_id",p.schoolId);setStudents(a.count||0);setBilled((b.data||[]).reduce((n,r)=>n+Number(r.amount||0)-Number(r.discount||0),0));setPaid((c.data||[]).reduce((n,r)=>n+Number(r.amount||0),0));setPresent((d.data||[]).filter(r=>r.status==="present"||r.status==="late").length);})()},[p.schoolId,p.tick]);
 return <View><Text style={S.pageTitle}>Reports</Text><View style={S.stats}><Stat label="Students" value={students}/><Stat label="Billed" value={money(billed)}/><Stat label="Collected" value={money(paid)}/><Stat label="Present/Late" value={present}/></View><Card><Text style={S.row}>Outstanding fees</Text><Text style={S.amount}>{money(billed-paid)}</Text></Card></View>;
}

function Documents(p:any){
 const [rows,setRows]=useState<any[]>([]);
 useEffect(()=>{(async()=>{const x=await db.from("documents").select("id,file_name,category,mime_type,size_bytes,storage_path,created_at").eq("school_id",p.schoolId).order("created_at",{ascending:false});if(x.error)Alert.alert("Documents",err(x.error));setRows(x.data||[]);})()},[p.schoolId,p.tick]);
 async function open(r:any){const x=await db.storage.from("school-documents").createSignedUrl(r.storage_path,600);if(x.error)Alert.alert("Document",err(x.error));else if(x.data?.signedUrl)Linking.openURL(x.data.signedUrl);}
 return <View><Text style={S.pageTitle}>Documents</Text>{rows.length===0&&<Card><Text style={S.muted}>No documents available.</Text></Card>}{rows.map(r=><TouchableOpacity key={r.id} onPress={()=>open(r)}><Card><Text style={S.row}>{r.file_name}</Text><Text style={S.muted}>{r.category||"General"} · {Math.round(Number(r.size_bytes||0)/1024)} KB</Text><Text style={S.link}>Open document ›</Text></Card></TouchableOpacity>)}</View>;
}

function Settings(p:any){
 const [school,setSchool]=useState<any>({}),[cfg,setCfg]=useState<any>({}),[saving,setSaving]=useState(false);
 useEffect(()=>{(async()=>{const a=await db.from("schools").select("name,address,city,state,phone,email,slug").eq("id",p.schoolId).maybeSingle();const b=await db.from("school_settings").select("website,principal_name,timezone,currency,date_format,attendance_start,attendance_end").eq("school_id",p.schoolId).maybeSingle();setSchool(a.data||{});setCfg(b.data||{});})()},[p.schoolId,p.tick]);
 async function save(){setSaving(true);const a=await db.from("schools").update({name:school.name,address:school.address,city:school.city,state:school.state,phone:school.phone,email:school.email}).eq("id",p.schoolId);const b=await db.from("school_settings").update({website:cfg.website,principal_name:cfg.principal_name,timezone:cfg.timezone,currency:cfg.currency,date_format:cfg.date_format,attendance_start:cfg.attendance_start,attendance_end:cfg.attendance_end}).eq("school_id",p.schoolId);setSaving(false);if(a.error||b.error)Alert.alert("Settings",err(a.error||b.error));else Alert.alert("Saved","Settings updated.");}
 return <View><Text style={S.pageTitle}>School Settings</Text><Card>{["name","address","city","state","phone","email"].map(k=><Input key={k} label={k.replace("_"," ")} value={school[k]||""} onChangeText={v=>setSchool((x:any)=>({...x,[k]:v}))}/>)}</Card><Card>{["website","principal_name","timezone","currency","date_format","attendance_start","attendance_end"].map(k=><Input key={k} label={k.replace("_"," ")} value={cfg[k]||""} onChangeText={v=>setCfg((x:any)=>({...x,[k]:v}))}/>)}</Card><Button title={saving?"Saving…":"Save settings"} onPress={save} disabled={saving}/></View>;
}

function Schools(p:any){const [rows,setRows]=useState<any[]>([]);useEffect(()=>{(async()=>{const x=await db.from("schools").select("id,name,slug,city,state,status").order("name");if(x.error)Alert.alert("Schools",err(x.error));setRows(x.data||[]);})()},[p.tick]);return <View><Text style={S.pageTitle}>School Tenants</Text>{rows.map(r=><Card key={r.id}><Text style={S.row}>{r.name}</Text><Text style={S.muted}>{r.slug} · {r.city||""}, {r.state||""}</Text><Text style={S.badge}>{r.status}</Text></Card>)}</View>;}
function Subscriptions(p:any){const [rows,setRows]=useState<any[]>([]);useEffect(()=>{(async()=>{const x=await db.from("subscriptions").select("id,status,billing_cycle,trial_ends_at,schools(name),subscription_plans(name,monthly_price,annual_price)").order("created_at",{ascending:false});if(x.error)Alert.alert("Subscriptions",err(x.error));setRows(x.data||[]);})()},[p.tick]);return <View><Text style={S.pageTitle}>Subscriptions</Text>{rows.map(r=><Card key={r.id}><Text style={S.row}>{(r.schools as any)?.name||"School"}</Text><Text style={S.muted}>{(r.subscription_plans as any)?.name||"Plan"} · {r.billing_cycle}</Text><Text style={S.badge}>{r.status}</Text></Card>)}</View>;}

const S=StyleSheet.create({
 safe:{flex:1,backgroundColor:C.bg},content:{padding:16,paddingBottom:90},login:{padding:20,paddingTop:70},header:{padding:12,paddingHorizontal:16,backgroundColor:C.white,borderBottomWidth:1,borderBottomColor:C.border,flexDirection:"row",alignItems:"center"},headerTitle:{fontSize:19,fontWeight:"800",color:C.navy},headerSub:{fontSize:12,color:C.muted,marginTop:2},logout:{fontWeight:"800",color:C.red},logo:{fontSize:50,textAlign:"center"},title:{fontSize:30,fontWeight:"800",color:C.navy,textAlign:"center",marginBottom:5},pageTitle:{fontSize:27,fontWeight:"800",color:C.navy,marginBottom:5},section:{fontSize:18,fontWeight:"800",color:C.text,marginVertical:10},muted:{fontSize:14,color:C.muted,lineHeight:20},error:{color:C.red,marginBottom:10},card:{backgroundColor:C.white,borderRadius:16,padding:16,marginVertical:7,borderWidth:1,borderColor:C.border},label:{fontSize:13,fontWeight:"700",color:C.text,marginBottom:6},input:{backgroundColor:C.white,borderWidth:1,borderColor:"#D0D5DD",borderRadius:11,padding:12,fontSize:16,color:C.text},multi:{minHeight:90,textAlignVertical:"top"},button:{backgroundColor:C.blue,borderRadius:11,paddingVertical:13,paddingHorizontal:15,alignItems:"center",marginVertical:6},buttonText:{color:C.white,fontWeight:"800"},secondary:{backgroundColor:C.white,borderWidth:1,borderColor:C.blue},secondaryText:{color:C.blue},danger:{backgroundColor:C.red},disabled:{opacity:.55},stats:{flexDirection:"row",flexWrap:"wrap",gap:8,marginVertical:12},statBox:{backgroundColor:C.white,borderRadius:14,borderWidth:1,borderColor:C.border,padding:14,width:"48%"},stat:{fontSize:23,fontWeight:"800",color:C.navy},grid:{flexDirection:"row",flexWrap:"wrap",gap:10},tile:{width:"47%",minHeight:95,backgroundColor:C.white,borderRadius:15,borderWidth:1,borderColor:C.border,padding:14,justifyContent:"center"},icon:{fontSize:22,marginBottom:6},tileText:{fontSize:14,fontWeight:"800",color:C.text},row:{fontSize:16,fontWeight:"800",color:C.text,marginBottom:4},badge:{alignSelf:"flex-start",marginTop:6,paddingHorizontal:9,paddingVertical:5,borderRadius:20,backgroundColor:"#EEF4FB",color:C.blue,fontSize:12,fontWeight:"700"},amount:{fontSize:22,fontWeight:"800",color:C.navy,marginTop:5},link:{color:C.blue,fontWeight:"800",marginTop:7},chips:{flexDirection:"row",flexWrap:"wrap",gap:7,marginTop:10},chip:{paddingHorizontal:10,paddingVertical:8,borderRadius:18,borderWidth:1,borderColor:C.border},chipOn:{backgroundColor:C.blue,borderColor:C.blue},chipText:{fontSize:12,color:C.text},chipOnText:{fontSize:12,color:C.white,fontWeight:"800"},rowButtons:{flexDirection:"row",gap:8},bottom:{position:"absolute",bottom:0,left:0,right:0,backgroundColor:C.white,borderTopWidth:1,borderTopColor:C.border,flexDirection:"row",paddingVertical:8},tab:{flex:1,alignItems:"center"},tabText:{fontSize:10,color:C.muted,fontWeight:"700",textAlign:"center"},tabActive:{color:C.blue}
});
