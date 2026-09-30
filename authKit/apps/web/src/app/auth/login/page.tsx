'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthInput } from '@/components/auth/auth-input';
import { StatusBanner } from '@/components/auth/status-banner';
import { authApi } from '@/features/auth/api';
import { mfaStorage } from '@/features/auth/mfa-storage';
import { tokenStorage } from '@/features/auth/storage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [tone, setTone] = useState<'neutral' | 'success' | 'error'>('neutral');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await authApi.login(email, password);
      if ('mfaRequired' in response && response.mfaRequired) {
        mfaStorage.setChallengeId(response.challengeId);
        router.push('/auth/mfa');
        return;
      }

      if ('accessToken' in response && 'refreshToken' in response) {
        tokenStorage.saveTokens(response);
      }
      setTone('success');
      setStatus('Login successful. Redirecting...');
      router.push('/dashboard');
    } catch (error) {
      setTone('error');
      setStatus(`Login failed: ${(error as Error).message}`);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Login using your AuthKit account credentials.">
      <form onSubmit={onSubmit} className="form">
        <AuthInput
          id="login-email"
          label="Email"
          type="email"
          value={email}
          required
          onChange={setEmail}
        />
        <AuthInput
          id="login-password"
          label="Password"
          type="password"
          value={password}
          required
          onChange={setPassword}
        />
        <button type="submit" className="btn">
          Login
        </button>
      </form>

      <a href={`${authApi.apiUrl}/auth/google`} className="btn btn-secondary full-width">
        Continue with Google
      </a>

      {status ? <StatusBanner message={status} tone={tone} /> : null}

      <p className="auth-footer">
        Need an account? <Link href="/auth/register">Create one</Link>
      </p>
    </AuthCard>
  );
}
