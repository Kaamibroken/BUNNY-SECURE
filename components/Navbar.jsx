'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ isAdmin = false, onLogout }) {
  const path = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className="logo">BUNNY</Link>
      <div className="nav-links">
        <Link href="/" className={`nav-btn ${path === '/' ? 'active' : ''}`}>HOME</Link>
        <Link href="/open" className={`nav-btn ${path === '/open' ? 'active' : ''}`}>OPEN</Link>
        {isAdmin ? (
          <>
            <span className="adm-badge">⚙ ADMIN</span>
            <Link href="/open" className="nav-btn" target="_blank">VIEW SITE ↗</Link>
            <button className="nav-btn nav-danger" onClick={onLogout}>LOGOUT</button>
          </>
        ) : (
          <Link href="/raheel" className="nav-btn nav-admin">⚙ ADMIN</Link>
        )}
      </div>
    </nav>
  );
}
