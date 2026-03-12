import { useState, useRef, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const STATUS = {
    todo:        { label: "To Do",       color: "#3B82F6", bg: "#EFF6FF", dot: "#3B82F6" },
    in_progress: { label: "In Progress", color: "#F59E0B", bg: "#FFFBEB", dot: "#F59E0B" },
    done:        { label: "Done",        color: "#10B981", bg: "#ECFDF5", dot: "#10B981" },
    late:        { label: "Late",        color: "#EF4444", bg: "#FEF2F2", dot: "#EF4444" },
};

const PRIORITY = {
    low:    { label: "Low",    color: "#64748B", ring: "#CBD5E1" },
    medium: { label: "Medium", color: "#F59E0B", ring: "#FDE68A" },
    high:   { label: "High",   color: "#EF4444", ring: "#FECACA" },
};

const TYPES = ["Essay", "Quiz", "Project", "Laporan", "Presentasi", "Praktikum", "Lainnya"];
const TYPES_COLORS = {
    Essay: "#8B5CF6", Quiz: "#F59E0B", Project: "#10B981",
    Laporan: "#3B82F6", Presentasi: "#EC4899", Praktikum: "#06B6D4", Lainnya: "#64748B",
};

const T = {
    primary: "#800020", accent: "#A0002A", primary3: "#5a0016",
    bg: "#FFFFFF", surface: "#FFFFFF", surfaceAlt: "#F5E6EA",
    border: "#E0E0E0", borderStr: "#BDBDBD",
    text: "#1a1a1a", textMid: "#800020", textMute: "#C48A96",
    inputBg: "#FDF5F7", cardShadow: "0 4px 20px rgba(128,0,32,0.10)",
};

function Badge({ children, color, bg }) {
    return <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: bg || color + "18", color, letterSpacing: "0.04em" }}>{children}</span>;
}

function iStyle(extra = {}) {
    return {
        width: "100%", padding: "9px 12px", fontSize: 13, borderRadius: 8,
        border: `1.5px solid ${T.border}`, background: T.inputBg,
        color: T.text, outline: "none", boxSizing: "border-box", ...extra,
    };
}

