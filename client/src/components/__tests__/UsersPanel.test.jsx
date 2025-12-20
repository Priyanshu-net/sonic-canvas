import { render, screen } from '@testing-library/react';
import React from 'react';
import { UsersPanel } from '../../components/UsersPanel';

describe('UsersPanel', () => {
  it('renders empty state when no users', () => {
    render(<UsersPanel users={[]} room="lobby" />);
    expect(screen.getByText(/No users yet/i)).toBeInTheDocument();
  });

  it('renders a table of users', () => {
    const users = [
      { id: 'a', name: 'Alice', beats: 3, lastAction: 'beat' },
      { id: 'b', name: '', beats: 1, lastAction: 'join' }
    ];
    render(<UsersPanel users={users} room="room1" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('beat')).toBeInTheDocument();
    // Anonymous fallback
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });
});
