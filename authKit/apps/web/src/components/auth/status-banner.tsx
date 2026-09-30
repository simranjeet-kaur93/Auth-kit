type StatusBannerProps = {
  message: string;
  tone?: 'neutral' | 'success' | 'error';
};

export function StatusBanner({ message, tone = 'neutral' }: StatusBannerProps) {
  return <p className={`status-banner status-${tone}`}>{message}</p>;
}
