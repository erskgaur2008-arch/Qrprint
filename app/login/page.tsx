"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const supabase=createClient();
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error) setError(error.message); else window.location.href="/dashboard";
    setLoading(false);
  }

  return <main className="auth-page"><div className="auth-card">
    <div className="brand-mark">🎓</div>
    <h1>SchoolConnect</h1>
    <p className="muted">Sign in to your school CRM</p>
    <form onSubmit={submit}>
      <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@school.edu"/></label>
      <label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></label>
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>{loading?"Signing in…":"Sign in"}</button>
    </form>
    <small className="muted">Demo Public School · Multi-school SaaS</small>
  </div></main>;
}