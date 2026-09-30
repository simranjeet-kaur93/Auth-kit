'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthInput } from '@/components/auth/auth-input';
import { StatusBanner } from '@/components/auth/status-banner';
import { authApi } from '@/features/auth/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('');
  const [tone, setTone] = useState<'neutral' | 'success' | 'error'>('neutral');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await authApi.register({
        email,
        password,
        name: name || undefined,
        phoneNumber: phoneNumber || undefined,
      });
      setTone('success');
      setStatus('Registration complete. Check email for verification link/token.');
    } catch (error) {
      setTone('error');
      setStatus(`Registration failed: ${(error as Error).message}`);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start with email/password and optional phone for SMS MFA."
    >
      <form onSubmit={onSubmit} className="form">
        <AuthInput
          id="register-email"
          label="Email"
          type="email"
          value={email}
          required
          onChange={setEmail}
        />
        <AuthInput
          id="register-password"
          label="Password"
          type="password"
          value={password}
          required
          onChange={setPassword}
        />
        <AuthInput
          id="register-name"
          label="Name"
          value={name}
          onChange={setName}
        />
        <AuthInput
          id="register-phone"
          label="Phone Number"
          value={phoneNumber}
          onChange={setPhoneNumber}
        />
        <button type="submit" className="btn">
          Register
        </button>
      </form>
      {status ? <StatusBanner message={status} tone={tone} /> : null}
      <p className="auth-footer">
        Already registered? <Link href="/auth/login">Go to login</Link>
      </p>
    </AuthCard>
  );
}
