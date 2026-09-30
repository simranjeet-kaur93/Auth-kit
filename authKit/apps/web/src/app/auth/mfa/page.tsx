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

export default function MfaPage() {
  const router = useRouter();
  const [challengeId, setChallengeId] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return mfaStorage.getChallengeId() ?? '';
  });
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [tone, setTone] = useState<'neutral' | 'success' | 'error'>('neutral');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const tokens = await authApi.verifyMfa(challengeId, code);
      tokenStorage.saveTokens(tokens);
      mfaStorage.clearChallengeId();
      setTone('success');
      setStatus('MFA verified. Redirecting...');
      router.push('/dashboard');
    } catch (error) {
      setTone('error');
      setStatus(`MFA failed: ${(error as Error).message}`);
    }
  };

  return (
    <AuthCard
      title="Multi-factor verification"
      subtitle="Enter challenge ID and code received via email or SMS."
    >
      <form onSubmit={onSubmit} className="form">
        <AuthInput
          id="mfa-challenge"
          label="Challenge ID"
          value={challengeId}
          required
          onChange={setChallengeId}
        />
        <AuthInput
          id="mfa-code"
          label="Verification Code"
          value={code}
          required
          onChange={setCode}
        />
        <button type="submit" className="btn">
          Verify MFA
        </button>
      </form>
      {status ? <StatusBanner message={status} tone={tone} /> : null}
      <p className="auth-footer">
        Back to <Link href="/auth/login">Login</Link>
      </p>
    </AuthCard>
  );
}
