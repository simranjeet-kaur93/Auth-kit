'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthInput } from '@/components/auth/auth-input';
import { StatusBanner } from '@/components/auth/status-banner';
import { authApi } from '@/features/auth/api';

export default function VerifyEmailPage() {
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token') ?? '';
  });
  const [status, setStatus] = useState('');
  const [tone, setTone] = useState<'neutral' | 'success' | 'error'>('neutral');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await authApi.verifyEmail(token);
      setTone('success');
      setStatus('Email verified successfully. You can now log in.');
    } catch (error) {
      setTone('error');
      setStatus(`Verification failed: ${(error as Error).message}`);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Paste verification token received in email, or open verification link directly."
    >
      <form onSubmit={onSubmit} className="form">
        <AuthInput
          id="verify-token"
          label="Verification Token"
          value={token}
          required
          onChange={setToken}
        />
        <button type="submit" className="btn">
          Verify Email
        </button>
      </form>

      {status ? <StatusBanner message={status} tone={tone} /> : null}

      <p className="auth-footer">
        Back to <Link href="/auth/login">Login</Link>
      </p>
    </AuthCard>
  );
}
