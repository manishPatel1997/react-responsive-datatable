import '@testing-library/jest-dom';

// Global ResizeObserver mock for jsdom
class MockResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : { width: 1000, height: 600 };
    const width = rect.width > 0 ? rect.width : 1000;
    const height = rect.height > 0 ? rect.height : 600;

    this.callback(
      [
        {
          target,
          contentRect: {
            width,
            height,
            top: 0,
            left: 0,
            bottom: height,
            right: width,
            x: 0,
            y: 0,
            toJSON: () => {},
          },
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ],
      this
    );
  }

  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  window.ResizeObserver = window.ResizeObserver || (MockResizeObserver as unknown as typeof ResizeObserver);
}
