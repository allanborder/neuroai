import { render, screen } from '@testing-library/react';
import App from './App';

test('renders NeuroAI brand and header', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Neuro/i);
  expect(brandElements.length).toBeGreaterThan(0);

  const headlineElement = screen.getByText(/Brain Tumor/i);
  expect(headlineElement).toBeInTheDocument();
});

test('renders upload demo zone and button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /Run Diagnosis/i });
  expect(buttonElement).toBeInTheDocument();
});
