import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  createProject,
  createTask,
  getMe,
  getProjects,
  getTasksByProject,
  getUsers,
  updateTask
} from "../services/api";

const emptyProject = { name: "", description: "", memberIds: [] };
const emptyTask = { title: "", description: "", assignedTo: "", dueDate: "" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #f7f6f2;
    --bg2:         #eeecea;
    --surface:     #ffffff;
    --surface2:    #f3f1ed;
    --border:      rgba(0,0,0,0.07);
    --border-med:  rgba(0,0,0,0.13);
    --text:        #1a1814;
    --text2:       #3a3630;
    --muted:       #9b9690;
    --muted2:      #b8b4af;
    --accent:      #e8533a;
    --accent-soft: #fff0ed;
    --accent-dim:  rgba(232,83,58,0.1);
    --accent2:     #2563a8;
    --accent2-soft:#e8f0fb;
    --accent2-dim: rgba(37,99,168,0.1);
    --green:       #2d8a4e;
    --green-dim:   rgba(45,138,78,0.1);
    --amber:       #c47a1a;
    --amber-dim:   rgba(196,122,26,0.1);
    --danger:      #c0392b;
    --danger-dim:  rgba(192,57,43,0.1);
    --shadow-sm:   0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04);
    --shadow:      0 4px 20px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04);
    --shadow-lg:   0 16px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06);
    --radius:      18px;
    --radius-sm:   12px;
    --radius-xs:   8px;
  }

  .dashboard {
    font-family: 'Outfit', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    position: relative;
    overflow-x: hidden;
  }

  .dashboard::before {
    content: '';
    position: fixed; top: -160px; left: -160px;
    width: 520px; height: 520px; border-radius: 50%;
    background: radial-gradient(circle, rgba(232,83,58,0.07) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .dashboard::after {
    content: '';
    position: fixed; bottom: -140px; right: -100px;
    width: 460px; height: 460px; border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,168,0.07) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .dashboard > * { position: relative; z-index: 1; }

  /* TOPBAR */
  .topbar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 44px; height: 64px;
    border-bottom: 1px solid var(--border-med);
    backdrop-filter: blur(16px);
    position: sticky; top: 0; z-index: 200;
    background: rgba(247,246,242,0.92);
    box-shadow: 0 1px 0 var(--border), 0 4px 16px rgba(0,0,0,0.03);
  }

  .topbar-logo { display: flex; align-items: center; gap: 10px; }

  .logo-mark {
    width: 32px; height: 32px;
    background: var(--text); border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(26,24,20,0.2);
  }

  .topbar-brand {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem; font-weight: 700;
    letter-spacing: -0.01em; color: var(--text);
  }

  .topbar-brand em { font-style: italic; color: var(--accent); }

  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .topbar-badge {
    background: var(--surface2);
    border: 1px solid var(--border-med);
    border-radius: 7px;
    padding: 4px 10px;
    font-size: 0.7rem; font-weight: 600;
    color: var(--muted); letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .user-pill {
    display: flex; align-items: center; gap: 9px;
    background: var(--surface);
    border: 1px solid var(--border-med);
    border-radius: 100px;
    padding: 5px 14px 5px 5px;
    box-shadow: var(--shadow-sm);
    cursor: default; transition: border-color 0.2s, box-shadow 0.2s;
  }

  .user-pill:hover { border-color: rgba(0,0,0,0.2); box-shadow: var(--shadow); }

  .user-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, var(--text), #3a3630);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-weight: 700;
    font-size: 0.68rem; color: #fff; flex-shrink: 0;
  }

  .user-info { line-height: 1.25; }
  .user-name { font-size: 0.8rem; font-weight: 600; color: var(--text); }
  .user-role { font-size: 0.62rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.09em; }

  .btn-logout {
    background: transparent;
    border: 1px solid var(--border-med);
    color: var(--muted); padding: 7px 16px; border-radius: 100px;
    font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 500;
    cursor: pointer; transition: all 0.18s;
  }

  .btn-logout:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

  /* MAIN */
  .main-content {
    padding: 36px 44px 80px;
    max-width: 1340px; margin: 0 auto;
  }

  .page-header { margin-bottom: 30px; }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.9rem; font-weight: 800;
    letter-spacing: -0.025em; color: var(--text); line-height: 1.1;
  }

  .page-title em { font-style: italic; color: var(--accent); }
  .page-date { font-size: 0.82rem; color: var(--muted); margin-top: 5px; font-weight: 300; }

  /* ERROR */
  .error-bar {
    display: flex; align-items: center; gap: 10px;
    background: var(--accent-soft); border: 1px solid rgba(232,83,58,0.25);
    color: var(--accent); padding: 12px 16px; border-radius: var(--radius-sm);
    margin-bottom: 24px; font-size: 0.84rem; font-weight: 500;
  }

  /* STATS */
  .stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 14px; margin-bottom: 26px;
  }

  .stat-card {
    background: var(--surface); border: 1px solid var(--border-med);
    border-radius: var(--radius); padding: 22px 24px;
    position: relative; overflow: hidden;
    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    box-shadow: var(--shadow-sm); cursor: default;
  }

  .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); border-color: rgba(0,0,0,0.18); }

  .stat-card-top {
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    border-radius: var(--radius) var(--radius) 0 0;
  }

  .stat-card.total   .stat-card-top { background: linear-gradient(90deg, #2563a8, #3b82c4); }
  .stat-card.done    .stat-card-top { background: linear-gradient(90deg, #2d8a4e, #3aad63); }
  .stat-card.pending .stat-card-top { background: linear-gradient(90deg, #c47a1a, #d4911f); }
  .stat-card.overdue .stat-card-top { background: linear-gradient(90deg, #c0392b, #d94032); }

  .stat-icon {
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }

  .stat-card.total   .stat-icon { background: var(--accent2-dim); }
  .stat-card.done    .stat-icon { background: var(--green-dim); }
  .stat-card.pending .stat-icon { background: var(--amber-dim); }
  .stat-card.overdue .stat-icon { background: var(--danger-dim); }

  .stat-label {
    font-size: 0.67rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--muted); margin-bottom: 6px;
  }

  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 2.8rem; font-weight: 800;
    line-height: 1; letter-spacing: -0.03em;
  }

  .stat-card.total   .stat-value { color: var(--accent2); }
  .stat-card.done    .stat-value { color: var(--green); }
  .stat-card.pending .stat-value { color: var(--amber); }
  .stat-card.overdue .stat-value { color: var(--danger); }

  /* PANEL GRID */
  .panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; position: relative;
  z-index: 1000; }

  .card {
    background: var(--surface); border: 1px solid var(--border-med);
    border-radius: var(--radius); padding: 26px;
    box-shadow: var(--shadow-sm); transition: border-color 0.2s, box-shadow 0.2s;
     overflow: visible;
  }

  .card:hover { border-color: rgba(0,0,0,0.18); box-shadow: var(--shadow); }

  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem; font-weight: 700;
    letter-spacing: -0.01em; margin-bottom: 20px;
    display: flex; align-items: center; gap: 9px; color: var(--text);
  }

  .card-title-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  .section-label {
    font-size: 0.67rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--muted2); margin-bottom: 14px;
  }

  /* FIELDS */
  .field { margin-bottom: 14px; }

  .field label {
    display: block; font-size: 0.68rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.09em;
    color: var(--muted); margin-bottom: 6px;
  }

  .field input[type="text"],
  .field input[type="date"],
  .field textarea {
    width: 100%; background: var(--surface);
    border: 1.5px solid var(--border-med); border-radius: var(--radius-sm);
    color: var(--text); font-family: 'Outfit', sans-serif;
    font-size: 0.88rem; font-weight: 400; padding: 10px 14px; outline: none;
    transition: border-color 0.18s, box-shadow 0.18s; box-shadow: var(--shadow-sm);
  }

  .field input[type="text"]:hover,
  .field input[type="date"]:hover,
  .field textarea:hover { border-color: rgba(0,0,0,0.2); }

  .field input[type="text"]:focus,
  .field input[type="date"]:focus,
  .field textarea:focus { border-color: var(--accent2); box-shadow: 0 0 0 3px rgba(37,99,168,0.1); }

  .field input::placeholder, .field textarea::placeholder { color: var(--muted); font-weight: 300; }
  textarea { resize: vertical; min-height: 70px; }

  /* CUSTOM SELECT */
  .custom-select-wrapper { position: relative;
z-index: 500; }

  .custom-select-btn {
    width: 100%; background: var(--surface);
    border: 1.5px solid var(--border-med); border-radius: var(--radius-sm);
    color: var(--text); font-family: 'Outfit', sans-serif;
    font-size: 0.88rem; font-weight: 400; padding: 10px 38px 10px 14px;
    text-align: left; cursor: pointer; display: flex; align-items: center;
    outline: none; transition: border-color 0.18s, box-shadow 0.18s; box-shadow: var(--shadow-sm);
  }

  .custom-select-btn:hover { border-color: rgba(0,0,0,0.2); }
  .custom-select-btn.open { border-color: var(--accent2); box-shadow: 0 0 0 3px rgba(37,99,168,0.1); }
  .custom-select-btn .placeholder { color: var(--muted); font-weight: 300; }

  .select-arrow {
    position: absolute; right: 13px; top: 50%;
    transform: translateY(-50%); pointer-events: none; color: var(--muted);
    transition: transform 0.2s;
  }

  .custom-select-btn.open .select-arrow { transform: translateY(-50%) rotate(180deg); }

  .custom-select-dropdown {
    position: absolute; top: calc(100% + 5px); left: 0; right: 0;
    background: var(--surface); border: 1.5px solid var(--border-med);
    border-radius: var(--radius-sm); box-shadow: var(--shadow-lg);
    z-index: 9999; overflow: hidden; animation: dropIn 0.14s ease;
    max-height: 220px; overflow-y: auto;
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .custom-select-dropdown::-webkit-scrollbar { width: 4px; }
  .custom-select-dropdown::-webkit-scrollbar-thumb { background: var(--border-med); border-radius: 4px; }

  .select-option {
    padding: 10px 14px; font-size: 0.87rem; font-weight: 400;
    cursor: pointer; transition: background 0.1s;
    display: flex; align-items: center; gap: 9px; color: var(--text);
  }

  .select-option:hover { background: var(--bg); }
  .select-option.selected { background: var(--accent2-soft); color: var(--accent2); font-weight: 600; }
  .select-option.placeholder-opt { color: var(--muted); font-weight: 300; }
  .select-option-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* STATUS PILL SELECT */
  .status-select-wrapper { position: relative; display: inline-block; }

  .status-select-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 26px 5px 10px; border-radius: 100px;
    font-family: 'Outfit', sans-serif; font-size: 0.76rem; font-weight: 600;
    cursor: pointer; border: 1.5px solid transparent;
    transition: all 0.15s; outline: none;
    position: relative; white-space: nowrap;
  }

  .status-select-btn[data-status="pending"]     { background: var(--amber-dim);  color: var(--amber);  border-color: rgba(196,122,26,0.2); }
  .status-select-btn[data-status="in-progress"] { background: var(--accent2-dim); color: var(--accent2); border-color: rgba(37,99,168,0.2); }
  .status-select-btn[data-status="completed"]   { background: var(--green-dim);  color: var(--green);  border-color: rgba(45,138,78,0.2); }
  .status-select-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .status-select-btn[data-status="pending"]     .status-dot { background: var(--amber); }
  .status-select-btn[data-status="in-progress"] .status-dot { background: var(--accent2); }
  .status-select-btn[data-status="completed"]   .status-dot { background: var(--green); }

  .status-select-arrow {
    position: absolute; right: 8px; top: 50%;
    transform: translateY(-50%); pointer-events: none; color: currentColor; opacity: 0.7;
  }

  .status-dropdown {
    position: absolute; top: calc(100% + 5px); left: 0;
    min-width: 152px; background: var(--surface);
    border: 1.5px solid var(--border-med); border-radius: var(--radius-xs);
    box-shadow: var(--shadow-lg); z-index: 400; overflow: hidden; animation: dropIn 0.14s ease;
  }

  .status-opt {
    padding: 9px 14px; display: flex; align-items: center; gap: 9px;
    font-size: 0.82rem; font-weight: 500; cursor: pointer;
    transition: background 0.1s; color: var(--text);
  }

  .status-opt:hover { background: var(--bg); }
  .status-opt-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  /* CUSTOM CHECKBOX */
  .member-list {
    border: 1.5px solid var(--border-med); border-radius: var(--radius-sm);
    background: var(--surface); max-height: 168px; overflow-y: auto; padding: 6px;
    box-shadow: var(--shadow-sm);
  }

  .member-list::-webkit-scrollbar { width: 4px; }
  .member-list::-webkit-scrollbar-thumb { background: var(--border-med); border-radius: 4px; }

  .member-item {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 8px; border-radius: var(--radius-xs);
    cursor: pointer; transition: background 0.12s; user-select: none;
  }

  .member-item:hover { background: var(--bg2); }
  .member-item.checked { background: var(--accent2-soft); }

  .custom-checkbox {
    width: 18px; height: 18px; border-radius: 5px;
    border: 2px solid var(--border-med); background: var(--surface);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s;
  }

  .member-item.checked .custom-checkbox {
    background: var(--accent2); border-color: var(--accent2);
    box-shadow: 0 0 0 3px rgba(37,99,168,0.14);
  }

  .check-icon { opacity: 0; transform: scale(0.5); transition: all 0.15s; }
  .member-item.checked .check-icon { opacity: 1; transform: scale(1); }

  .member-label { font-size: 0.84rem; color: var(--text); flex: 1; line-height: 1.3; font-weight: 400; }
  .member-email { font-size: 0.71rem; color: var(--muted); font-weight: 300; }
  .member-item.checked .member-label { color: var(--accent2); font-weight: 500; }

  /* DIVIDER */
  .divider { height: 1px; background: var(--border-med); margin: 20px 0; }

  /* BUTTON */
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 7px; padding: 11px 20px; border-radius: var(--radius-sm);
    font-family: 'Outfit', sans-serif; font-size: 0.88rem; font-weight: 600;
    cursor: pointer; border: none;
    transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    width: 100%; margin-top: 4px; letter-spacing: 0.01em;
  }

  .btn-primary { background: var(--text); color: #fff; box-shadow: var(--shadow); }

  .btn-primary:hover:not(:disabled) {
    background: #2d2a26; transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(26,24,20,0.18);
  }

  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; box-shadow: none; }

  /* TASKS CARD */
  .tasks-card {
    background: var(--surface); border: 1px solid var(--border-med);
    border-radius: var(--radius); overflow: visible; box-shadow: var(--shadow-sm);
     position: relative;
  z-index: 1;
  }

  .tasks-header {
    padding: 20px 28px 18px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border-med); background: var(--surface2);
  }

  .tasks-count {
    font-size: 0.7rem; font-weight: 600; color: var(--muted);
    background: var(--surface); border: 1px solid var(--border-med);
    padding: 3px 10px; border-radius: 100px;
  }

  /* TABLE */
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: var(--surface2); }

  th {
    font-size: 0.66rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--muted); padding: 11px 20px;
    text-align: left; border-bottom: 1px solid var(--border-med);
  }

  td {
    padding: 14px 20px; font-size: 0.87rem;
    border-bottom: 1px solid var(--border); vertical-align: middle;
  }

  tr:last-child td { border-bottom: none; }
  tbody tr { transition: background 0.1s; }
  tbody tr:hover { background: var(--surface2); }

  .task-title-cell { font-weight: 500; color: var(--text); }
  .task-title-desc { font-size: 0.75rem; color: var(--muted); margin-top: 2px; font-weight: 300; font-style: italic; }

  .due-date { font-size: 0.8rem; color: var(--muted); display: inline-flex; align-items: center; gap: 5px; }
  .due-date.overdue { color: var(--danger); font-weight: 600; background: var(--danger-dim); padding: 3px 8px; border-radius: 6px; }

  .assignee { display: flex; align-items: center; gap: 9px; font-size: 0.83rem; }

  .assignee-dot {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, var(--text), #4a4640);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 0.6rem; font-weight: 700; color: #fff;
    flex-shrink: 0; box-shadow: 0 2px 6px rgba(26,24,20,0.18);
  }

  /* EMPTY */
  .empty-state { padding: 56px 28px; text-align: center; color: var(--muted); }

  .empty-icon-wrap {
    width: 52px; height: 52px; background: var(--surface2);
    border: 1px solid var(--border-med); border-radius: 14px;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
  }

  .empty-title { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .empty-sub { font-size: 0.82rem; color: var(--muted); font-weight: 300; }

  /* ANIMATIONS */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .stats      { animation: fadeUp 0.4s ease both; }
  .panel-grid { animation: fadeUp 0.4s ease 0.08s both; }
  .tasks-card { animation: fadeUp 0.4s ease 0.16s both; }

  @media (max-width: 960px) {
    .topbar { padding: 0 20px; }
    .main-content { padding: 20px 20px 80px; }
    .stats { grid-template-columns: repeat(2, 1fr); }
    .panel-grid { grid-template-columns: 1fr; }
  }
`;

// ── Custom Select ─────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder = "Select...", disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="custom-select-wrapper" ref={ref}>
      <button
        type="button"
        className={`custom-select-btn${open ? " open" : ""}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        {selected
          ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.dot && <span className="select-option-dot" style={{ background: selected.dot }} />}
              {selected.label}
            </span>
          : <span className="placeholder">{placeholder}</span>
        }
        <svg className="select-arrow" width="11" height="7" viewBox="0 0 11 7" fill="none">
          <path d="M1 1l4.5 4.5L10 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="custom-select-dropdown">
          <div
            className={`select-option placeholder-opt${!value ? " selected" : ""}`}
            onClick={() => { onChange(""); setOpen(false); }}
          >{placeholder}</div>
          {options.map(opt => (
            <div
              key={opt.value}
              className={`select-option${opt.value === value ? " selected" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.dot && <span className="select-option-dot" style={{ background: opt.dot }} />}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Status Pill Select ────────────────────────────────────────
const STATUS_CFG = {
  "pending":     { label: "Pending",     dot: "#c47a1a" },
  "in-progress": { label: "In Progress", dot: "#2563a8" },
  "completed":   { label: "Completed",   dot: "#2d8a4e" },
};

function StatusSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const cfg = STATUS_CFG[value] || STATUS_CFG["pending"];

  return (
    <div className="status-select-wrapper" ref={ref}>
      <button
        type="button"
        className="status-select-btn"
        data-status={value}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        <span className="status-dot" />
        {cfg.label}
        <svg className="status-select-arrow" width="9" height="6" viewBox="0 0 9 6" fill="none">
          <path d="M1 1l3.5 3.5L8 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="status-dropdown">
          {Object.entries(STATUS_CFG).map(([key, c]) => (
            <div key={key} className="status-opt" onClick={() => { onChange(key); setOpen(false); }}>
              <span className="status-opt-dot" style={{ background: c.dot }} />
              <span style={{ fontWeight: key === value ? 600 : 400 }}>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Member Checkbox Item ──────────────────────────────────────
function MemberCheckItem({ member, checked, onChange }) {
  return (
    <label className={`member-item${checked ? " checked" : ""}`} onClick={() => onChange(!checked)}>
      <div className="custom-checkbox">
        <svg className="check-icon" width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="member-label">{member.name}</div>
        <div className="member-email">{member.email}</div>
      </div>
    </label>
  );
}

// ── Dashboard Page ────────────────────────────────────────────
function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [error, setError] = useState("");

  const selectedProject = useMemo(
    () => projects.find((p) => p._id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status !== "completed").length;
    const overdue = tasks.filter(
      (t) => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < now
    ).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  const loadProjects = async () => {
    const { data } = await getProjects();
    setProjects(data);
    if (!selectedProjectId && data.length > 0) setSelectedProjectId(data[0]._id);
  };

  const loadTasks = async (projectId) => {
    if (!projectId) return;
    const { data } = await getTasksByProject(projectId);
    setTasks(data);
  };

  useEffect(() => {
    getMe()
      .then(({ data }) => { setUser(data.user); localStorage.setItem("user", JSON.stringify(data.user)); })
      .catch(() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); });
  }, [navigate]);

  useEffect(() => { loadProjects().catch(() => setError("Could not load projects")); }, []);

  useEffect(() => {
    if (user.role !== "admin") { setMembers([]); return; }
    getUsers().then(({ data }) => setMembers(data)).catch(() => setError("Could not load members"));
  }, [user.role]);

  useEffect(() => { loadTasks(selectedProjectId).catch(() => setError("Could not load tasks")); }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProject || user.role !== "admin") { setTaskForm((prev) => ({ ...prev, assignedTo: "" })); return; }
    const firstMemberId = selectedProject.members?.find((m) => m.role === "member")?._id || "";
    setTaskForm((prev) => ({ ...prev, assignedTo: prev.assignedTo || firstMemberId }));
  }, [selectedProject, user.role]);

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); };

  const onCreateProject = async (e) => {
    e.preventDefault(); setError("");
    try {
      await createProject({ name: projectForm.name, description: projectForm.description, members: projectForm.memberIds });
      setProjectForm(emptyProject); await loadProjects();
    } catch (err) { setError(err.response?.data?.message || "Could not create project"); }
  };

  const onCreateTask = async (e) => {
    e.preventDefault(); if (!selectedProjectId) return; setError("");
    try {
      await createTask({ ...taskForm, projectId: selectedProjectId });
      setTaskForm(emptyTask); await loadTasks(selectedProjectId);
    } catch (err) { setError(err.response?.data?.message || "Could not create task"); }
  };

  const onUpdateTaskStatus = async (taskId, status) => {
    try { await updateTask(taskId, { status }); await loadTasks(selectedProjectId); }
    catch (err) { setError(err.response?.data?.message || "Could not update task"); }
  };

  const initials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  const isDueOverdue = (task) =>
    task.status !== "completed" && task.dueDate && new Date(task.dueDate) < new Date();

  const canMemberEditTask = (task) =>
    user.role !== "member" || String(task.assignedTo?._id) === String(user.id);

  const projectOptions = projects.map(p => ({ value: p._id, label: p.name }));
  const memberOptions = (selectedProject?.members || [])
    .filter(m => m.role === "member")
    .map(m => ({ value: m._id, label: `${m.name} (${m.email})` }));

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">

        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-logo">
            <div className="logo-mark">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.35"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.35"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.75"/>
              </svg>
            </div>
            <span className="topbar-brand">Task<em>Flow</em></span>
          </div>
          <div className="topbar-right">
            <div className="topbar-badge">{projects.length} projects</div>
            <div className="user-pill">
              <div className="user-avatar">{initials(user.name || "U")}</div>
              <div className="user-info">
                <div className="user-name">{user.name || "User"}</div>
                <div className="user-role">{user.role || "member"}</div>
              </div>
            </div>
            <button className="btn-logout" onClick={logout}>Sign out</button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="main-content">

          <div className="page-header">
            <div className="page-title">Good morning, <em>{user.name?.split(" ")[0] || "there"}</em></div>
            <div className="page-date">{today}</div>
          </div>

          {error && (
            <div className="error-bar">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* STATS */}
          <div className="stats">
            {[
              { label: "Total Tasks", value: stats.total, cls: "total",
                icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="#2563a8" strokeWidth="1.4"/><path d="M4.5 8h7M4.5 5h7M4.5 11h4.5" stroke="#2563a8" strokeWidth="1.3" strokeLinecap="round"/></svg> },
              { label: "Completed", value: stats.completed, cls: "done",
                icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="#2d8a4e" strokeWidth="1.4"/><path d="M5 8l2.5 2.5L11 5.5" stroke="#2d8a4e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { label: "Pending", value: stats.pending, cls: "pending",
                icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="#c47a1a" strokeWidth="1.4"/><path d="M8 4.5V8l2.5 2" stroke="#c47a1a" strokeWidth="1.4" strokeLinecap="round"/></svg> },
              { label: "Overdue", value: stats.overdue, cls: "overdue",
                icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="#c0392b" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6v3M8 10.8v.7" stroke="#c0392b" strokeWidth="1.4" strokeLinecap="round"/></svg> }
            ].map(({ label, value, cls, icon }) => (
              <div key={cls} className={`stat-card ${cls}`}>
                <div className="stat-card-top" />
                <div className="stat-icon">{icon}</div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
              </div>
            ))}
          </div>

          {/* PANEL GRID */}
          <div className="panel-grid">

            <div className="card">
              <div className="card-title">
                <span className="card-title-dot" style={{ background: "var(--accent2)" }} />
                Projects
              </div>
              <div className="field">
                <label>Active Project</label>
                <CustomSelect
                  value={selectedProjectId}
                  onChange={setSelectedProjectId}
                  options={projectOptions}
                  placeholder="Select a project"
                />
              </div>

              {user.role === "admin" && (
                <>
                  <div className="divider" />
                  <div className="section-label">New Project</div>
                  <form onSubmit={onCreateProject}>
                    <div className="field">
                      <label>Project Name</label>
                      <input type="text" placeholder="e.g. Website Redesign"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm((p) => ({ ...p, name: e.target.value }))}
                        required />
                    </div>
                    <div className="field">
                      <label>Description</label>
                      <textarea placeholder="What's this project about?"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="field">
                      <label>Assign Members</label>
                      <div className="member-list">
                        {members.length === 0 && (
                          <div style={{ padding: "10px 8px", fontSize: "0.82rem", color: "var(--muted2)" }}>No members available</div>
                        )}
                        {members.map((member) => (
                          <MemberCheckItem
                            key={member._id} member={member}
                            checked={projectForm.memberIds.includes(member._id)}
                            onChange={(checked) =>
                              setProjectForm((p) => ({
                                ...p,
                                memberIds: checked
                                  ? [...p.memberIds, member._id]
                                  : p.memberIds.filter((id) => id !== member._id)
                              }))
                            }
                          />
                        ))}
                      </div>
                      {projectForm.memberIds.length > 0 && (
                        <div style={{ marginTop: 6, fontSize: "0.72rem", color: "var(--accent2)", fontWeight: 600 }}>
                          {projectForm.memberIds.length} member{projectForm.memberIds.length !== 1 ? "s" : ""} selected
                        </div>
                      )}
                    </div>
                    <button type="submit" className="btn btn-primary">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Create Project
                    </button>
                  </form>
                </>
              )}
            </div>

            {user.role === "admin" && (
              <div className="card">
                <div className="card-title">
                  <span className="card-title-dot" style={{ background: "var(--accent)" }} />
                  New Task
                </div>
                <form onSubmit={onCreateTask}>
                  <div className="field">
                    <label>Task Title</label>
                    <input type="text" placeholder="What needs to be done?"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                      required />
                  </div>
                  <div className="field">
                    <label>Description</label>
                    <textarea placeholder="Add details, context, or notes"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Due Date</label>
                    <input type="date" value={taskForm.dueDate}
                      onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
                      required />
                  </div>
                  <div className="field">
                    <label>Assign To Member</label>
                    <CustomSelect
                      value={taskForm.assignedTo}
                      onChange={(v) => setTaskForm((p) => ({ ...p, assignedTo: v }))}
                      options={memberOptions}
                      placeholder="Select member"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary"
                    disabled={!selectedProject || !taskForm.assignedTo}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {selectedProject ? `Add to "${selectedProject.name}"` : "Select a project first"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* TASKS TABLE */}
          <div className="tasks-card">
            <div className="tasks-header">
              <div className="card-title" style={{ margin: 0 }}>
                <span className="card-title-dot" style={{ background: "var(--accent)" }} />
                {selectedProject ? `${selectedProject.name} — Tasks` : "Tasks"}
              </div>
              {tasks.length > 0 && (
                <span className="tasks-count">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
              )}
            </div>

            {!selectedProject ? (
              <div className="empty-state">
                <div className="empty-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="2" y="2" width="18" height="18" rx="4" stroke="#9b9690" strokeWidth="1.4"/>
                    <path d="M7 11h8M7 7h8M7 15h5" stroke="#9b9690" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="empty-title">No project selected</div>
                <div className="empty-sub">Choose a project above to see its tasks</div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 3v8M11 3l-3 3M11 3l3 3" stroke="#9b9690" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 14v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="#9b9690" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="empty-title">No tasks yet</div>
                <div className="empty-sub">Add the first task to this project</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td>
                        <div className="task-title-cell">{task.title}</div>
                        {task.description && <div className="task-title-desc">{task.description}</div>}
                      </td>
                      <td>
                        <StatusSelect
                          value={task.status}
                          onChange={(s) => onUpdateTaskStatus(task._id, s)}
                          disabled={!canMemberEditTask(task)}
                        />
                      </td>
                      <td>
                        <span className={`due-date${isDueOverdue(task) ? " overdue" : ""}`}>
                          {isDueOverdue(task) && (
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <path d="M5.5 1L10 9.5H1L5.5 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                              <path d="M5.5 4v2.5M5.5 8v.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          )}
                          {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>
                      <td>
                        {task.assignedTo ? (
                          <div className="assignee">
                            <div className="assignee-dot">{initials(task.assignedTo?.name || "?")}</div>
                            <span>{task.assignedTo?.name || "N/A"}</span>
                          </div>
                        ) : (
                          <span style={{ color: "var(--muted2)", fontSize: "0.82rem" }}>Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default DashboardPage; 