import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './login-page';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  login: vi.fn(),
}));

describe('LoginPage Component', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders login form with heading and inputs', () => {
    render(<LoginPage onLogin={mockOnLogin} />);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Dashboard/i })).toBeInTheDocument();
  });

  it('calls login API and triggers onLogin on successful authentication', async () => {
    const mockUser = { username: 'rahul', displayName: 'Rahul K.', role: 'NOC Engineer' };
    vi.mocked(api.login).mockResolvedValueOnce({
      token: 'demo-token-123',
      user: mockUser,
    });

    render(<LoginPage onLogin={mockOnLogin} />);

    const button = screen.getByRole('button', { name: /Enter Dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('rahul', 'outageiq-demo');
      expect(sessionStorage.getItem('outageiq_token')).toBe('demo-token-123');
      expect(sessionStorage.getItem('outageiq_user')).toBe(JSON.stringify(mockUser));
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  it('displays error message when login fails', async () => {
    vi.mocked(api.login).mockRejectedValueOnce(new Error('Invalid demo credentials'));

    render(<LoginPage onLogin={mockOnLogin} />);

    const button = screen.getByRole('button', { name: /Enter Dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Invalid demo credentials')).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });
});
