export function showDemoUnavailable() {
  window.dispatchEvent(new Event('portfolio:unavailable'));
}
