import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ChatPanel } from '../ChatPanel';

describe('ChatPanel empty message handling', () => {
  it('does not send empty or whitespace-only messages', () => {
    const sendMessage = vi.fn();
    render(<ChatPanel messages={[]} sendMessage={sendMessage} initialX={0} initialY={0} />);

    const input = screen.getByPlaceholderText('Message...');
    fireEvent.change(input, { target: { value: '    ' } });
    const btn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(btn);

    expect(sendMessage).not.toHaveBeenCalled();
    // input should remain unchanged since handleSend returns early
    expect(input).toHaveValue('    ');
  });
});
