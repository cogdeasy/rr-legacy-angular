import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../shared/components/Icon';
import { useAuth } from '../shared/auth/useAuth';
import './login.scss';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setErrorMessage('Enter your Rolls-Royce email and password');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    login().then(
      () => {
        setIsLoading(false);
        navigate('/dashboard');
      },
      () => {
        setIsLoading(false);
        setErrorMessage('Sign-in failed, please try again');
      }
    );
  };

  return (
    <div className="login-page">
      <section className="login-hero hero-gradient">
        <span className="hero-mark">RR</span>
        <h1>Engine Operations Portal</h1>
        <p>
          Fleet health signals, prognostics and MRO execution for every managed engine, in one
          controlled workspace.
        </p>
        <ul className="hero-points">
          <li>
            <Icon name="insights" /> Continuous EHM downlink from 8 managed engines
          </li>
          <li>
            <Icon name="engineering" /> Workscope planning with shop capacity awareness
          </li>
          <li>
            <Icon name="verified" /> Airworthiness evidence retained against every decision
          </li>
        </ul>
      </section>

      <section className="login-form-panel">
        <div className="form-card">
          <span className="micro-label">Secure sign-in</span>
          <h2>Sign in</h2>
          <p className="form-intro">Use your Rolls-Royce network account.</p>

          <form onSubmit={onSubmit} noValidate>
            <label className="field-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="text-input"
              placeholder="first.last@rolls-royce.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="username"
            />

            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="text-input"
              placeholder="Enter your password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
            />

            {errorMessage && (
              <p className="error-message">
                <Icon name="error_outline" />
                {errorMessage}
              </p>
            )}

            <button className="rr-button primary pill-cta submit-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="assist">Locked out? Contact the operations service desk on extension 4400.</p>
        </div>
      </section>
    </div>
  );
}
