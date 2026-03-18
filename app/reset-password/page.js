'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

function ResetForm() {
  const [pass, setPass] = useState('');
  const [conf, setConf] = useState('');
  const [showP, setShowP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  async function doReset() {
    setErr(''); setOk('');
    if (!pass || pass.length < 6) { setErr('Password min 6 characters ka hona chahiye.'); return; }
    if (pass !== conf) { setErr('Dono passwords match nahi kar rahe.'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/auth/reset', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pass })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOk('✅ ' + d.message);
      setTimeout(() => router.push('/raheel'), 2000);
    } catch(e) { setErr('❌ ' + e.message); }
    setLoading(false);
  }

  return (
    <>
      <div className="scanline" />
      <Navbar />
      <div className="login-page">

        <div className="login-card">
          <div className="login-icon">🔑</div>
          <h2 className="login-title">RESET PASSWORD</h2>
          <p className="login-sub">Naya password set karo</p>

          {!token && <div className="alert-err">❌ Invalid link. Dobara reset request karo.</div>}
          {err && <div className="alert-err">{err}</div>}
          {ok  && <div className="alert-ok">{ok}</div>}

          {token && !ok && (
            <>
              <label className="form-label">NEW PASSWORD</label>
              <div className="pw-wrap">
                <input className="form-input" type={showP?'text':'password'} value={pass}
                  onChange={e=>setPass(e.target.value)} placeholder="Min 6 characters..." />
                <button className="pw-eye" onClick={()=>setShowP(p=>!p)}>👁</button>
              </div>

              <label className="form-label">CONFIRM PASSWORD</label>
              <input className="form-input" type="password" value={conf}
                onChange={e=>setConf(e.target.value)} placeholder="Same password again..."
                onKeyDown={e=>e.key==='Enter'&&doReset()} />

              <button className="btn-red" style={{width:'100%',marginTop:16,padding:13,letterSpacing:1}}
                onClick={doReset} disabled={loading}>
                {loading ? '⏳ Saving...' : 'SET NEW PASSWORD'}
              </button>
            </>
          )}

          <button className="forgot-link" onClick={() => router.push('/raheel')}>← Back to login</button>
        </div>
      </div>
    </>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="loading-state"><div className="spinner"/></div>}>
      <ResetForm />
    </Suspense>
  );
}
