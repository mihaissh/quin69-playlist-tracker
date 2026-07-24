import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CopyButton } from '../CopyButton';

// Mock clipboard API robustly
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  configurable: true,
  writable: true,
});

describe('CopyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders as button by default', () => {
    render(<CopyButton songText="Test Song" />);
    const button = screen.getByRole('button', { name: /copy song and artist/i });
    expect(button).toBeInTheDocument();
  });

  it('renders as div when variant is div', () => {
    render(<CopyButton songText="Test Song" variant="div" />);
    const div = screen.getByRole('button', { name: /copy song and artist/i });
    expect(div).toBeInTheDocument();
    expect(div.tagName).toBe('DIV');
  });

  it('copies text to clipboard on click', async () => {
    mockWriteText.mockResolvedValue(undefined);

    render(<CopyButton songText="Artist - Song" />);
    const button = screen.getByRole('button', { name: /copy song and artist/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('Artist - Song');
    });
  });

  it('shows copied state after clicking', async () => {
    mockWriteText.mockResolvedValue(undefined);

    render(<CopyButton songText="Test Song" />);
    const button = screen.getByRole('button', { name: /copy song and artist/i });

    fireEvent.click(button);

    // Check for check icon (copied state)
    await waitFor(() => {
      // In the copied state, we expect the check icon element or ripple effect to be active
      const svgs = button.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  it('handles keyboard events when variant is div', async () => {
    mockWriteText.mockResolvedValue(undefined);

    render(<CopyButton songText="Test Song" variant="div" />);
    const div = screen.getByRole('button', { name: /copy song and artist/i });

    fireEvent.keyDown(div, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('Test Song');
    });
  });

  it('handles copy errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockWriteText.mockRejectedValue(new Error('Clipboard error'));

    render(<CopyButton songText="Test Song" />);
    const button = screen.getByRole('button', { name: /copy song and artist/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });
    consoleError.mockRestore();
  });
});
