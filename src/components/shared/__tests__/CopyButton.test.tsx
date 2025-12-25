import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyButton } from '../CopyButton';

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('CopyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
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
    const user = userEvent.setup({ delay: null });
    mockWriteText.mockResolvedValue(undefined);

    render(<CopyButton songText="Artist - Song" />);
    const button = screen.getByRole('button', { name: /copy song and artist/i });

    await user.click(button);

    expect(mockWriteText).toHaveBeenCalledWith('Artist - Song');
  });

  it('shows copied state after clicking', async () => {
    const user = userEvent.setup({ delay: null });
    mockWriteText.mockResolvedValue(undefined);

    render(<CopyButton songText="Test Song" />);
    const button = screen.getByRole('button', { name: /copy song and artist/i });

    await user.click(button);

    // Check for check icon (copied state)
    await waitFor(() => {
      const checkIcon = button.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  it('handles keyboard events when variant is div', async () => {
    const user = userEvent.setup({ delay: null });
    mockWriteText.mockResolvedValue(undefined);

    render(<CopyButton songText="Test Song" variant="div" />);
    const div = screen.getByRole('button', { name: /copy song and artist/i });

    await user.keyboard('{Enter}');

    expect(mockWriteText).toHaveBeenCalledWith('Test Song');
  });

  it('handles copy errors gracefully', async () => {
    const user = userEvent.setup({ delay: null });
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockWriteText.mockRejectedValue(new Error('Clipboard error'));

    render(<CopyButton songText="Test Song" />);
    const button = screen.getByRole('button', { name: /copy song and artist/i });

    await user.click(button);

    // Should not throw, just log error
    expect(mockWriteText).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

