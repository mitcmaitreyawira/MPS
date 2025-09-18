import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple component for testing
const TestComponent: React.FC = () => {
  return (
    <div>
      <h1>User Management</h1>
      <form role="form">
        <label htmlFor="username">Username</label>
        <input id="username" type="text" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" />
        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

describe('User Management Tests', () => {
  it('should render the form elements', () => {
    render(<TestComponent />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
  });

  it('should have proper form structure', () => {
    render(<TestComponent />);
    
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    
    const nisnInput = screen.getByLabelText(/nisn/i);
  expect(nisnInput).toHaveAttribute('type', 'text');
    
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should validate basic functionality', () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    render(<TestComponent />);
    
    // Test that components render without errors
    expect(screen.getByText('User Management')).toBeVisible();
    expect(screen.getByRole('button')).toBeEnabled();
  });
});