import { describe, it, expect } from 'vitest';
import { render } from '@/test/test-utils';
import { screen } from '@testing-library/dom';
import { StatsCard } from '../StatsCard';
import { TrendingUp } from 'lucide-react';

describe('StatsCard', () => {
  it('renders title and value correctly', () => {
    render(
      <StatsCard
        title="Total Events"
        value="1,234"
        icon={<TrendingUp className="h-5 w-5" />}
      />
    );

    expect(screen.getByText('Total Events')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('displays change when provided', () => {
    render(
      <StatsCard
        title="Friction Score"
        value="85"
        icon={<TrendingUp className="h-5 w-5" />}
        change={12.5}
      />
    );

    expect(screen.getByText(/12.5%/)).toBeInTheDocument();
  });

  it('displays negative change correctly', () => {
    render(
      <StatsCard
        title="Error Rate"
        value="2.3%"
        icon={<TrendingUp className="h-5 w-5" />}
        change={-5.2}
      />
    );

    expect(screen.getByText(/5.2%/)).toBeInTheDocument();
  });

  it('does not display change when not provided', () => {
    render(
      <StatsCard
        title="Sessions"
        value="456"
        icon={<TrendingUp className="h-5 w-5" />}
      />
    );

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
