import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomListItem from '../../../../src/client/components/navBar/customListItem';

describe('CustomListItem', () => {
  it('should render the component', () => {
    render(<CustomListItem text="Test" children={<div>Test child</div>} />);

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Test child')).toBeInTheDocument();
  });

  it('should call the onClick function when the component is clicked', () => {
    const onClick = jest.fn();
    render(<CustomListItem text="Test" onClick={onClick} children={<div>Test child</div>} />);

    fireEvent.click(screen.getByText('Test'));

    expect(onClick).toHaveBeenCalled();
  });
});
