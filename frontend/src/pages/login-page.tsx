import { useState } from 'react';
import { login } from '../lib/api';
import type { AppUser } from '../types';

export default function LoginPage({ onLogin }: { onLogin: (user: AppUser) => void }) {
  const [username, setUsername] = useState('rahul');
  const [password, setPassword] = useState('outageiq-demo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-badge">OutageIQ Secure Access</div>
        <h2>Login Page</h2>
        <p>Access the dashboard duplicate backed by the isolated NOCSquad API.</p>

        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>

        {error ? <div className="error-banner">{error}</div> : null}

        <button
          className="primary-button"
          onClick={async () => {
            setLoading(true);
            setError('');
            try {
              const result = await login(username, password);
              sessionStorage.setItem('outageiq_token', result.token);
              sessionStorage.setItem('outageiq_user', JSON.stringify(result.user));
              onLogin(result.user);
            } catch (loginError) {
              setError(loginError instanceof Error ? loginError.message : 'Login failed');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Enter Dashboard'}
        </button>
      </div>
    </div>
  );
}