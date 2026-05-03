import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/api";

// Shared auth styles — identical to LoginPage so they stay in sync
const authStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f7f6f2;
    --bg2: #eeecea;
    --surface: #ffffff;
    --border: rgba(0,0,0,0.08);
    --border-med: rgba(0,0,0,0.13);
    --text: #1a1814;
    --text2: #4a4640;
    --muted: #9b9690;
    --accent: #e8533a;
    --accent-soft: #fff0ed;
    --accent2: #2563a8;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow: 0 8px 32px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05);
    --radius: 20px;
    --radius-sm: 11px;
  }

  html, body { height: 100%; background: var(--bg); }

  .auth-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Outfit', sans-serif;
    background: var(--bg);
  }

  .auth-left {
    background: var(--text);
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 48px; position: relative; overflow: hidden;
  }

  .auth-left::before {
    content: ''; position: absolute;
    top: -120px; right: -120px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(232,83,58,0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .auth-left::after {
    content: ''; position: absolute;
    bottom: -80px; left: -80px;
    width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,168,0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .auth-brand {
    display: flex; align-items: center; gap: 10px;
    position: relative; z-index: 1;
  }

  .auth-brand-mark {
    width: 34px; height: 34px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }

  .auth-brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 700;
    color: rgba(255,255,255,0.95); letter-spacing: -0.01em;
  }
  .auth-brand-name em { font-style: italic; color: #e8533a; }

  .auth-left-body { position: relative; z-index: 1; }

  .auth-left-headline {
    font-family: 'Playfair Display', serif;
    font-size: 2.6rem; font-weight: 800; line-height: 1.15;
    letter-spacing: -0.03em; color: rgba(255,255,255,0.95); margin-bottom: 20px;
  }
  .auth-left-headline em { font-style: italic; color: #e8533a; }

  .auth-left-desc {
    font-size: 0.92rem; font-weight: 300; line-height: 1.65;
    color: rgba(255,255,255,0.5); max-width: 340px;
  }

  .auth-features { display: flex; flex-direction: column; gap: 14px; margin-top: 36px; }

  .auth-feature {
    display: flex; align-items: center; gap: 12px;
    font-size: 0.84rem; color: rgba(255,255,255,0.65); font-weight: 400;
  }

  .auth-feature-dot {
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; flex-shrink: 0;
  }

  .auth-left-footer {
    font-size: 0.72rem; color: rgba(255,255,255,0.25);
    position: relative; z-index: 1; letter-spacing: 0.03em;
  }

  .auth-right {
    display: flex; align-items: center; justify-content: center;
    padding: 48px 40px; background: var(--bg);
  }

  .auth-form-wrap { width: 100%; max-width: 400px; }

  .auth-eyebrow {
    font-size: 0.7rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--accent); margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .auth-eyebrow::before {
    content: ''; width: 20px; height: 2px;
    background: var(--accent); border-radius: 2px; flex-shrink: 0;
  }

  .auth-heading {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; font-weight: 800; line-height: 1.15;
    letter-spacing: -0.025em; color: var(--text); margin-bottom: 6px;
  }

  .auth-subtext {
    font-size: 0.87rem; color: var(--muted);
    font-weight: 300; line-height: 1.5; margin-bottom: 32px;
  }

  .auth-field { margin-bottom: 14px; }

  .auth-field label {
    display: block; font-size: 0.7rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.09em;
    color: var(--muted); margin-bottom: 6px;
  }

  .auth-field input,
  .auth-field select {
    width: 100%; background: var(--surface);
    border: 1.5px solid var(--border-med); border-radius: var(--radius-sm);
    color: var(--text); font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; font-weight: 400; padding: 11px 15px;
    outline: none; transition: border-color 0.18s, box-shadow 0.18s;
    appearance: none; box-shadow: var(--shadow-sm);
  }

  .auth-field input:focus,
  .auth-field select:focus {
    border-color: var(--accent2);
    box-shadow: 0 0 0 3px rgba(37,99,168,0.1);
  }

  .auth-field input::placeholder { color: var(--muted); font-weight: 300; }

  .auth-field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' fill='none'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%239b9690' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
    padding-right: 36px; cursor: pointer; background-color: var(--surface);
  }

  .auth-role-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    margin-top: 6px;
  }

  .role-option { position: relative; }

  .role-option input[type="radio"] {
    position: absolute; opacity: 0; width: 0; height: 0;
  }

  .role-option label {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 14px 12px; border-radius: var(--radius-sm);
    background: var(--surface); border: 1.5px solid var(--border-med);
    cursor: pointer; transition: all 0.18s;
    text-transform: none !important; letter-spacing: normal !important;
    font-size: 0.84rem !important; font-weight: 500 !important;
    color: var(--text2) !important;
  }

  .role-option label:hover {
    border-color: var(--accent2);
    background: #eff4fb;
  }

  .role-option input[type="radio"]:checked + label {
    border-color: var(--accent2);
    background: #eff4fb;
    color: var(--accent2) !important;
  }

  .role-icon { font-size: 1.2rem; }

  .role-desc {
    font-size: 0.68rem !important;
    color: var(--muted) !important;
    font-weight: 300 !important;
    text-align: center;
  }

  .auth-error {
    display: flex; align-items: center; gap: 8px;
    background: var(--accent-soft); border: 1px solid #f4c5bc;
    color: var(--accent); padding: 10px 14px;
    border-radius: var(--radius-sm); font-size: 0.83rem;
    font-weight: 500; margin-bottom: 16px;
  }

  .auth-btn {
    width: 100%; padding: 13px 20px;
    background: var(--text); color: #fff;
    border: none; border-radius: var(--radius-sm);
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; font-weight: 600;
    cursor: pointer; letter-spacing: 0.01em;
    box-shadow: var(--shadow); transition: all 0.18s; margin-top: 6px;
  }

  .auth-btn:hover {
    background: #2d2a26;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    transform: translateY(-1px);
  }

  .auth-btn:active { transform: translateY(0); }

  .auth-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 22px 0; font-size: 0.75rem; color: var(--muted);
  }
  .auth-divider::before,
  .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--border-med);
  }

  .auth-foot {
    text-align: center; font-size: 0.84rem;
    color: var(--muted); font-weight: 400;
  }

  .auth-foot a {
    color: var(--accent2); font-weight: 600;
    text-decoration: none; transition: color 0.15s;
  }
  .auth-foot a:hover { color: #1a4a82; text-decoration: underline; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .auth-form-wrap { animation: fadeSlideUp 0.4s ease both; }

  @media (max-width: 768px) {
    .auth-shell { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .auth-right { padding: 40px 24px; align-items: flex-start; padding-top: 60px; }
  }
`;

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await signup(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <>
      <style>{authStyles}</style>
      <div className="auth-shell">
        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-brand-mark">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.4"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.4"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.75"/>
              </svg>
            </div>
            <span className="auth-brand-name">Task<em>Flow</em></span>
          </div>

          <div className="auth-left-body">
            <h2 className="auth-left-headline">
              Hit the ground<br /><em>running.</em>
            </h2>
            <p className="auth-left-desc">
              Create your free account in seconds and start collaborating with your team on day one.
            </p>
            <div className="auth-features">
              {[
                { icon: "⚡", label: "Set up in under 2 minutes" },
                { icon: "🔒", label: "Secure, private workspaces" },
                { icon: "🎯", label: "Role-based access control" },
              ].map(({ icon, label }) => (
                <div className="auth-feature" key={label}>
                  <div className="auth-feature-dot">{icon}</div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <p className="auth-left-footer">© {new Date().getFullYear()} TaskFlow · All rights reserved</p>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <p className="auth-eyebrow">Get started</p>
            <h1 className="auth-heading">Create your<br />account</h1>
            <p className="auth-subtext">Set your role and start collaborating with your team today.</p>

            <form onSubmit={onSubmit}>
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  name="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Email address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  minLength={6}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Your Role</label>
                <div className="auth-role-grid">
                  {[
                    { value: "member", icon: "👤", label: "Member", desc: "View & update tasks" },
                    { value: "admin", icon: "🛡️", label: "Admin", desc: "Full project control" },
                  ].map(({ value, icon, label, desc }) => (
                    <div className="role-option" key={value}>
                      <input
                        type="radio"
                        id={`role-${value}`}
                        name="role"
                        value={value}
                        checked={form.role === value}
                        onChange={onChange}
                      />
                      <label htmlFor={`role-${value}`}>
                        <span className="role-icon">{icon}</span>
                        {label}
                        <span className="role-desc">{desc}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="auth-error">⚠ {error}</div>}

              <button type="submit" className="auth-btn">Create Account →</button>
            </form>

            <div className="auth-divider">or</div>

            <p className="auth-foot">
              Already have an account? <Link to="/">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignupPage;