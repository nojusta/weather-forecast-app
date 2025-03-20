import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

describe('Layout Component', () => {
  it('renders header with app title', () => {
    render(<Layout>Test Content</Layout>);
    
    expect(screen.getByText('Weather Forecast')).toBeInTheDocument();
  });
  
  it('renders child content correctly', () => {
    render(<Layout><div data-testid="custom-child">Custom Content</div></Layout>);
    
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });
  
  it('renders footer with attribution information', () => {
    render(<Layout>Test Content</Layout>);
    
    const footer = screen.getByText(/LHMT/);
    expect(footer).toBeInTheDocument();
    expect(footer.closest('footer')).toBeInTheDocument();
  });
  
  it('has appropriate semantic structure', () => {
    const { container } = render(<Layout>Test Content</Layout>);
    
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

    it('renders subtitle text', () => {
    render(<Layout>Test Content</Layout>);
    expect(screen.getByText('Check current conditions and forecasts')).toBeInTheDocument();
  });
});