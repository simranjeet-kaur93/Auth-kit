export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type MfaMethod = 'sms' | 'email';

export type LoginResponse =
  | TokenPair
  | {
      mfaRequired: boolean;
      challengeId: string;
      method: MfaMethod;
    };

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
  mfaMethod: MfaMethod | null;
  phoneNumber: string | null;
  createdAt: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  phoneNumber?: string;
};
