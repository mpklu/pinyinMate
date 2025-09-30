import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * Test component for accessibility compliance
 * Currently performs basic render testing
 * Axe-core integration can be added later with proper types
 */
export const testA11y = async (component: ReactElement): Promise<void> => {
  const { container }: RenderResult = render(component);
  
  // Basic accessibility check - ensure component renders without errors
  expect(container).toBeInTheDocument();
  
  // Check for basic accessibility attributes
  const interactiveElements = container.querySelectorAll(
    'button, [role="button"], input, select, textarea, a'
  );
  
  // Ensure interactive elements are focusable
  interactiveElements.forEach((element) => {
    if (!element.hasAttribute('disabled')) {
      expect(element.getAttribute('tabindex')).not.toBe('-1');
    }
  });
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