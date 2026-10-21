// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock IntersectionObserver for JSDOM
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;
global.IntersectionObserver = MockIntersectionObserver;

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = () => ({
  clearRect: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  stroke: () => {},
  arc: () => {},
  fill: () => {},
});
