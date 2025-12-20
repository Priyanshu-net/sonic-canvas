import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { UsersPanel } from '../UsersPanel';
import { RoomPanel } from '../RoomPanel';

describe('Lobby UI', () => {
  it('shows default room tag and user name in roster', () => {
    const users = [{ id: '1', name: 'Priyanshu', beats: 2 }];
    render(<UsersPanel users={users} room="lobby" />);
    expect(screen.getByText(/#lobby/i)).toBeInTheDocument();
    expect(screen.getByText('Priyanshu')).toBeInTheDocument();
  });

  it('RoomPanel setName triggers name update', () => {
    const setName = vi.fn();
    render(<RoomPanel room="lobby" joinRoom={vi.fn()} userName="" setName={setName} />);

    const input = screen.getByPlaceholderText('Anonymous');
    fireEvent.change(input, { target: { value: 'Pri' } });

    const btn = screen.getByRole('button', { name: /Set/i });
    fireEvent.click(btn);
    expect(setName).toHaveBeenCalledWith('Pri');
  });
});
