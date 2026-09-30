import { ReactNode } from 'react';

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="auth-card">
      <h1>{title}</h1>
      {subtitle ? <p className="auth-card-subtitle">{subtitle}</p> : null}
      {children}
    </section>
  );
}
