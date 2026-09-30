'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { authApi } from '@/features/auth/api';
import { tokenStorage } from '@/features/auth/storage';
import { UserProfile } from '@/features/auth/types';
import { StatusBanner } from '@/components/auth/status-banner';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState('Click "Reload Profile" to fetch user data.');
  const [tone, setTone] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [mfaMethod, setMfaMethod] = useState<'email' | 'sms' | 'none'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');

  const loadProfile = async () => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      setTone('error');
      setStatus('No access token found. Please login first.');
      setProfile(null);
      return;
    }
    try {
      const currentProfile = await authApi.me(accessToken);
      setProfile(currentProfile);
      setTone('success');
      setStatus('Profile loaded.');
    } catch (error) {
      setTone('error');
      setStatus(`Failed to load profile: ${(error as Error).message}`);
      setProfile(null);
    }
  };

  const onRefresh = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      setTone('error');
      setStatus('No refresh token found.');
      return;
    }
    try {
      const tokens = await authApi.refresh(refreshToken);
      tokenStorage.saveTokens(tokens);
      await loadProfile();
      setTone('success');
      setStatus('Session refreshed.');
    } catch (error) {
      setTone('error');
      setStatus(`Refresh failed: ${(error as Error).message}`);
    }
  };

  const onLogout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
      tokenStorage.clearTokens();
      setProfile(null);
      setTone('success');
      setStatus('Logged out.');
    } catch (error) {
      setTone('error');
      setStatus(`Logout failed: ${(error as Error).message}`);
    }
  };

  const onUpdateMfa = async (event: FormEvent) => {
    event.preventDefault();
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      setTone('error');
      setStatus('Please login before updating MFA settings.');
      return;
    }
    try {
      await authApi.updateMfa(accessToken, mfaMethod, phoneNumber || undefined);
      await loadProfile();
      setTone('success');
      setStatus('MFA settings updated.');
    } catch (error) {
      setTone('error');
      setStatus(`MFA update failed: ${(error as Error).message}`);
    }
  };

  return (
    <section className="dashboard-grid">
      <article className="feature-card">
        <h1>Dashboard</h1>
        <p className="auth-card-subtitle">Manage your session and MFA preferences.</p>
        <StatusBanner message={status} tone={tone} />
        <div className="cta-row">
          <button className="btn" onClick={() => void loadProfile()}>
            Reload Profile
          </button>
          <button className="btn btn-secondary" onClick={onRefresh}>
            Refresh Session
          </button>
          <button className="btn btn-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
        {!profile ? (
          <p className="auth-footer">
            Need to authenticate? <Link href="/auth/login">Go to login</Link>
          </p>
        ) : (
          <pre className="json-block">{JSON.stringify(profile, null, 2)}</pre>
        )}
      </article>

      <article className="feature-card">
        <h2>MFA Settings</h2>
        <form onSubmit={onUpdateMfa} className="form">
          <label className="field">
            <span>MFA Method</span>
            <select
              value={mfaMethod}
              onChange={(event) =>
                setMfaMethod(event.target.value as 'email' | 'sms' | 'none')
              }
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="none">Disable MFA</option>
            </select>
          </label>
          <label className="field">
            <span>Phone Number (for SMS)</span>
            <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+1..."
            />
          </label>
          <button type="submit" className="btn">
            Save MFA Settings
          </button>
        </form>
      </article>
    </section>
  );
}
