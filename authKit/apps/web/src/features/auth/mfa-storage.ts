const MFA_CHALLENGE_ID_KEY = 'authkit_mfa_challenge_id';

export const mfaStorage = {
  setChallengeId: (challengeId: string) =>
    sessionStorage.setItem(MFA_CHALLENGE_ID_KEY, challengeId),
  getChallengeId: () => sessionStorage.getItem(MFA_CHALLENGE_ID_KEY),
  clearChallengeId: () => sessionStorage.removeItem(MFA_CHALLENGE_ID_KEY),
};
