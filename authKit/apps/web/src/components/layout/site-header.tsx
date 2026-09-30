import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          AuthKit
        </Link>
        <nav className="site-nav">
          <Link href="/auth/login">Login</Link>
          <Link href="/auth/register">Register</Link>
          <Link href="/auth/verify-email">Verify Email</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}
