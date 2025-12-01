import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../../src/pages/Landing';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

// Mock RouteIndex
vi.mock('@/helpers/RouteName', () => ({
  RouteIndex: '/',
}));

describe('Landing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );
  };

  it('renders the landing page', () => {
    renderComponent();
    expect(screen.getByText('ShabdSetu')).toBeInTheDocument();
  });

  it('displays the logo image', () => {
    renderComponent();
    const logo = screen.getByAltText('ShabdSetu logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src');
  });

  it('displays the tagline', () => {
    renderComponent();
    expect(
      screen.getByText('A simple blogging platform to share thoughts and connect.')
    ).toBeInTheDocument();
  });

  it('renders the Get Started button', () => {
    renderComponent();
    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeInTheDocument();
  });

  it('navigates to home page when Get Started is clicked', () => {
    renderComponent();
    
    const button = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('applies correct styling classes', () => {
    renderComponent();
    
    // Check background with cover
    const outerContainer = screen.getByText('ShabdSetu').closest('div').parentElement.parentElement;
    expect(outerContainer).toHaveClass('min-h-screen');
    expect(outerContainer).toHaveClass('bg-cover');
  });

  it('renders with backdrop blur effect', () => {
    renderComponent();

    const contentCard = screen.getByText('ShabdSetu').closest('div').parentElement;
    expect(contentCard).toHaveClass('backdrop-blur-2xl');
    expect(contentCard).toHaveClass('rounded-2xl');
  });
});
