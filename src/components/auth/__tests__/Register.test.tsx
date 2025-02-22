import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Register } from '../Register';
import { useAuth } from '../hooks/useAuth';
import '@testing-library/jest-dom';

// Mock useAuth hook
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('Register', () => {
  const mockRegister = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnLoginClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      authError: null,
    });
  });

  const renderRegisterForm = () => {
    render(
      <Register
        open={true}
        onClose={mockOnClose}
        onLoginClick={mockOnLoginClick}
      />
    );

    return {
      emailInput: screen.getByRole('textbox', { name: /email/i }),
      passwordInput: screen.getByTestId('password-input'),
      confirmPasswordInput: screen.getByTestId('confirm-password-input'),
      submitButton: screen.getByRole('button', { name: /create account/i }),
    };
  };

  it('renders registration form correctly', () => {
    const { emailInput, passwordInput, confirmPasswordInput, submitButton } = renderRegisterForm();

    expect(screen.getByRole('heading', { name: 'Create Account', level: 5 })).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('validates matching passwords', async () => {
    const { emailInput, passwordInput, confirmPasswordInput, submitButton } = renderRegisterForm();

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password456');
    await userEvent.click(submitButton);

    expect(await screen.findByText("Passwords don't match")).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const { emailInput, passwordInput, confirmPasswordInput, submitButton } = renderRegisterForm();

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('handles successful registration', async () => {
    const { emailInput, passwordInput, confirmPasswordInput, submitButton } = renderRegisterForm();

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    expect(mockRegister).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'password123'
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles registration error for existing user', async () => {
    const errorMessage = 'This email is already registered. Please try logging in instead.';
    mockRegister.mockRejectedValueOnce(new Error(errorMessage));

    const { emailInput, passwordInput, confirmPasswordInput, submitButton } = renderRegisterForm();

    await userEvent.type(emailInput, 'existing@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login instead/i })).toBeInTheDocument();
  });

  it('switches to login when "Login Instead" is clicked', async () => {
    const errorMessage = 'This email is already registered. Please try logging in instead.';
    mockRegister.mockRejectedValueOnce(new Error(errorMessage));

    const { emailInput, passwordInput, confirmPasswordInput, submitButton } = renderRegisterForm();

    await userEvent.type(emailInput, 'existing@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    const loginButton = await screen.findByRole('button', { name: /login instead/i });
    await userEvent.click(loginButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnLoginClick).toHaveBeenCalled();
  });

  it('disables form submission while submitting', async () => {
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { emailInput, passwordInput, confirmPasswordInput, submitButton } = renderRegisterForm();

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
}); 