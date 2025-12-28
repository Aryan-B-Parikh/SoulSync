/**
 * Tests for MessageBubble Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageBubble from '../components/MessageBubble';

describe('MessageBubble', () => {
  it('renders user message correctly', () => {
    const message = {
      sender: 'user',
      text: 'Hello, SoulSync!',
    };

    render(<MessageBubble message={message} />);
    
    expect(screen.getByText('Hello, SoulSync!')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('renders bot message correctly', () => {
    const message = {
      sender: 'bot',
      text: 'Hello, dear soul.',
    };

    render(<MessageBubble message={message} />);
    
    expect(screen.getByText('Hello, dear soul.')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  it('renders error message with appropriate styling', () => {
    const message = {
      sender: 'bot',
      text: 'An error occurred.',
      isError: true,
    };

    const { container } = render(<MessageBubble message={message} />);
    
    expect(screen.getByText('An error occurred.')).toBeInTheDocument();
    const messageDiv = container.querySelector('div.bg-red-900\\/30');
    expect(messageDiv).toBeInTheDocument();
  });

  it('applies correct CSS classes for user messages', () => {
    const message = {
      sender: 'user',
      text: 'Test message',
    };

    const { container } = render(<MessageBubble message={message} />);
    
    const messageContainer = container.querySelector('.justify-end');
    expect(messageContainer).toBeInTheDocument();
  });

  it('applies correct CSS classes for bot messages', () => {
    const message = {
      sender: 'bot',
      text: 'Test response',
    };

    const { container } = render(<MessageBubble message={message} />);
    
    const messageContainer = container.querySelector('.justify-start');
    expect(messageContainer).toBeInTheDocument();
  });
});
