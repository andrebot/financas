import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import FlagIcon from '../../../../src/client/components/cardFlag';
import type { Flag } from '../../../../src/client/types';

jest.mock('../../../../src/client/assets/amazonCC.svg', () => ({
  ReactComponent: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} data-testid={(props as Record<string, unknown>)['data-testid'] ?? 'mock-svg'} />,
}));
jest.mock('../../../../src/client/assets/masterCC.svg', () => ({
  ReactComponent: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} data-testid={(props as Record<string, unknown>)['data-testid'] ?? 'mock-svg'} />,
}));
jest.mock('../../../../src/client/assets/visaCC.svg', () => ({
  ReactComponent: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} data-testid={(props as Record<string, unknown>)['data-testid'] ?? 'mock-svg'} />,
}));
jest.mock('../../../../src/client/assets/amexCC.svg', () => ({
  ReactComponent: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} data-testid={(props as Record<string, unknown>)['data-testid'] ?? 'mock-svg'} />,
}));
jest.mock('../../../../src/client/assets/dinersCC.svg', () => ({
  ReactComponent: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} data-testid={(props as Record<string, unknown>)['data-testid'] ?? 'mock-svg'} />,
}));
jest.mock('../../../../src/client/assets/discoverCC.svg', () => ({
  ReactComponent: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} data-testid={(props as Record<string, unknown>)['data-testid'] ?? 'mock-svg'} />,
}));
jest.mock('../../../../src/client/assets/maestroCC.svg', () => ({
  ReactComponent: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} data-testid={(props as Record<string, unknown>)['data-testid'] ?? 'mock-svg'} />,
}));

describe('FlagIcon', () => {
  const flags: Flag[] = ['amazon', 'master', 'visa', 'amex', 'diners', 'discover', 'maestro'];

  it.each(flags)('should render icon for flag "%s"', (flag) => {
    const { container } = render(<FlagIcon flag={flag} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render nothing for unknown flag', () => {
    const { container } = render(<FlagIcon flag="unknown" />);

    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('should render with viewBox for known flags', () => {
    const { container } = render(<FlagIcon flag="visa" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
  });
});
