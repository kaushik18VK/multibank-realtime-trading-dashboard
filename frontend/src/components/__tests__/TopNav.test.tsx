import { fireEvent, render, screen } from '@testing-library/react';
import { TopNav } from '../TopNav';

describe('TopNav', () => {
  it('switches active nav section through callback', () => {
    const onSectionChange = vi.fn();
    const onToggleTheme = vi.fn();

    render(
      <TopNav
        connected
        theme="dark"
        activeSection="Dashboard"
        onSectionChange={onSectionChange}
        onToggleTheme={onToggleTheme}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Markets' }));
    expect(onSectionChange).toHaveBeenCalledWith('Markets');
  });

  it('triggers theme toggle action', () => {
    const onSectionChange = vi.fn();
    const onToggleTheme = vi.fn();

    render(
      <TopNav
        connected={false}
        theme="light"
        activeSection="Settings"
        onSectionChange={onSectionChange}
        onToggleTheme={onToggleTheme}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dark Mode' }));
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Feed Offline')).toBeInTheDocument();
  });
});
