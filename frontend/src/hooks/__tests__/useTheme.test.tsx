import { act, renderHook } from '@testing-library/react';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('persists and toggles theme mode', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBeDefined();

    act(() => {
      result.current.toggleTheme();
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe(result.current.theme);
    expect(localStorage.getItem('mb-theme')).toBe(result.current.theme);
  });
});
