import { describe, it, expect } from 'vitest';
import { render } from '@/test/test-utils';
import { screen } from '@testing-library/dom';
import { DashboardHeader } from '../DashboardHeader';

describe('DashboardHeader', () => {
  it('renders title correctly', () => {
    render(
      <DashboardHeader
        title="Test Dashboard"
        description="Test description"
      />
    );

    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(
      <DashboardHeader title="Just Title" />
    );

    expect(screen.getByText('Just Title')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <DashboardHeader title="With Actions">
        <button>Action Button</button>
      </DashboardHeader>
    );

    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });
});
