import { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '', password: '', remember: false,
    });

    const [quoteIdx, setQuoteIdx] = useState(0);
    const [quoteVisible, setQuoteVisible] = useState(true);
    const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
    const [showPass, setShowPass] = useState(false);
    const [focused, setFocused] = useState(null);
    const robotRef = useRef(null);

    useEffect(() => {
        const handle = (e) => {
            if (!robotRef.current) return;
            const rect = robotRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const angle = Math.atan2(dy, dx);
            const dist = Math.min(4, Math.hypot(dx, dy) / 30);
            setEyePos({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
        };
        window.addEventListener('mousemove', handle);
        return () => window.removeEventListener('mousemove', handle);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    const inp = (isFocused) => ({
        width: '100%', padding: '11px 14px', fontSize: 13, borderRadius: 10,
        border: `2px solid ${isFocused ? '#800020' : '#e8d0d6'}`,
        background: '#fdf5f7', color: '#1a1a1a', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: "'Nunito', sans-serif",
        boxShadow: isFocused ? '0 0 0 3px rgba(128,0,32,0.12)' : 'none',
    });

    return (
        <>
            <Head title="Login — awfulnotes" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Abril+Fatface&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .login-card { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
                @keyframes popIn { from{opacity:0;transform:scale(0.85) translateY(30px)} to{opacity:1;transform:scale(1) translateY(0)} }

                .quote-text { transition: opacity 0.4s, transform 0.4s; }
                .quote-visible { opacity:1; transform:translateY(0); }
                .quote-hidden  { opacity:0; transform:translateY(8px); }

                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                .float { animation: float 3s ease-in-out infinite; }

                @keyframes spin-btn { from{transform:rotate(0)} to{transform:rotate(360deg)} }

                @keyframes gradMove { 0%{background-position:0%} 100%{background-position:200%} }

                .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(128,0,32,0.45)!important; }
                .submit-btn:active:not(:disabled) { transform:translateY(0); }
                .submit-btn { transition: transform 0.15s, box-shadow 0.15s; }

                .register-link:hover { background:#fff0f3!important; }
                .register-link { transition: background 0.15s; }

                .err { color:#c0002a; font-size:11px; margin-top:5px; font-weight:700; display:flex; align-items:center; gap:4px; animation: fadeIn 0.25s ease; }
                @keyframes fadeIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }

                @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                .spin-slow { animation: spin-slow 14s linear infinite; }
                .spin-rev   { animation: spin-slow 10s linear infinite reverse; }

                @keyframes blink { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.08)} }
                .eye { animation: blink 4s infinite; }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fff0f3 0%,#ffe4ea 60%,#ffd6df 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito',sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' }}>

                {/* BG decorations */}
                {[{e:'📚',t:'7%',l:'3%',r:'-10deg',s:36},{e:'✏️',t:'14%',r:'5%',l:undefined,r2:'20deg',s:32},{e:'☕',t:'74%',l:'2%',r:'-8deg',s:34},{e:'🎒',t:'76%',r:'4%',l:undefined,r2:'12deg',s:36},{e:'📎',t:'42%',l:'1%',r:'5deg',s:26},{e:'💡',t:'52%',r:'6%',l:undefined,r2:'18deg',s:28},{e:'⏰',t:'58%',l:'5%',r:'-20deg',s:28}].map((d,i)=>(
                    <span key={i} style={{position:'absolute',top:d.t,left:d.l,right:d.r,fontSize:d.s,opacity:0.15,transform:`rotate(${d.r||d.r2||'0deg'})`,pointerEvents:'none',userSelect:'none'}}>{d.e}</span>
                ))}
                <div className="spin-slow" style={{position:'absolute',width:520,height:520,borderRadius:'50%',border:'2px dashed rgba(128,0,32,0.07)',top:'50%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none'}}/>
                <div className="spin-rev"  style={{position:'absolute',width:340,height:340,borderRadius:'50%',border:'1.5px dashed rgba(128,0,32,0.05)',top:'50%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none'}}/>

                <div className="login-card" style={{width:'100%',maxWidth:420,background:'#fff',borderRadius:28,boxShadow:'0 24px 80px rgba(128,0,32,0.18),0 0 0 1.5px rgba(128,0,32,0.08)',overflow:'hidden'}}>

                    {/* Top candy stripe */}
                    <div style={{height:6,background:'linear-gradient(90deg,#800020,#c0002a,#ff6b8a,#800020)',backgroundSize:'200% 100%',animation:'gradMove 3s linear infinite'}}/>

                    {/* Header */}
                    <div style={{background:'linear-gradient(160deg,#800020 0%,#5a0016 100%)',padding:'28px 32px 24px',textAlign:'center',position:'relative',overflow:'hidden'}}>
                        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)',backgroundSize:'18px 18px',pointerEvents:'none'}}/>

                        {/* Robot */}
                        <div ref={robotRef} className="float" style={{display:'inline-flex',flexDirection:'column',alignItems:'center',marginBottom:14,position:'relative',zIndex:1}}>
                            <div style={{position:'absolute',top:-20,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:0}}>
                                <div style={{width:10,height:10,borderRadius:'50%',background:'#ffcc00',boxShadow:'0 0 10px #ffcc00'}}/>
                                <div style={{width:2,height:12,background:'rgba(255,255,255,0.35)'}}/>
                            </div>
                            <div style={{width:74,height:74,background:'rgba(255,255,255,0.15)',borderRadius:18,border:'2.5px solid rgba(255,255,255,0.3)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:7,backdropFilter:'blur(4px)'}}>
                                <div style={{display:'flex',gap:12}}>
                                    {[0,1].map(i=>(
                                        <div key={i} className="eye" style={{width:16,height:16,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 0 2px rgba(255,255,255,0.25)'}}>
                                            <div style={{width:7,height:7,borderRadius:'50%',background:'#800020',transform:`translate(${eyePos.x}px,${eyePos.y}px)`,transition:'transform 0.1s'}}/>
                                        </div>
                                    ))}
                                </div>
                                <div style={{width:28,height:8,borderRadius:4,background:'rgba(255,255,255,0.2)',border:'1.5px solid rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:3}}>
                                    {[0,1,2].map(i=><div key={i} style={{width:3,height:3,borderRadius:'50%',background:'rgba(255,255,255,0.6)'}}/>)}
                                </div>
                            </div>
                        </div>

                        <div style={{fontSize:27,fontWeight:900,color:'#fff',fontFamily:"'Abril Fatface',serif",letterSpacing:'-0.5px',lineHeight:1,position:'relative',zIndex:1}}>awfulnotes</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.55)',fontWeight:700,letterSpacing:'0.18em',marginTop:4,textTransform:'uppercase',position:'relative',zIndex:1}}>lazy collegers society</div>

                    </div>

                    {/* Form */}
                    <div style={{padding:'26px 30px 30px'}}>
                        {status && <div style={{marginBottom:16,padding:'10px 14px',borderRadius:10,background:'#f0fdf4',border:'1.5px solid #86efac',fontSize:13,color:'#166534',fontWeight:600}}>✅ {status}</div>}

                        <form onSubmit={submit}>
                            <div style={{marginBottom:14}}>
                                <label style={{fontSize:11,fontWeight:800,color:'#800020',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>Email</label>
                                <input type="email" value={data.email} onChange={e=>setData('email',e.target.value)} onFocus={()=>setFocused('email')} onBlur={()=>setFocused(null)} placeholder="mahasiswa@univ.ac.id" autoComplete="username" style={inp(focused==='email')}/>
                                {errors.email && <div className="err">⚠️ {errors.email}</div>}
                            </div>

                            <div style={{marginBottom:8}}>
                                <label style={{fontSize:11,fontWeight:800,color:'#800020',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>Password</label>
                                <div style={{position:'relative'}}>
                                    <input type={showPass?'text':'password'} value={data.password} onChange={e=>setData('password',e.target.value)} onFocus={()=>setFocused('password')} onBlur={()=>setFocused(null)} placeholder="Your password" autoComplete="current-password" style={{...inp(focused==='password'),paddingRight:44}}/>
                                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 800, color: '#c48a96', padding: 2, letterSpacing: '0.02em' }}>{showPass ? 'HIDE' : 'SHOW'}</button>
                                </div>
                                {errors.password && <div className="err"> {errors.password}</div>}
                            </div>

                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                                <label style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:12,color:'#888',fontWeight:700}}>
                                    <input type="checkbox" checked={data.remember} onChange={e=>setData('remember',e.target.checked)} style={{accentColor:'#800020',width:14,height:14}}/>
                                    Remember Me
                                </label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} style={{fontSize:12,color:'#800020',fontWeight:800,textDecoration:'none'}}>forgot pass?</Link>
                                )}
                            </div>

                            <button type="submit" disabled={processing} className="submit-btn" style={{width:'100%',padding:13,borderRadius:12,background:processing?'#c48a96':'linear-gradient(135deg,#800020,#a0002a)',border:'none',color:'#fff',fontSize:14,fontWeight:800,cursor:processing?'not-allowed':'pointer',boxShadow:'0 4px 18px rgba(128,0,32,0.35)',fontFamily:"'Nunito',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                                {processing ? (
                                    <><span style={{width:15,height:15,border:'2.5px solid rgba(255,255,255,0.35)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin-btn 0.7s linear infinite'}}/>Masuk...</>
                                ) : 'Login'}
                            </button>
                        </form>

                        <div style={{display:'flex',alignItems:'center',gap:12,margin:'18px 0'}}>
                            <div style={{flex:1,height:1,background:'#f0dde2'}}/>
                            <span style={{fontSize:11,color:'#c48a96',fontWeight:700}}>Don't have an account?</span>
                            <div style={{flex:1,height:1,background:'#f0dde2'}}/>
                        </div>

                        <Link href={route('register')} className="register-link" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:12,borderRadius:12,border:'2px solid #800020',color:'#800020',fontSize:13,fontWeight:800,textDecoration:'none',background:'#fff',fontFamily:"'Nunito',sans-serif"}}>
                            Register Now
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}