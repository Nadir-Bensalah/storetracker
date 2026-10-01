import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { LoginForm } from './LoginForm';

async function fill(email: string, password: string) {
  await fireEvent.changeText(screen.getByTestId('email-input'), email);
  await fireEvent.changeText(screen.getByTestId('password-input'), password);
}

async function fillAndSubmit(email: string, password: string) {
  await fill(email, password);
  await fireEvent.press(screen.getByTestId('submit-btn'));
}

// The press is not awaited, so the test can observe the pending state before
// settling the request itself.
async function fillAndStartSubmit(email: string, password: string) {
  await fill(email, password);
  void fireEvent.press(screen.getByTestId('submit-btn'));
}

/** A promise the test resolves or rejects itself, to observe the in-between state. */
function deferred() {
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('LoginForm', () => {
  describe('empty fields', () => {
    it.each([
      ['both fields empty', '', ''],
      ['password missing', 'ada@example.com', ''],
      ['email missing', '', 'secret'],
    ])('shows "Champs obligatoires" and does not call the API: %s', async (_, email, password) => {
      const onSubmit = jest.fn();
      await render(<LoginForm onSubmit={onSubmit} />);

      await fillAndSubmit(email, password);

      expect(screen.getByTestId('error-msg')).toHaveTextContent('Champs obligatoires');
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByTestId('loader')).toBeNull();
    });
  });

  describe('successful submission', () => {
    it('calls onSubmit once with the typed credentials, and shows no error', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      await render(<LoginForm onSubmit={onSubmit} />);

      await fillAndSubmit('ada@example.com', 'secret');

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith('ada@example.com', 'secret');
      await waitFor(() => expect(screen.queryByTestId('loader')).toBeNull());
      expect(screen.queryByTestId('error-msg')).toBeNull();
    });
  });

  describe('API error', () => {
    it('shows "Identifiants incorrects" when onSubmit rejects, and stops loading', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('401'));
      await render(<LoginForm onSubmit={onSubmit} />);

      await fillAndSubmit('ada@example.com', 'wrong');

      expect(await screen.findByTestId('error-msg')).toHaveTextContent('Identifiants incorrects');
      expect(screen.queryByTestId('loader')).toBeNull();
    });
  });

  describe('loading state', () => {
    it('shows the loader while the request is pending, and hides it once it settles', async () => {
      const request = deferred();
      await render(<LoginForm onSubmit={() => request.promise} />);

      await fillAndStartSubmit('ada@example.com', 'secret');
      expect(await screen.findByTestId('loader')).toBeOnTheScreen();

      request.resolve();
      await waitFor(() => expect(screen.queryByTestId('loader')).toBeNull());
    });

    it('also hides the loader when the request fails', async () => {
      const request = deferred();
      await render(<LoginForm onSubmit={() => request.promise} />);

      await fillAndStartSubmit('ada@example.com', 'secret');
      expect(await screen.findByTestId('loader')).toBeOnTheScreen();

      request.reject(new Error('500'));
      expect(await screen.findByTestId('error-msg')).toHaveTextContent('Identifiants incorrects');
      expect(screen.queryByTestId('loader')).toBeNull();
    });
  });

  // Behaviour of the component as provided, documented in README.md. These
  // tests describe today's behaviour; they would be inverted with the fixes.
  describe('additional observations', () => {
    it('keeps the previous error visible after a successful submission', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      await render(<LoginForm onSubmit={onSubmit} />);

      await fillAndSubmit('', '');
      await fillAndSubmit('ada@example.com', 'secret');

      await waitFor(() => expect(screen.queryByTestId('loader')).toBeNull());
      expect(screen.getByTestId('error-msg')).toHaveTextContent('Champs obligatoires');
    });

    it('lets a second press submit again while the first request is pending', async () => {
      const request = deferred();
      const onSubmit = jest.fn(() => request.promise);
      await render(<LoginForm onSubmit={onSubmit} />);

      await fillAndStartSubmit('ada@example.com', 'secret');
      await screen.findByTestId('loader');
      void fireEvent.press(screen.getByTestId('submit-btn'));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
      request.resolve();
      await waitFor(() => expect(screen.queryByTestId('loader')).toBeNull());
    });

    it('accepts fields that only contain spaces', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      await render(<LoginForm onSubmit={onSubmit} />);

      await fillAndSubmit('   ', '   ');

      expect(onSubmit).toHaveBeenCalledWith('   ', '   ');
    });
  });
});
