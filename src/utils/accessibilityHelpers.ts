/**
 * Accessibility Helper Utilities
 * Utilities for ensuring WCAG compliance and keyboard navigation
 */

import { type KeyboardEvent, type RefObject } from 'react';

// Screen reader utilities
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.style.cssText = `
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  `;
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
};

// Keyboard navigation utilities
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  options: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    preventDefault?: boolean;
  }
) => {
  const { preventDefault = false } = options;
  
  switch (event.key) {
    case 'Enter':
      if (options.onEnter) {
        if (preventDefault) event.preventDefault();
        options.onEnter();
      }
      break;
    case ' ':
    case 'Space':
      if (options.onSpace) {
        if (preventDefault) event.preventDefault();
        options.onSpace();
      }
      break;
    case 'Escape':
      if (options.onEscape) {
        if (preventDefault) event.preventDefault();
        options.onEscape();
      }
      break;
    case 'ArrowUp':
      if (options.onArrowUp) {
        if (preventDefault) event.preventDefault();
        options.onArrowUp();
      }
      break;
    case 'ArrowDown':
      if (options.onArrowDown) {
        if (preventDefault) event.preventDefault();
        options.onArrowDown();
      }
      break;
    case 'ArrowLeft':
      if (options.onArrowLeft) {
        if (preventDefault) event.preventDefault();
        options.onArrowLeft();
      }
      break;
    case 'ArrowRight':
      if (options.onArrowRight) {
        if (preventDefault) event.preventDefault();
        options.onArrowRight();
      }
      break;
  }
};

// Focus management utilities
export const trapFocus = (containerRef: RefObject<HTMLElement>) => {
  const container = containerRef.current;
  if (!container) return () => {};

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey as any);

  return () => {
    container.removeEventListener('keydown', handleTabKey as any);
  };
};

// Focus restoration
export const useFocusRestore = () => {
  let previouslyFocusedElement: HTMLElement | null = null;

  const saveFocus = () => {
    previouslyFocusedElement = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    }
  };

  return { saveFocus, restoreFocus };
};

// ARIA utilities
export const generateAriaDescribedBy = (baseId: string, suffixes: string[]): string => {
  return suffixes.map(suffix => `${baseId}-${suffix}`).join(' ');
};

export const generateAriaLabelledBy = (baseId: string, suffixes: string[]): string => {
  return suffixes.map(suffix => `${baseId}-${suffix}`).join(' ');
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color parsing library
  const getLuminance = (color: string): number => {
    // Very basic luminance calculation for demo purposes
    // This would need proper hex/rgb parsing and sRGB conversion
    return 0.5; // Placeholder
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

export const meetsWCAGContrast = (
  color1: string, 
  color2: string, 
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = getContrastRatio(color1, color2);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
};

// Skip link utility
export const createSkipLink = (targetId: string, text: string = 'Skip to main content') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    border-radius: 4px;
    transition: top 0.3s;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  return skipLink;
};

// Reading progress for screen readers
export const announceProgress = (current: number, total: number, context: string = '') => {
  const percentage = Math.round((current / total) * 100);
  const message = context 
    ? `${context}: ${current} of ${total}, ${percentage}% complete`
    : `${current} of ${total}, ${percentage}% complete`;
  
  announceToScreenReader(message, 'polite');
};

// Language detection for screen readers
export const setLanguageAttribute = (element: HTMLElement, language: string) => {
  element.setAttribute('lang', language);
};

export const detectTextLanguage = (text: string): 'zh' | 'en' | 'unknown' => {
  // Simple language detection for Chinese vs English
  const chineseCharacters = /[\u4e00-\u9fff]/g;
  const chineseMatches = text.match(chineseCharacters);
  
  if (chineseMatches && chineseMatches.length > text.length * 0.3) {
    return 'zh';
  } else if (/^[a-zA-Z\s.,!?'"()-]+$/.test(text.trim())) {
    return 'en';
  }
  
  return 'unknown';
};