/**
 * Tests for useChat Hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../hooks/useChat';
import * as api from '../utils/api';

// Mock the API
jest.mock('../utils/api');

describe('useChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.input).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('updates input value', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.handleInputChange('Hello');
    });

    expect(result.current.input).toBe('Hello');
  });

  it('sends message successfully', async () => {
    const mockResponse = 'AI response';
    api.validateMessage.mockReturnValue({ isValid: true });
    api.sendChatMessage.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.handleInputChange('Test message');
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].text).toBe('Test message');
      expect(result.current.messages[1].text).toBe(mockResponse);
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles validation error', async () => {
    const validationError = 'Please share your thoughts with me, dear soul. 💭';
    api.validateMessage.mockReturnValue({ 
      isValid: false, 
      error: validationError 
    });

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.handleInputChange('');
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.error).toBe(validationError);
    expect(result.current.messages).toHaveLength(0);
  });

  it('handles API error', async () => {
    api.validateMessage.mockReturnValue({ isValid: true });
    api.sendChatMessage.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.handleInputChange('Test');
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[1].isError).toBe(true);
      expect(result.current.loading).toBe(false);
    });
  });

  it('clears messages', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.handleInputChange('Test');
    });

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('clears input after sending message', async () => {
    api.validateMessage.mockReturnValue({ isValid: true });
    api.sendChatMessage.mockResolvedValue('Response');

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.handleInputChange('Test message');
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    await waitFor(() => {
      expect(result.current.input).toBe('');
    });
  });
});
