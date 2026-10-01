"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function TeacherLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="auth-page">
      <div className="auth-card teacher-auth-card">
        <div className="brand-mark">👩‍🏫</div>
        <span className="teacher-login-badge">Teacher Portal</span>
        <h1>Teacher Login</h1>
        <p className="muted">Sign in to access your SchoolConnect teacher dashboard.</p>
        <form onSubmit={submit}>
          <label>Email
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teacher@school.edu" autoComplete="username" />
          </label>
          <label>Password
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </label>
          {error && <div className="error">{error}</div>}
          <button disabled={loading}>{loading ? "Signing in…" : "Login as Teacher"}</button>
        </form>
        <Link className="back-login-link" href="/login">← Back to School Login</Link>
        <small className="muted">Demo Public School · Teacher access is role-controlled</small>
      </div>
    </main>
  );
}
