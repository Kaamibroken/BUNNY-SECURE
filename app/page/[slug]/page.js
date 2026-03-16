'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function ResultDisplay({ data, displayType }) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  if (displayType === 'text' || typeof data === 'string') {
    return <div className="result-text">{text}</div>;
  }
  if (displayType === 'list') {
    const items = Array.isArray(data) ? data : text.split('\n').filter(Boolean);
    return <ul className="result-list">{items.map((it,i) => <li key={i}>{typeof it === 'string' ? it : JSON.stringify(it)}</li>)}</ul>;
  }
  if (displayType === 'table' && Array.isArray(data) && data.length) {
    const keys = Object.keys(data[0]);
    return (
      <div style={{overflowX:'auto'}}>
        <table className="result-table">
          <thead><tr>{keys.map(k=><th key={k}>{k}</th>)}</tr></thead>
          <tbody>{data.map((row,i)=><tr key={i}>{keys.map(k=><td key={k}>{String(row[k]??'')}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
  if (displayType === 'cards' && Array.isArray(data)) {
    return <div className="result-cards">{data.slice(0,12).map((it,i)=><div key={i} className="result-card">{typeof it==='string'?it:JSON.stringify(it,null,2)}</div>)}</div>;
  }
  if (displayType === 'raw') {
    return <div className="result-raw">{text}</div>;
  }
  // Auto
  if (typeof data === 'string') return <div className="result-text">{data}</div>;
  if (Array.isArray(data)) return <div className="result-cards">{data.slice(0,12).map((it,i)=><div key={i} className="result-card">{typeof it==='string'?it:JSON.stringify(it,null,2)}</div>)}</div>;
  return <div className="result-raw">{text}</div>;
}

function ApiSection({ api, pageId }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function call() {
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await fetch(`/api/pages/${pageId}/apis/${api.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResult(d.result);
    } catch(e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <div className="api-section">
      <div className="api-header">
        <span className="api-name">⚡ {api.api_name}</span>
        <span className="api-badge">{api.method} • {api.display_type?.toUpperCase()}</span>
      </div>
      <div className="api-body">
        <div className="api-row">
          <input
            className="api-input"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Enter your query / prompt..."
            onKeyDown={e => e.key === 'Enter' && call()}
          />
          <button className="btn-grad" onClick={call} disabled={loading}>
            {loading ? '⏳ Calling...' : 'CALL API →'}
          </button>
        </div>
        {error && <div className="alert-err">❌ {error}</div>}
        {loading && <div className="result-loading"><div className="spinner" />Calling API...</div>}
        {result !== null && !loading && <ResultDisplay data={result} displayType={api.display_type} />}
        {!result && !loading && !error && (
          <div style={{color:'#2a2a2a',fontSize:11,textAlign:'center',padding:20}}>
            Enter a prompt and click CALL API
          </div>
        )}
      </div>
    </div>
  );
}

export default function DynPage({ params }) {
  const [page, setPage] = useState(null);
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/pages/${params.slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setPage(d.page); setApis(d.apis || []); setLoading(false); })
      .catch(() => router.push('/open'));
  }, [params.slug]);

  if (loading) return (
    <>
      <div className="scanline" /><Navbar />
      <div className="loading-state" style={{padding:80}}><div className="spinner" /><p>Loading...</p></div>
    </>
  );

  return (
    <>
      <div className="scanline" />
      <Navbar />
      <div className="dyn-page">
        <div className="dyn-hero">
          <div className="dyn-hero-glow" />
          <div className="dyn-hero-inner">
            <div style={{marginBottom:20}}>
              <button className="btn-outline" style={{padding:'7px 18px',fontSize:11}} onClick={() => router.push('/open')}>
                ← BACK
              </button>
            </div>
            <span className="dyn-emoji">{page.emoji || '📦'}</span>
            <h1 className="dyn-title">{page.title}</h1>
            {page.description && <p className="dyn-desc">{page.description}</p>}
          </div>
        </div>

        <div className="dyn-apis">
          {apis.length === 0 ? (
            <div className="loading-state" style={{color:'rgba(255,255,255,.2)'}}>
              Is page mein koi API nahi hai.
            </div>
          ) : apis.map((api, i) => (
            <div key={api.id} style={{animationDelay:`${i*0.1}s`}} className="anim-up">
              <ApiSection api={api} pageId={page.id} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
