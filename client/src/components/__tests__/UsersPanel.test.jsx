import { render, screen } from '@testing-library/react';
import React from 'react';
import { UsersPanel } from '../../components/UsersPanel';

describe('UsersPanel', () => {
  it('renders empty state when no users', () => {
    render(<UsersPanel users={[]} room="lobby" />);
    expect(screen.getByText(/Scanning.../i)).toBeInTheDocument();
  });

  it('renders a table of users', () => {
    const users = [
      { id: 'a', name: 'Alice', beats: 3, lastAction: 'beat' },
      { id: 'b', name: '', beats: 1, lastAction: 'join' }
    ];
    render(<UsersPanel users={users} room="room1" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  // lastAction is no longer displayed in the UI
    // Anonymous fallback
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });
});
