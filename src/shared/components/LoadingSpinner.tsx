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
        <span
          className="spinner"
          role="progressbar"
          aria-label={message || 'Loading'}
          style={{ width: diameter, height: diameter }}
        />
        {message ? <p>{message}</p> : null}
      </div>
    </div>
  );
}