// ── CHATBOT ───────────────────────────────────────────────────
function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "ai", text: "Halo! Aku **Babu-Mu** 🤖\nSaat ini layanan Babu-Mu belum tersedia." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const dragRef = useRef(null);
    const dragging = useRef(false);
    const startOffset = useRef({ x: 0, y: 0 });
    const [pos, setPos] = useState(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    useEffect(() => { if (!open) setPos(null); }, [open]);

    const onDragStart = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = dragRef.current.getBoundingClientRect();
        startOffset.current = { x: clientX - rect.left, y: clientY - rect.top };
        dragging.current = true;

        const onMove = (ev) => {
            if (!dragging.current) return;
            const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
            const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
            const W = dragRef.current.offsetWidth;
            const H = dragRef.current.offsetHeight;
            const x = Math.max(0, Math.min(window.innerWidth - W, cx - startOffset.current.x));
            const y = Math.max(0, Math.min(window.innerHeight - H, cy - startOffset.current.y));
            setPos({ x, y });
        };
        const onEnd = () => {
            dragging.current = false;
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onEnd);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onEnd);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onEnd);
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onEnd);
    };

    const send = async () => {
        const msg = input.trim();
        if (!msg || loading) return;
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: msg }]);
        setLoading(true);
        try {
            const res = await fetch("/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content },
                body: JSON.stringify({ message: msg }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: "ai", text: data.reply || "Maaf, tidak bisa menjawab." }]);
        } catch {
            setMessages(prev => [...prev, { role: "ai", text: "Dibilang belum tersedia, usaha dikit kek!" }]);
        } finally {
            setLoading(false);
        }
    };

    const formatText = (text) =>
        text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

    const chatStyle = pos
        ? { position: "fixed", left: pos.x, top: pos.y, bottom: "auto", right: "auto" }
        : { position: "fixed", bottom: 90, right: 16 };

    return (
        <>
            {open && (
                <div ref={dragRef} style={{ ...chatStyle, width: "min(360px, calc(100vw - 32px))", height: "min(480px, calc(100vh - 120px))", background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(128,0,32,0.20)", border: `1.5px solid ${T.border}`, display: "flex", flexDirection: "column", zIndex: 999, animation: pos ? "none" : "slideUp 0.2s ease", touchAction: "none" }}>
                    <style>{`
                        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
                        .chat-bubble-ai { background:${T.surfaceAlt};color:${T.text};border-radius:4px 16px 16px 16px; }
                        .chat-bubble-user { background:${T.primary};color:#fff;border-radius:16px 4px 16px 16px; }
                        .chat-input:focus { border-color:${T.primary}!important; }
                        .chat-header { cursor: grab; user-select: none; -webkit-user-select: none; }
                        .chat-header:active { cursor: grabbing; }
                    `}</style>

                    {/* Header - drag handle */}
                    <div className="chat-header" onMouseDown={onDragStart} onTouchStart={onDragStart}
                        style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, borderRadius: "18px 18px 0 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Babu-Mu</div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>✥ Drag me anywhere</div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
                            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                                <div className={m.role === "ai" ? "chat-bubble-ai" : "chat-bubble-user"} style={{ maxWidth: "82%", padding: "10px 14px", fontSize: 13, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div className="chat-bubble-ai" style={{ padding: "10px 16px" }}>
                                    <span style={{ display: "inline-flex", gap: 4 }}>
                                        {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.primary, animation: `bounce 1s ${i*0.2}s infinite`, display: "inline-block" }} />)}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                    <div style={{ padding: "10px 14px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
                        <input className="chat-input" placeholder="Tanya soal tugas..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, outline: "none", background: T.inputBg, color: T.text }} />
                        <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "9px 14px", borderRadius: 10, background: input.trim() ? T.primary : T.border, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: input.trim() ? "pointer" : "default" }}>Kirim</button>
                    </div>
                </div>
            )}
            <button onClick={() => setOpen(o => !o)}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                style={{ position: "fixed", bottom: 24, right: 16, width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, border: "none", color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 999, boxShadow: `0 8px 24px rgba(128,0,32,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}>
                {open ? "✕" : "🤖"}
            </button>
        </>
    );
}

// ── TEAM PANEL ───────────────────────────────────────────────
function TeamPanel({ teams, onClose }) {
    const [tab, setTab] = useState("list");
    const [teamName, setTeamName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [copied, setCopied] = useState(null);

    const createTeam = () => { if (!teamName.trim()) return; router.post(route("teams.store"), { name: teamName }, { preserveScroll: true, onFinish: () => { setTeamName(""); setTab("list"); } }); };
    const joinTeam = () => { if (!inviteCode.trim()) return; router.post(route("teams.join"), { invite_code: inviteCode }, { preserveScroll: true, onFinish: () => { setInviteCode(""); setTab("list"); } }); };
    const leaveTeam = (id) => { if (confirm("Leave from this team?")) router.delete(route("teams.leave", id), { preserveScroll: true }); };
    const deleteTeam = (id) => { if (confirm("Delete this team?")) router.delete(route("teams.destroy", id), { preserveScroll: true }); };
    const copyCode = (code) => { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 2000); };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(7,89,133,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(6px)", padding: "16px" }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 22, padding: 24, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(7,89,133,0.25)", border: `1.5px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👥</div>
                    <div><div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>Team up!</div><div style={{ fontSize: 12, color: T.textMute }}>Bring your folks</div></div>
                </div>
                <div style={{ display: "flex", gap: 4, marginBottom: 18, background: T.surfaceAlt, borderRadius: 10, padding: 4 }}>
                    {[{ key: "list", label: "My Team" }, { key: "create", label: "Create" }, { key: "join", label: "Join" }].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? T.primary : T.textMid, boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>{t.label}</button>
                    ))}
                </div>
                {tab === "list" && (
                    <div>
                        {teams.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "32px 0", color: T.textMute }}><div style={{ fontSize: 36, marginBottom: 10 }}>🏝️</div><div style={{ fontSize: 13 }}>No teams yet. Create or join one!</div></div>
                        ) : teams.map(team => (
                            <div key={team.id} style={{ marginBottom: 12, padding: 14, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                    <div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{team.name}</div><div style={{ fontSize: 11, color: T.textMute, marginTop: 2 }}>{team.members.length} member</div></div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {team.is_owner && <button onClick={() => deleteTeam(team.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontWeight: 600, background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" }}>Delete</button>}
                                        {!team.is_owner && <button onClick={() => leaveTeam(team.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontWeight: 600, background: T.surfaceAlt, color: T.textMid, border: `1px solid ${T.border}` }}>Leave</button>}
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fff", borderRadius: 8, border: `1px dashed ${T.borderStr}` }}>
                                    <span style={{ fontSize: 11, color: T.textMute }}>Code:</span>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: T.primary, letterSpacing: "0.15em", flex: 1 }}>{team.invite_code}</span>
                                    <button onClick={() => copyCode(team.invite_code)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 600, background: copied === team.invite_code ? "#ECFDF5" : T.surfaceAlt, color: copied === team.invite_code ? "#10B981" : T.primary, border: `1px solid ${T.border}` }}>{copied === team.invite_code ? "✓ Copied!" : "Copy"}</button>
                                </div>
                                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {team.members.map(m => <span key={m.id} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: T.surfaceAlt, color: T.textMid, border: `1px solid ${T.border}` }}>{team.is_owner && m.id === team.owner_id ? "👑 " : ""}{m.name}</span>)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {tab === "create" && (
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Team Name</label>
                        <input placeholder="e.g. Study Group A" value={teamName} onChange={e => setTeamName(e.target.value)} onKeyDown={e => e.key === "Enter" && createTeam()} style={{ ...iStyle(), marginBottom: 16 }} />
                        <button onClick={createTeam} style={{ width: "100%", padding: 12, borderRadius: 10, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Create</button>
                    </div>
                )}
                {tab === "join" && (
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Paste the code</label>
                        <input placeholder="Enter 6-letter code..." value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && joinTeam()} style={{ ...iStyle({ textAlign: "center", fontSize: 20, fontWeight: 800, letterSpacing: "0.2em" }), marginBottom: 16 }} />
                        <button onClick={joinTeam} style={{ width: "100%", padding: 12, borderRadius: 10, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Join</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── ASSIGNMENT CARD ───────────────────────────────────────────
function AssignmentCard({ item, selected, onSelect, teams }) {
    const daysLeft = item.deadline ? Math.ceil((new Date(item.deadline) - new Date()) / 86400000) : null;
    const statusInfo = STATUS[item.status];
    const priorityInfo = PRIORITY[item.priority];
    const typeColor = TYPES_COLORS[item.type] || "#64748B";
    const teamInfo = teams.find(t => t.id === item.team_id);
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({ title: item.title, subject: item.subject, lecturer: item.lecturer || "", status: item.status, priority: item.priority, type: item.type || "", deadline: item.deadline ? item.deadline.split("T")[0] : "", notes: item.notes || "", team_id: item.team_id || "" });

    const changeStatus = (status) => router.put(route("assignments.update", item.id), { status }, { preserveScroll: true });
    const deleteItem = () => { if (confirm(`Delete "${item.title}"?`)) router.delete(route("assignments.destroy", item.id), { preserveScroll: true }); };
    const submitEdit = () => router.put(route("assignments.update", item.id), editForm, { preserveScroll: true, onFinish: () => setShowEdit(false) });

    const dl = () => {
        if (!item.deadline) return { text: "No deadline", color: T.textMute };
        if (item.status === "done") return { text: "✅ Done", color: "#10B981" };
        if (daysLeft < 0) return { text: "⚠️ Overdue!", color: "#EF4444" };
        if (daysLeft === 0) return { text: "🔥 Due today!", color: "#F97316" };
        if (daysLeft <= 2) return { text: `⚡ ${daysLeft} days left`, color: "#F97316" };
        return { text: `📅 ${daysLeft} days left`, color: T.textMid };
    };
    const deadline = dl();

    return (
        <>
            <div onClick={() => onSelect(item.id)} style={{ background: T.surface, borderRadius: 18, border: `2px solid ${selected ? T.primary : T.border}`, boxShadow: selected ? `0 0 0 4px ${T.primary}20, ${T.cardShadow}` : T.cardShadow, padding: "18px 18px 14px", cursor: "pointer", transition: "all 0.2s ease", width: "100%", boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`, borderRadius: "18px 18px 0 0" }} />
                <div style={{ position: "absolute", top: 14, right: 14, width: 10, height: 10, borderRadius: "50%", background: priorityInfo.color, boxShadow: `0 0 0 3px ${priorityInfo.ring}` }} />
                {teamInfo && <div style={{ position: "absolute", top: 12, left: 18, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: T.surfaceAlt, color: T.primary, border: `1px solid ${T.border}` }}>👥 {teamInfo.name}</div>}
                <div style={{ marginTop: teamInfo ? 20 : 0 }}>
                    <div style={{ marginBottom: 10, paddingRight: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3, textDecoration: item.status === "done" ? "line-through" : "none", opacity: item.status === "done" ? 0.55 : 1, lineHeight: 1.4 }}>{item.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>{item.subject}</span>
                            {item.lecturer && <span style={{ fontSize: 11, color: T.textMute }}>· {item.lecturer}</span>}
                        </div>
                        {item.created_by && item.team_id && <div style={{ fontSize: 10, color: T.textMute, marginTop: 2 }}>by {item.created_by}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                        <Badge color={statusInfo.color} bg={statusInfo.bg}><span style={{ width: 5, height: 5, borderRadius: "50%", background: statusInfo.dot, display: "inline-block", marginRight: 4 }} />{statusInfo.label}</Badge>
                        {item.type && <Badge color={typeColor}>{item.type}</Badge>}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: deadline.color }}>{deadline.text}</div>
                    {daysLeft !== null && item.status !== "done" && (
                        <div style={{ height: 3, background: T.surfaceAlt, borderRadius: 4, marginTop: 8 }}>
                            <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, 100 - (daysLeft / 14) * 100))}%`, background: daysLeft < 3 ? "#EF4444" : daysLeft < 7 ? "#F59E0B" : T.primary, borderRadius: 4, transition: "width 0.5s ease" }} />
                        </div>
                    )}
                </div>
                {selected && (
                    <div style={{ marginTop: 14, borderTop: `1px dashed ${T.border}`, paddingTop: 12 }} onClick={e => e.stopPropagation()}>
                        {item.notes && <div style={{ marginBottom: 10, padding: "10px 13px", borderRadius: 10, background: "#FFFBEB", border: "1px solid #FDE68A", fontSize: 12, color: "#92400E" }}>💡 {item.notes}</div>}
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMute, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Change Status</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                            {Object.keys(STATUS).filter(s => s !== item.status).map(s => <button key={s} onClick={() => changeStatus(s)} style={{ fontSize: 11, padding: "5px 11px", borderRadius: 20, cursor: "pointer", fontWeight: 600, background: STATUS[s].bg, color: STATUS[s].color, border: `1px solid ${STATUS[s].dot}40` }}>→ {STATUS[s].label}</button>)}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            <button onClick={() => setShowEdit(true)} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 600, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>✏️ Edit</button>
                            <button onClick={deleteItem} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontWeight: 600, background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" }}>🗑 Delete</button>
                        </div>
                    </div>
                )}
            </div>
            {showEdit && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(7,89,133,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(6px)", padding: "16px" }} onClick={() => setShowEdit(false)}>
                    <div style={{ background: "#fff", borderRadius: 22, padding: 24, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(7,89,133,0.25)", border: `1.5px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: T.text, fontSize: 17, fontWeight: 800, margin: "0 0 20px" }}>✏️ Edit Assignment</h2>
                        {[{ key: "title", label: "Title", placeholder: "e.g. Case Analysis" }, { key: "subject", label: "Subject", placeholder: "e.g. Strategic Management" }, { key: "lecturer", label: "Lecturer", placeholder: "e.g. Prof. Budi" }, { key: "notes", label: "Notes", placeholder: "Instructions or notes..." }].map(({ key, label, placeholder }) => (
                            <div key={key} style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
                                <input placeholder={placeholder} value={editForm[key]} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} style={iStyle()} />
                            </div>
                        ))}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                            {[{ key: "status", label: "Status", opts: Object.keys(STATUS).map(s => ({ v: s, l: STATUS[s].label })) }, { key: "priority", label: "Priority", opts: Object.keys(PRIORITY).map(p => ({ v: p, l: PRIORITY[p].label })) }, { key: "type", label: "Type", opts: [{ v: "", l: "-- Select --" }, ...TYPES.map(tp => ({ v: tp, l: tp }))] }].map(({ key, label, opts }) => (
                                <div key={key}>
                                    <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
                                    <select value={editForm[key]} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} style={iStyle()}>{opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
                                </div>
                            ))}
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Deadline</label>
                                <input type="date" value={editForm.deadline} onChange={e => setEditForm(p => ({ ...p, deadline: e.target.value }))} style={iStyle()} />
                            </div>
                        </div>
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Team (optional)</label>
                            <select value={editForm.team_id} onChange={e => setEditForm(p => ({ ...p, team_id: e.target.value }))} style={iStyle()}>
                                <option value="">-- Personal --</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setShowEdit(false)} style={{ flex: 1, padding: 11, borderRadius: 10, background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                            <button onClick={submitEdit} style={{ flex: 2, padding: 11, borderRadius: 10, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── ADD MODAL ─────────────────────────────────────────────────
function AddModal({ onClose, teams }) {
    const [form, setForm] = useState({ title: "", subject: "", lecturer: "", status: "todo", priority: "medium", type: "", deadline: "", notes: "", team_id: "" });
    const [loading, setLoading] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.subject.trim()) return;
        setLoading(true);
        router.post(route("assignments.store"), form, { onFinish: () => { setLoading(false); onClose(); }, preserveScroll: true });
    };
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(7,89,133,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(6px)" }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: "22px", padding: "24px 20px", width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(7,89,133,0.2)" }} onClick={e => e.stopPropagation()}>
                {/* drag handle */}
                <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border, margin: "0 auto 20px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                    <img src="/images/tugasbaru.gif" style={{ width: 32, height: 32 }} />
                    <div>
                        <h2 style={{ color: T.text, fontSize: 17, fontWeight: 800, margin: 0 }}>Add a new Assignment</h2>
                        <p style={{ color: T.textMute, fontSize: 12, margin: 0 }}>Mark it, do later.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    {[{ key: "title", label: "Title *", placeholder: "e.g. Science" }, { key: "subject", label: "Subject *", placeholder: "e.g. Management" }, { key: "lecturer", label: "Lecturer", placeholder: "e.g. Prof. Dr. Siti Rahayu" }, { key: "notes", label: "Notes / Instructions", placeholder: "Task details, references..." }].map(({ key, label, placeholder }) => (
                        <div key={key} style={{ marginBottom: 13 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
                            <input placeholder={placeholder} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={iStyle()} />
                        </div>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 13 }}>
                        {[{ key: "status", label: "Status", opts: Object.keys(STATUS).map(s => ({ v: s, l: STATUS[s].label })) }, { key: "priority", label: "Priority", opts: Object.keys(PRIORITY).map(p => ({ v: p, l: PRIORITY[p].label })) }, { key: "type", label: "Type", opts: [{ v: "", l: "-- Select --" }, ...TYPES.map(tp => ({ v: tp, l: tp }))] }].map(({ key, label, opts }) => (
                            <div key={key}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
                                <select value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={iStyle()}>{opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
                            </div>
                        ))}
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Deadline</label>
                            <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} style={iStyle()} />
                        </div>
                    </div>
                    {teams.length > 0 && (
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMid, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Assign to Team (optional)</label>
                            <select value={form.team_id} onChange={e => setForm(p => ({ ...p, team_id: e.target.value }))} style={iStyle()}>
                                <option value="">-- Personal --</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div style={{ display: "flex", gap: 10 }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 11, background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ flex: 2, padding: 12, borderRadius: 11, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1 }}>
                            {loading ? "Saving..." : "Add Assignment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── MOBILE BOTTOM NAV ─────────────────────────────────────────
function MobileBottomNav({ filterStatus, setFilterStatus, onAdd, onTeam, list }) {
    return (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0 env(safe-area-inset-bottom, 8px)", zIndex: 90, boxShadow: "0 -4px 20px rgba(128,0,32,0.08)" }}>
            {[
                { key: "all", icon: <img src="/images/all.png" style={{ width: 20, height: 20 }} />, label: "All", count: list.length },
                { key: "todo", icon: <img src="/images/todo.png" style={{ width: 16, height: 16 }} />, label: "To Do", count: list.filter(d => d.status === "todo").length },
                { key: "in_progress", icon: <img src="/images/progress.png" style={{ width: 16, height: 16 }} />, label: "Progress", count: list.filter(d => d.status === "in_progress").length },
                { key: "done", icon: <img src="/images/checkmark.png" style={{ width: 16, height: 16 }} />, label: "Done", count: list.filter(d => d.status === "done").length },
            ].map(item => (
                <button key={item.key} onClick={() => setFilterStatus(item.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 10, color: filterStatus === item.key ? T.primary : T.textMute }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.03em" }}>{item.label}</span>
                    {item.count > 0 && <span style={{ fontSize: 9, fontWeight: 800, color: filterStatus === item.key ? T.primary : T.textMute }}>{item.count}</span>}
                </button>
            ))}
            <button onClick={onTeam} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 10, color: T.textMute }}>
                <img src="/images/team.png" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 9, fontWeight: 700 }}>Team</span>
            </button>
            <button onClick={onAdd} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: T.primary, border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: 12, color: "#fff" }}>
                <span style={{ fontSize: 18 }}>＋</span>
                <span style={{ fontSize: 9, fontWeight: 700 }}>Add</span>
            </button>
        </div>
    );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function Index({ assignments, teams, flash }) {
    const [selected, setSelected] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterTeam, setFilterTeam] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [showTeamPanel, setShowTeamPanel] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [search, setSearch] = useState("");

    const list = assignments || [];
    const teamList = teams || [];

    const filtered = list
        .filter(d => filterStatus === "all" || d.status === filterStatus)
        .filter(d => filterTeam === "all" || (filterTeam === "personal" ? !d.team_id : d.team_id === parseInt(filterTeam)))
        .filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.subject.toLowerCase().includes(search.toLowerCase()) || (d.lecturer || "").toLowerCase().includes(search.toLowerCase()));

    const stats = { total: list.length, todo: list.filter(d => d.status === "todo").length, in_progress: list.filter(d => d.status === "in_progress").length, done: list.filter(d => d.status === "done").length, late: list.filter(d => d.status === "late").length };
    const urgent = list.filter(d => { if (d.status === "done") return false; const dl = d.deadline ? Math.ceil((new Date(d.deadline) - new Date()) / 86400000) : null; return dl !== null && dl <= 2; });
    const subjects = [...new Set(list.map(d => d.subject))];

    return (
        <AuthenticatedLayout>
            <Head title="you are awful" />
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: ${T.bg}; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: ${T.bg}; }
                ::-webkit-scrollbar-thumb { background: ${T.borderStr}; border-radius: 3px; }
                select option { background: #fff; color: ${T.text}; }

                /* ── RESPONSIVE ── */
                .sidebar-desktop { display: flex; }
                .topbar-stats { display: flex; }
                .topbar-search { display: flex; }
                .mobile-bottom-nav { display: none; }
                .main-padding { padding: 28px 32px; }
                .card-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }

                @media (max-width: 768px) {
                    .sidebar-desktop { display: none !important; }
                    .topbar-stats { display: none !important; }
                    .topbar-search { width: 100% !important; }
                    .mobile-bottom-nav { display: flex !important; }
                    .main-padding { padding: 16px 12px 90px !important; }
                    .card-grid { grid-template-columns: 1fr !important; }
                    .topbar-inner { flex-direction: column; height: auto !important; padding: 10px 16px !important; gap: 10px; }
                    .topbar-left { width: 100%; }
                    .topbar-right { width: 100%; justify-content: space-between !important; }
                    .topbar-team-btn { display: none !important; }
                    .topbar-add-btn { display: none !important; }
                }

                @media (max-width: 480px) {
                    .topbar-logo-name { font-size: 15px !important; }
                    .card-grid { gap: 10px !important; }
                }
            `}</style>

            <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
                {flash && <div style={{ position: "fixed", top: 80, right: 16, zIndex: 200, padding: "12px 18px", borderRadius: 12, background: "#ECFDF5", border: "1.5px solid #6EE7B7", fontSize: 13, fontWeight: 600, color: "#065F46", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "calc(100vw - 32px)" }}>✅ {flash}</div>}

                {/* TOPBAR */}
                <div style={{ background: "#fff", borderBottom: `1px solid ${T.border}`, padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 12px rgba(128,0,32,0.08)" }} className="topbar-inner">
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }} className="topbar-left">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img src="/images/logoA.jpg" style={{ width: 34, height: 34, objectFit: "contain" }} />
                            <div>
                                <div className="topbar-logo-name" style={{ fontSize: 17, fontWeight: 900, color: 'black', letterSpacing: "-0.03em", lineHeight: 1 }}>awfulnotes</div>
                                <div style={{ fontSize: 10, color: T.primary, fontWeight: 600, letterSpacing: "0.05em" }}>LAZY COLLEGERS SOCIETY</div>
                            </div>
                        </div>
                        <div style={{ width: 1, height: 28, background: T.border }} className="topbar-stats" />
                        <div style={{ display: "flex", gap: 12 }} className="topbar-stats">
                            {[{ label: "Total", value: stats.total, color: T.text }, { label: "To Do", value: stats.todo, color: "black" }, { label: "Progress", value: stats.in_progress, color: "black" }, { label: "Done", value: stats.done, color: "black" }, { label: "Late", value: stats.late, color: "#EF4444" }].map(s => (
                                <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</span>
                                    <span style={{ fontSize: 10, color: T.textMute, fontWeight: 600 }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }} className="topbar-right">
                        <input placeholder="🔍  Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "8px 14px", border: `1.5px solid ${T.border}`, borderRadius: 22, fontSize: 12, color: T.text, outline: "none", width: 200, background: T.bg, flex: 1, minWidth: 0 }} className="topbar-search" />
                        <button onClick={() => setShowTeamPanel(true)} className="topbar-team-btn" style={{ padding: "9px 14px", borderRadius: 12, border: `1.5px solid ${T.border}`, background: "#fff", color: T.primary, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                            👥 Collegemate {teamList.length > 0 && <span style={{ background: T.primary, color: "#fff", borderRadius: 8, fontSize: 11, padding: "1px 6px" }}>{teamList.length}</span>}
                        </button>
                        <button onClick={() => setShowModal(true)} className="topbar-add-btn" style={{ padding: "9px 18px", borderRadius: 12, background: T.primary, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", boxShadow: `0 4px 14px ${T.primary}40` }}>
                            <span style={{ fontSize: 16 }}>+</span> Add Assignment
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex" }}>
                    {/* SIDEBAR - desktop only */}
                    <div className="sidebar-desktop" style={{ width: 200, flexShrink: 0, background: "#fff", borderRight: `1px solid ${T.border}`, minHeight: "calc(100vh - 64px)", padding: "20px 0", flexDirection: "column" }}>
                        <div style={{ padding: "0 16px 10px", fontSize: 10, fontWeight: 800, color: 'black', textTransform: "uppercase", letterSpacing: "0.12em" }}>Status</div>
                        {[{ key: "all", label: "All", count: list.length, color: T.primary }, ...Object.keys(STATUS).map(k => ({ key: k, label: STATUS[k].label, count: list.filter(d => d.status === k).length, color: STATUS[k].color }))].map(item => (
                            <button key={item.key} onClick={() => setFilterStatus(item.key)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 16px", background: filterStatus === item.key ? T.surfaceAlt : "transparent", border: "none", borderLeft: `3px solid ${filterStatus === item.key ? item.color : "transparent"}`, color: filterStatus === item.key ? T.text : T.textMid, fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: filterStatus === item.key ? 700 : 400, transition: "all 0.12s" }}>
                                <span>{item.label}</span>
                                <span style={{ fontSize: 11, background: filterStatus === item.key ? item.color + "20" : T.surfaceAlt, color: filterStatus === item.key ? item.color : T.textMute, padding: "1px 8px", borderRadius: 10, fontWeight: 600 }}>{item.count}</span>
                            </button>
                        ))}
                        {teamList.length > 0 && (
                            <>
                                <div style={{ margin: "20px 16px 10px", borderTop: `1px solid ${T.border}`, paddingTop: 16, fontSize: 10, fontWeight: 800, color: 'black', textTransform: "uppercase", letterSpacing: "0.12em" }}>Team</div>
                                {[{ key: "all", label: "All", color: T.primary }, { key: "personal", label: "Personal", color: "#64748B" }, ...teamList.map(t => ({ key: String(t.id), label: t.name, color: T.primary }))].map(item => (
                                    <button key={item.key} onClick={() => setFilterTeam(item.key)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 16px", background: filterTeam === item.key ? T.surfaceAlt : "transparent", border: "none", borderLeft: `3px solid ${filterTeam === item.key ? item.color : "transparent"}`, color: filterTeam === item.key ? T.text : T.textMid, fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: filterTeam === item.key ? 700 : 400 }}>
                                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0 }} />{item.label}
                                    </button>
                                ))}
                            </>
                        )}
                        {subjects.length > 0 && (
                            <>
                                <div style={{ margin: "20px 16px 10px", borderTop: `1px solid ${T.border}`, paddingTop: 16, fontSize: 10, fontWeight: 800, color: 'black', textTransform: "uppercase", letterSpacing: "0.12em" }}>Subject</div>
                                {subjects.map(s => (
                                    <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 16px", fontSize: 12, color: T.textMid }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: T.primary, flexShrink: 0 }} />{s}</span>
                                        <span style={{ fontSize: 11, color: T.textMute }}>{list.filter(d => d.subject === s).length}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* MAIN */}
                    <div className="main-padding" style={{ flex: 1, minWidth: 0 }}>
                        {urgent.length > 0 && (
                            <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 14, background: "linear-gradient(135deg, #FFF7ED, #FEF3C7)", border: "1.5px solid #FDE68A", display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 20, flexShrink: 0 }}>⚡</span>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>{urgent.length} assignment due in 2 days!</div>
                                    <div style={{ fontSize: 12, color: "#B45309", marginTop: 2 }}>{urgent.map(u => u.title).join(", ")}</div>
                                </div>
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>{filterStatus === "all" ? "All Assignments" : STATUS[filterStatus]?.label}</h2>
                                <p style={{ fontSize: 12, color: T.textMute, marginTop: 3 }}>{filtered.length} assignment found</p>
                            </div>
                        </div>
                        <div className="card-grid" style={{ display: "grid", gap: 14, alignItems: "start" }}>
                            {filtered.map(item => <AssignmentCard key={item.id} item={item} teams={teamList} selected={selected === item.id} onSelect={id => setSelected(selected === id ? null : id)} />)}
                            {filtered.length === 0 && (
                                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px" }}>
                                    <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: 'maroon', marginBottom: 6 }}>Free time!</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showModal && <AddModal onClose={() => setShowModal(false)} teams={teamList} />}
            {showTeamPanel && <TeamPanel teams={teamList} onClose={() => setShowTeamPanel(false)} />}

            {/* Mobile bottom nav */}
            <div className="mobile-bottom-nav">
                <MobileBottomNav filterStatus={filterStatus} setFilterStatus={setFilterStatus} onAdd={() => setShowModal(true)} onTeam={() => setShowTeamPanel(true)} list={list} />
            </div>

            <Chatbot />
        </AuthenticatedLayout>
    );
}
