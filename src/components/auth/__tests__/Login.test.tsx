import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../Login';
import '@testing-library/jest-dom';

describe('Login', () => {
  const mockOnLogin = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLoginForm = () => {
    render(
      <Login
        open={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
      />
    );

    return {
      emailInput: screen.getByRole('textbox', { name: /email/i }),
      passwordInput: screen.getByTestId('password-input'),
      submitButton: screen.getByRole('button', { name: /login/i }),
    };
  };

  it('renders login form correctly', () => {
    const { emailInput, passwordInput, submitButton } = renderLoginForm();

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid credentials';
    render(
      <Login
        open={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls onLogin with form data when submitted', async () => {
    const { emailInput, passwordInput, submitButton } = renderLoginForm();

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    expect(mockOnLogin).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'password123'
    });
  });

  it('requires email and password fields', async () => {
    const { submitButton } = renderLoginForm();
    
    // Try to submit empty form
    await userEvent.click(submitButton);
    
    // Form should not submit due to HTML5 validation
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('clears form on successful login', async () => {
    const { emailInput, passwordInput, submitButton } = renderLoginForm();

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });
  });

  it('keeps form data on failed login', async () => {
    render(
      <Login
        open={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        error="Invalid credentials"
      />
    );

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('handles dialog close', () => {
    render(
      <Login
        open={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
      />
    );

    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });
}); 