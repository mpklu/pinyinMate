import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  handler: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[], enabled: boolean = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const ctrlOrMeta = event.ctrlKey || event.metaKey;
        const matchesModifiers =
          (!shortcut.ctrlKey && !shortcut.metaKey || ctrlOrMeta) &&
          (shortcut.altKey === undefined || shortcut.altKey === event.altKey) &&
          (shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey);

        if (matchesModifiers && event.key.toLowerCase() === shortcut.key.toLowerCase()) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl+S', description: 'Save draft to localStorage' },
  { key: 'Ctrl+E', description: 'Toggle between create/edit mode' },
  { key: 'Ctrl+B', description: 'Open/close lesson browser' },
  { key: 'Esc', description: 'Close open dialogs' },
  { key: 'Ctrl+U', description: 'Update lesson on GitHub (edit mode)' },
  { key: 'Ctrl+Shift+P', description: 'Publish lesson to GitHub (create mode)' },
];
