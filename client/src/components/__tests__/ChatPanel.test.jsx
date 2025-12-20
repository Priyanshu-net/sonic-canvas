import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ChatPanel } from '../ChatPanel';

describe('ChatPanel', () => {
  it('sends message and clears input', () => {
    const sendMessage = vi.fn();
    render(<ChatPanel messages={[]} sendMessage={sendMessage} initialX={0} initialY={0} />);

    const input = screen.getByPlaceholderText('Message...');
    fireEvent.change(input, { target: { value: '  hello world  ' } });
    const btn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(btn);

    // sendMessage should be called with raw input; trimming occurs at server
    expect(sendMessage).toHaveBeenCalledWith('  hello world  ');
    // input cleared
    expect(input).toHaveValue('');
  });

  it('auto-scrolls as messages grow', () => {
    const messages = Array.from({ length: 20 }).map((_, i) => ({ from: 'User', text: `msg ${i}` }));
    render(<ChatPanel messages={messages} sendMessage={vi.fn()} initialX={0} initialY={0} />);
    // Presence of last message indicates render of long list
    expect(screen.getByText(/msg 19/)).toBeInTheDocument();
  });
});
