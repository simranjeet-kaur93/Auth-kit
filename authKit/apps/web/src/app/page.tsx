import Link from 'next/link';

export default function Home() {
  return (
    <section className="landing">
      <h1>Universal Auth Starter</h1>
      <p>
        Production-ready authentication starter with JWT rotation, MFA, Google
        OAuth, Redis sessions, and email verification.
      </p>

      <div className="cta-row">
        <Link href="/auth/login" className="btn">
          Login
        </Link>
        <Link href="/auth/register" className="btn btn-secondary">
          Create Account
        </Link>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <h2>Auth Flows</h2>
          <ul>
            <li>Email/password login and registration</li>
            <li>Refresh token rotation</li>
            <li>Email + SMS MFA challenge</li>
            <li>Google OAuth support</li>
          </ul>
        </article>
        <article className="feature-card">
          <h2>Developer Experience</h2>
          <ul>
            <li>NestJS API + Next.js frontend</li>
            <li>PostgreSQL + Redis with Docker</li>
            <li>TypeORM migrations + seed scripts</li>
            <li>Feature-based frontend structure</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
