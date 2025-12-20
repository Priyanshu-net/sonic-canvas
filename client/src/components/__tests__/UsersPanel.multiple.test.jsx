import { render, screen } from '@testing-library/react';
import React from 'react';
import { UsersPanel } from '../UsersPanel';

describe('UsersPanel with multiple users', () => {
  it('renders multiple users and anonymous fallback', () => {
    const users = [
      { id: 'a', name: 'Alpha', beats: 5 },
      { id: 'b', name: '', beats: 0 },
      { id: 'c', name: 'Charlie', beats: 2 }
    ];
    render(<UsersPanel users={users} room="lobby" />);

    expect(screen.getByText(/#lobby/i)).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    // Anonymous fallback should render for empty name
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    // Beats appear as numeric badges
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
