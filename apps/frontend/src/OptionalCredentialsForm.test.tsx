import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OptionalCredentialsForm from './components/OptionalCredentialsForm';

describe('OptionalCredentialsForm', () => {
  it('should render all form fields as optional', () => {
    render(<OptionalCredentialsForm />);
    
    // Check that all fields are present and labeled as optional
    expect(screen.getByLabelText(/username \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name \(optional\)/i)).toBeInTheDocument();
  });

  it('should allow form submission with empty fields', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    render(<OptionalCredentialsForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /submit form/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: '',
        password: '',
        firstName: '',
        lastName: ''
      });
    });
  });

  it('should allow form submission with partial data', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    render(<OptionalCredentialsForm onSubmit={mockOnSubmit} />);
    
    // Fill only some fields
    const usernameInput = screen.getByLabelText(/username \(optional\)/i);
    const nisnInput = screen.getByLabelText(/nisn \(optional\)/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(nisnInput, { target: { value: '1234567890' } });
    
    const submitButton = screen.getByRole('button', { name: /submit form/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        password: '',
        firstName: '',
        lastName: ''
      });
    });
  });

  it('should accept any password without validation', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    render(<OptionalCredentialsForm onSubmit={mockOnSubmit} />);
    
    const passwordInput = screen.getByLabelText(/password \(optional\)/i);
    
    // Test weak passwords that would normally be rejected
    const weakPasswords = ['1', 'a', '123', 'password', 'abc'];
    
    for (const password of weakPasswords) {
      fireEvent.change(passwordInput, { target: { value: password } });
      
      const submitButton = screen.getByRole('button', { name: /submit form/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          password: password
        }));
      });
      
      // Reset for next iteration
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);
    }
  });

  it('should accept any NISN format without validation', async () => {
    const mockOnSubmit = jest.fn();
    render(<OptionalCredentialsForm onSubmit={mockOnSubmit} />);
    
    const nisnInput = screen.getByLabelText(/nisn \(optional\)/i);

    // Test with any NISN format
    fireEvent.change(nisnInput, { target: { value: '1234567890' } });
    
    const submitButton = screen.getByRole('button', { name: /submit form/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        username: 'testuser'
      }));
    });
  });

  it('should reset all fields when reset button is clicked', () => {
    render(<OptionalCredentialsForm />);
    
    // Fill all fields
    const usernameInput = screen.getByLabelText(/username \(optional\)/i);
    const passwordInput = screen.getByLabelText(/password \(optional\)/i);
    const nisnInput = screen.getByLabelText(/nisn \(optional\)/i);
    const firstNameInput = screen.getByLabelText(/first name \(optional\)/i);
    const lastNameInput = screen.getByLabelText(/last name \(optional\)/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.change(nisnInput, { target: { value: '1234567890' } });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    
    // Verify fields are filled
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpass');
    expect(nisnInput).toHaveValue('1234567890');
    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
    
    // Click reset
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    
    // Verify all fields are cleared
    expect(usernameInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
    expect(nisnInput).toHaveValue('');
    expect(firstNameInput).toHaveValue('');
    expect(lastNameInput).toHaveValue('');
  });

  it('should display form data preview in real-time', () => {
    render(<OptionalCredentialsForm />);
    
    const usernameInput = screen.getByLabelText(/username \(optional\)/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    // Check that the preview updates - look for the pre element containing the JSON
    const previewElement = screen.getByText(/"username": "testuser"/);
    expect(previewElement).toBeInTheDocument();
  });

  it('should show success message after successful submission', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    render(<OptionalCredentialsForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /submit form/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/form submitted successfully/i)).toBeInTheDocument();
    });
  });

  it('should show error message when submission fails', async () => {
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));
    render(<OptionalCredentialsForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /submit form/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button during submission', async () => {
    const mockOnSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<OptionalCredentialsForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /submit form/i });
    fireEvent.click(submitButton);
    
    // Button should be disabled and show loading text
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/submitting/i);
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent(/submit form/i);
    });
  });
});