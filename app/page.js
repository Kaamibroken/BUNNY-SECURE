import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <div className="scanline" />
      <Navbar />
      <div className="home-wrap">
        <div className="home-glow" />
        <div className="home-bg-text">BUNNY</div>
        <div className="home-jp">バニー</div>
        <div className="home-content">
          <div className="home-left">
            <div className="char-box">
              <div className="char-emoji">🐰</div>
              <div className="char-lbl">CHARACTER</div>
            </div>
          </div>
          <div className="home-right">
            <h1 className="home-h1">BUNNY</h1>
            <p className="home-quote">
              "I'll show you what <span style={{color:'#ff0000'}}>real power</span> is"
            </p>
            <div className="home-btns">
              <Link href="/open" className="btn-red">OPEN →</Link>
              <button className="btn-outline">EXPLORE</button>
            </div>
          </div>
        </div>
        <div className="bottom-dots">
          <span className="dot on" /><span className="dot" /><span className="dot" />
        </div>
      </div>
    </>
  );
}
