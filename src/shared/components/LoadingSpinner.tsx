import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  isLoading: boolean;
  message?: string;
  diameter?: number;
}

export function LoadingSpinner({ isLoading, message = '', diameter = 48 }: LoadingSpinnerProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="rr-spinner" style={{ width: diameter, height: diameter }} aria-label="Loading" />
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
