import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SoulSync main header', () => {
  render(<App />);
  const heading = screen.getByRole('heading', {
    name: /SoulSync/i,
    level: 1, // specifically targets the <h1> tag
  });
  expect(heading).toBeInTheDocument();
});
