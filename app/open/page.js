'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function OpenPage() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [tipsLoading, setTipsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/pages').then(r => r.json()).then(d => {
      setBlocks(d.pages || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function loadTips() {
    if (showTips) { setShowTips(false); return; }
    setShowTips(true);
    if (tips) return;
    setTipsLoading(true);
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 350,
          messages: [{ role: 'user', content: 'Give 5 powerful life hacks & tips. Max 15 words each. Number 1-5. Motivational and sharp.' }]
        })
      });
      const d = await r.json();
      setTips(d.content?.[0]?.text || defaultTips());
    } catch { setTips(defaultTips()); }
    setTipsLoading(false);
  }

  function defaultTips() {
    return '1. Stay focused — distractions kill success.\n2. Work hard when no one is watching.\n3. Every day is a new chance to be better.\n4. Set goals, make plans, take action now.\n5. Broken glass is still sharp — so are you.';
  }

  return (
    <>
      <div className="scanline" />
      <Navbar />

      <div className="top-actions">
        <button className="btn-grad" onClick={() => router.back()}>← GO BACK</button>
        <button className="btn-grad" onClick={() => router.push('/')}>🏠 HOME</button>
        <button className="btn-grad" onClick={loadTips}>⚡ TIPS & HACKS</button>
        <button className="btn-grad" onClick={() => alert('Premium coming soon! 🔥')}>💎 PREMIUM APP</button>
      </div>

      <div className="open-heading">
        𝗧𝗢𝗢𝗧𝗔 𝗛𝗨𝗔 <span style={{color:'red'}}>𝗞𝗔𝗡𝗖𝗛</span> 𝗞𝗔𝗠𝗭𝗢𝗥 𝗡𝗛𝗜 <span style={{color:'red'}}>𝗝𝗔𝗔𝗡𝗟𝗘𝗩𝗔</span> 𝗛𝗢𝗧𝗔 𝗛𝗔𝗜
      </div>

      {showTips && (
        <div className="tips-panel">
          <div className="tips-hdr">
            ⚡ TIPS & HACKS
            <button className="tips-close" onClick={() => setShowTips(false)}>✕</button>
          </div>
          <div className="tips-body">
            {tipsLoading ? '⏳ Generating tips...' : tips}
          </div>
        </div>
      )}

      <div className="open-char">
        <div className="open-char-box">🐰</div>
        <div className="open-line" />
      </div>

      <div className="blocks-grid">
        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading...</p></div>
        ) : blocks.length === 0 ? (
          <div className="loading-state" style={{color:'rgba(255,255,255,.2)'}}>
            Koi block nahi hai. Admin se add karo.
          </div>
        ) : blocks.map((b, i) => (
          <div
            key={b.id}
            className="block-card"
            style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => router.push(`/page/${b.slug}`)}
          >
            <div className="block-img" style={{ background: `linear-gradient(135deg,${b.color||'#ff0000'},#1a0000)` }}>
              {b.emoji || '📦'}
            </div>
            <div className="block-status"><div className="block-dot" />ONLINE</div>
            <div className="block-title">{b.title}</div>
            {b.description && <div className="block-desc">{b.description}</div>}
            <div className="block-open">
              <button className="btn-grad" onClick={e => { e.stopPropagation(); router.push(`/page/${b.slug}`); }}>
                OPEN
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
