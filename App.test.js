import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SoulSync header', () => {
  render(<App />);
  const titleElement = screen.getByText(/SoulSync/i);
  expect(titleElement).toBeInTheDocument();
});