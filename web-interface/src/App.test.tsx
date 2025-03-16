import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const welcomeElements = screen.queryAllByText('Welcome to H4X-Tools Web Interface');
  expect(welcomeElements.length).toBeGreaterThan(0);
});
