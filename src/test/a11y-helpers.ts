import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import type { RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

// Extend vitest expect with jest-axe matchers
expect.extend(toHaveNoViolations);

/**
 * Test component for accessibility violations using axe-core
 * Ensures WCAG 2.1 AA compliance
 */
export const testA11y = async (component: ReactElement): Promise<void> => {
  const { container }: RenderResult = render(component);
  const results = await axe(container, {
    rules: {
      // Configure axe rules for WCAG 2.1 AA compliance
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'aria-labels': { enabled: true },
      'semantic-markup': { enabled: true },
    },
  });
  
  expect(results).toHaveNoViolations();
};

/**
 * Test component for minimum touch target size (44px)
 * As per our constitutional requirements
 */
export const testTouchTargets = (container: HTMLElement): void => {
  const interactiveElements = container.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex="0"]'
  );
  
  interactiveElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // px
    
    expect(rect.width).toBeGreaterThanOrEqual(minSize);
    expect(rect.height).toBeGreaterThanOrEqual(minSize);
  });
};

/**
 * Test component for keyboard navigation
 */
export const testKeyboardNavigation = async (component: ReactElement): Promise<void> => {
  const { container } = render(component);
  
  // Test that all interactive elements are keyboard accessible
  const interactiveElements = container.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"]'
  );
  
  interactiveElements.forEach(element => {
    // Should be focusable via keyboard
    expect(element.getAttribute('tabindex')).not.toBe('-1');
    
    // Should have appropriate ARIA attributes
    if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
      expect(element).toHaveAttribute('type');
    }
  });
};