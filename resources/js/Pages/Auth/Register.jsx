import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

const STEPS = [
    { label: 'Yo, lazyhead!' },
    { label: 'Getting there' },
    { label: 'Almost done!' },
];

const FUN_FACTS = [
    "The average student opens awfulnotes 3 minutes before a deadline.",
    "Welcome to the club. We have procrastination and free WiFi.",
    "'Babu-Mu' is ready to assist... or not. Coin flip, really.",
    "Pro tip: write your deadline down. Let the panic marinate.",
];

const StrengthBar = ({ password }) => {
    const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
    const colors = ['#e0e0e0','#ef4444','#f59e0b','#10b981','#800020'];
    const labels = ['', 'Too weak', 'Getting better', 'Strong', 'Unbreakable'];
    return password.length > 0 ? (
        <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score] : '#f0dde2', transition: 'background 0.3s' }} />
                ))}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: colors[score] }}>{labels[score]}</span>
        </div>
    ) : null;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', password: '', password_confirmation: '',
    });

    const [focused, setFocused] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [factIdx, setFactIdx] = useState(0);
    const [factVisible, setFactVisible] = useState(true);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const filled = [data.name, data.email, data.password].filter(Boolean).length;
        setStep(Math.min(2, filled));
    }, [data.name, data.email, data.password]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFactVisible(false);
            setTimeout(() => { setFactIdx(i => (i + 1) % FUN_FACTS.length); setFactVisible(true); }, 400);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const inp = (isFocused, extra = {}) => ({
        width: '100%', padding: '11px 14px', fontSize: 13, borderRadius: 10,
        border: `2px solid ${isFocused ? '#800020' : '#e8d0d6'}`,
        background: '#fdf5f7', color: '#1a1a1a', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: "'Nunito', sans-serif",
        boxShadow: isFocused ? '0 0 0 3px rgba(128,0,32,0.12)' : 'none',
        ...extra,
    });

    const passwordMatch    = data.password && data.password_confirmation && data.password === data.password_confirmation;
    const passwordMismatch = data.password_confirmation && data.password !== data.password_confirmation;

    return (
        <>
            <Head title="Register — awfulnotes" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Abril+Fatface&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .reg-card { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
                @keyframes popIn { from{opacity:0;transform:scale(0.85) translateY(30px)} to{opacity:1;transform:scale(1) translateY(0)} }

                .fact-text { transition: opacity 0.4s, transform 0.4s; display: block; }
                .fact-visible { opacity: 1; transform: translateY(0); }
                .fact-hidden  { opacity: 0; transform: translateY(8px); }

                @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
                .float { animation: float 3s ease-in-out infinite; }

                @keyframes gradMove { 0%{background-position:0%} 100%{background-position:200%} }

                @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                .spin-slow { animation: spin-slow 14s linear infinite; }
                .spin-rev  { animation: spin-slow 10s linear infinite reverse; }

                @keyframes spin-btn { from{transform:rotate(0)} to{transform:rotate(360deg)} }

                .submit-btn { transition: transform 0.15s, box-shadow 0.15s; }
                .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(128,0,32,0.45)!important; }
                .submit-btn:active:not(:disabled) { transform: translateY(0); }

                .login-link { transition: background 0.15s; }
                .login-link:hover { background: #fff0f3!important; }

                .err { color:#c0002a; font-size:11px; margin-top:5px; font-weight:700;
                       animation: fadeIn 0.25s ease; }
                .ok  { color:#10b981; font-size:11px; margin-top:5px; font-weight:700; }
                @keyframes fadeIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }

                @keyframes blink { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.08)} }
                .eye { animation: blink 4s infinite; }

                .step-dot { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }

                @keyframes checkPop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
                .check-anim { animation: checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fff0f3 0%,#ffe4ea 60%,#ffd6df 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' }}>

                {/* BG ring decorations */}
                <div className="spin-slow" style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', border: '2px dashed rgba(128,0,32,0.07)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
                <div className="spin-rev"  style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', border: '1.5px dashed rgba(128,0,32,0.05)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

                {/* Scattered letters — no emoji, just typographic doodles */}
                {[
                    { ch: 'A', t: '7%',  l: '3%',  rot: '-14deg', s: 32, op: 0.07 },
                    { ch: 'B', t: '13%', r: '5%',  rot:  '18deg', s: 28, op: 0.07 },
                    { ch: '+', t: '72%', l: '2%',  rot:  '-8deg', s: 36, op: 0.07 },
                    { ch: '#', t: '78%', r: '4%',  rot:  '12deg', s: 30, op: 0.07 },
                    { ch: '?', t: '42%', l: '1%',  rot:   '5deg', s: 24, op: 0.07 },
                    { ch: '!', t: '36%', r: '3%',  rot: '-10deg', s: 26, op: 0.07 },
                    { ch: 'F', t: '55%', r: '7%',  rot:  '20deg', s: 28, op: 0.07 },
                ].map((d, i) => (
                    <span key={i} style={{ position: 'absolute', top: d.t, left: d.l, right: d.r, fontSize: d.s, opacity: d.op, transform: `rotate(${d.rot})`, pointerEvents: 'none', userSelect: 'none', fontFamily: "'Abril Fatface', serif", color: '#800020', fontWeight: 900 }}>{d.ch}</span>
                ))}

                <div className="reg-card" style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 28, boxShadow: '0 24px 80px rgba(128,0,32,0.18), 0 0 0 1.5px rgba(128,0,32,0.08)', overflow: 'hidden' }}>

                    {/* Candy stripe */}
                    <div style={{ height: 6, background: 'linear-gradient(90deg,#800020,#c0002a,#ff6b8a,#800020)', backgroundSize: '200% 100%', animation: 'gradMove 3s linear infinite' }} />

                    {/* Header */}
                    <div style={{ background: 'linear-gradient(160deg,#800020 0%,#5a0016 100%)', padding: '24px 30px 22px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)', backgroundSize: '18px 18px', pointerEvents: 'none' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}>
                            {/* Robot mascot */}
                            <div className="float" style={{ flexShrink: 0 }}>
                                <div style={{ width: 66, height: 66, background: 'rgba(255,255,255,0.15)', borderRadius: 16, border: '2.5px solid rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, backdropFilter: 'blur(4px)', position: 'relative' }}>
                                    {/* Antenna */}
                                    <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: step === 2 ? '#ffcc00' : 'rgba(255,255,255,0.35)', boxShadow: step === 2 ? '0 0 10px #ffcc00' : 'none', transition: 'all 0.4s' }} />
                                        <div style={{ width: 2, height: 12, background: 'rgba(255,255,255,0.3)' }} />
                                    </div>
                                    {/* Eyes */}
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        {[0,1].map(i => (
                                            <div key={i} className="eye" style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#800020', transition: 'transform 0.3s', transform: step === 2 ? 'scale(1.3)' : 'scale(1)' }} />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Mouth */}
                                    {step === 2
                                        ? <div style={{ width: 26, height: 13, border: '2px solid rgba(255,255,255,0.7)', borderTop: 'none', borderRadius: '0 0 14px 14px' }} />
                                        : <div style={{ width: 24, height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                                            {[0,1,2].map(i => <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />)}
                                          </div>
                                    }
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: "'Abril Fatface', serif", lineHeight: 1 }}>awfulnotes</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.16em', marginTop: 2, textTransform: 'uppercase' }}>lazy collegers society</div>

                                {/* Progress steps */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                                    {STEPS.map((s, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div className="step-dot" style={{ width: i === step ? 20 : 16, height: 16, borderRadius: 8, background: i <= step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: i <= step ? '#800020' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s' }}>
                                                {i < step ? '✓' : String(i + 1)}
                                            </div>
                                            {i < 2 && <div style={{ width: 14, height: 1.5, borderRadius: 1, background: i < step ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', transition: 'background 0.3s' }} />}
                                        </div>
                                    ))}
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginLeft: 6 }}>{STEPS[step].label}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div style={{ padding: '24px 28px 28px' }}>
                        <form onSubmit={submit}>

                            {/* Name */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: '#800020', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Full Name</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="Your name here" autoComplete="name" style={inp(focused === 'name')} />
                                {errors.name && <div className="err">{errors.name}</div>}
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: '#800020', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Email Address</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="you@campus.edu" autoComplete="username" style={inp(focused === 'email')} />
                                {errors.email && <div className="err">{errors.email}</div>}
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: '#800020', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPass ? 'text' : 'password'} value={data.password} onChange={e => setData('password', e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} placeholder="Make it hard to guess" autoComplete="new-password" style={{ ...inp(focused === 'password'), paddingRight: 44 }} />
                                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 800, color: '#c48a96', padding: 2, letterSpacing: '0.02em' }}>{showPass ? 'HIDE' : 'SHOW'}</button>
                                </div>
                                <StrengthBar password={data.password} />
                                {errors.password && <div className="err">{errors.password}</div>}
                            </div>

                            {/* Confirm Password */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: '#800020', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showConfirm ? 'text' : 'password'} value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)} placeholder="Type it again" autoComplete="new-password"
                                        style={{ ...inp(focused === 'confirm', { borderColor: passwordMatch ? '#10b981' : passwordMismatch ? '#ef4444' : focused === 'confirm' ? '#800020' : '#e8d0d6', boxShadow: passwordMatch ? '0 0 0 3px rgba(16,185,129,0.15)' : focused === 'confirm' ? '0 0 0 3px rgba(128,0,32,0.12)' : 'none' }), paddingRight: 44 }} />
                                    <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 800, color: '#c48a96', padding: 2, letterSpacing: '0.02em' }}>{showConfirm ? 'HIDE' : 'SHOW'}</button>
                                </div>
                                {passwordMatch    && <div className="ok check-anim">Passwords match.</div>}
                                {passwordMismatch && <div className="err">Passwords do not match.</div>}
                                {errors.password_confirmation && <div className="err">{errors.password_confirmation}</div>}
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={processing} className="submit-btn" style={{ width: '100%', padding: 13, borderRadius: 12, background: processing ? '#c48a96' : 'linear-gradient(135deg,#800020,#a0002a)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: processing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 18px rgba(128,0,32,0.35)', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.01em' }}>
                                {processing ? (
                                    <><span style={{ width: 15, height: 15, border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin-btn 0.7s linear infinite' }} /> Creating account...</>
                                ) : 'Create Account'}
                            </button>
                        </form>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                            <div style={{ flex: 1, height: 1, background: '#f0dde2' }} />
                            <span style={{ fontSize: 11, color: '#c48a96', fontWeight: 700 }}>already have an account?</span>
                            <div style={{ flex: 1, height: 1, background: '#f0dde2' }} />
                        </div>

                        <Link href={route('login')} className="login-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: 12, borderRadius: 12, border: '2px solid #800020', color: '#800020', fontSize: 13, fontWeight: 800, textDecoration: 'none', background: '#fff', fontFamily: "'Nunito', sans-serif" }}>
                            Sign In
                        </Link>

                        <p style={{ textAlign: 'center', fontSize: 11, color: '#c48a96', marginTop: 18, lineHeight: 1.6 }}>
                            By signing up, you agree to occasionally<br />
                            <span style={{ fontWeight: 800, color: '#a0002a' }}>do your assignments before the deadline.</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}