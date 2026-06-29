import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AddJob from '../AddJob';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ role: 'USER' })
}));

describe('AddJob Form Validation', () => {
  it('renders the form correctly', () => {
    render(
      <BrowserRouter>
        <AddJob />
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields on submit', async () => {
    render(
      <BrowserRouter>
        <AddJob />
      </BrowserRouter>
    );
    
    const submitButton = screen.getByRole('button', { name: /Save Job Posting/i });
    fireEvent.click(submitButton);

    // Zod validation should trigger errors
    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Company name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Location is required/i)).toBeInTheDocument();
    });
  });
});
