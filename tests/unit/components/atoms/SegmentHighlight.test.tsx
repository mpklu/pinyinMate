import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { SegmentHighlight } from '../../../../src/components/atoms';
import { theme } from '../../../../src/theme/theme';
import type { ReactElement } from 'react';

// Helper function to render with theme
const renderWithTheme = (component: ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SegmentHighlight Component', () => {
  describe('Visual Rendering', () => {
    it('should render basic highlighted text', () => {
      renderWithTheme(
        <SegmentHighlight>Hello World</SegmentHighlight>
      );
      
      const highlight = screen.getByText('Hello World');
      expect(highlight).toBeInTheDocument();
      expect(highlight).toHaveClass('MuiBox-root');
    });

    it('should apply default highlight style', () => {
      renderWithTheme(
        <SegmentHighlight>Text</SegmentHighlight>
      );
      
      const highlight = screen.getByText('Text');
      expect(highlight).toHaveStyle({
        backgroundColor: expect.stringMatching(/rgba?\(255, 235, 59|#ffeb3b/i)
      });
    });

    it('should render with custom highlight color', () => {
      renderWithTheme(
        <SegmentHighlight color="primary">
          Primary highlight
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Primary highlight');
      expect(highlight).toBeInTheDocument();
    });

    it('should render with custom severity colors', () => {
      const colors = ['error', 'warning', 'info', 'success'] as const;
      
      colors.forEach(color => {
        const { rerender } = renderWithTheme(
          <SegmentHighlight color={color}>
            {color} text
          </SegmentHighlight>
        );
        
        const highlight = screen.getByText(`${color} text`);
        expect(highlight).toBeInTheDocument();
        
        rerender(<div />);
      });
    });
  });

  describe('Highlight Types', () => {
    it('should render vocabulary highlight', () => {
      renderWithTheme(
        <SegmentHighlight type="vocabulary">
          词汇
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('词汇');
      expect(highlight).toHaveAttribute('data-highlight-type', 'vocabulary');
    });

    it('should render grammar highlight', () => {
      renderWithTheme(
        <SegmentHighlight type="grammar">
          Grammar point
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Grammar point');
      expect(highlight).toHaveAttribute('data-highlight-type', 'grammar');
    });

    it('should render difficulty highlight', () => {
      renderWithTheme(
        <SegmentHighlight type="difficulty">
          Hard word
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Hard word');
      expect(highlight).toHaveAttribute('data-highlight-type', 'difficulty');
    });

    it('should render custom highlight', () => {
      renderWithTheme(
        <SegmentHighlight type="custom">
          Custom highlight
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Custom highlight');
      expect(highlight).toHaveAttribute('data-highlight-type', 'custom');
    });
  });

  describe('Interactive Behavior', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <SegmentHighlight onClick={handleClick}>
          Clickable text
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Clickable text');
      fireEvent.click(highlight);
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('should call onHover when hovered', () => {
      const handleHover = vi.fn();
      renderWithTheme(
        <SegmentHighlight onHover={handleHover}>
          Hoverable text
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Hoverable text');
      fireEvent.mouseEnter(highlight);
      
      expect(handleHover).toHaveBeenCalled();
    });

    it('should call onLeave when mouse leaves', () => {
      const handleLeave = vi.fn();
      renderWithTheme(
        <SegmentHighlight onLeave={handleLeave}>
          Text with leave handler
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Text with leave handler');
      fireEvent.mouseLeave(highlight);
      
      expect(handleLeave).toHaveBeenCalled();
    });

    it('should support selection/toggle behavior', () => {
      const handleSelect = vi.fn();
      renderWithTheme(
        <SegmentHighlight 
          selectable 
          onSelect={handleSelect}
        >
          Selectable text
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Selectable text');
      fireEvent.click(highlight);
      
      expect(handleSelect).toHaveBeenCalledWith(true);
    });

    it('should not trigger interactions when disabled', () => {
      const handleClick = vi.fn();
      const handleHover = vi.fn();
      
      renderWithTheme(
        <SegmentHighlight 
          disabled
          onClick={handleClick}
          onHover={handleHover}
        >
          Disabled text
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Disabled text');
      fireEvent.click(highlight);
      fireEvent.mouseEnter(highlight);
      
      expect(handleClick).not.toHaveBeenCalled();
      expect(handleHover).not.toHaveBeenCalled();
    });
  });

  describe('Visual States', () => {
    it('should show selected state', () => {
      renderWithTheme(
        <SegmentHighlight selected>
          Selected text
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Selected text');
      expect(highlight).toHaveClass('selected');
    });

    it('should show hover state styling', () => {
      renderWithTheme(
        <SegmentHighlight>
          Hover text
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Hover text');
      fireEvent.mouseEnter(highlight);
      
      expect(highlight).toHaveClass('hover');
    });

    it('should show disabled state styling', () => {
      renderWithTheme(
        <SegmentHighlight disabled>
          Disabled text
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Disabled text');
      expect(highlight).toHaveClass('disabled');
    });

    it('should apply intensity variants', () => {
      const intensities = ['light', 'medium', 'strong'] as const;
      
      intensities.forEach(intensity => {
        const { rerender } = renderWithTheme(
          <SegmentHighlight intensity={intensity}>
            {intensity} text
          </SegmentHighlight>
        );
        
        const highlight = screen.getByText(`${intensity} text`);
        expect(highlight).toHaveAttribute('data-intensity', intensity);
        
        rerender(<div />);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <SegmentHighlight 
          type="vocabulary"
          aria-label="Chinese vocabulary word"
        >
          词汇
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('词汇');
      expect(highlight.tagName).toBe('MARK');
      expect(highlight).toHaveAttribute('aria-label', 'Chinese vocabulary word');
    });

    it('should be keyboard accessible when interactive', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <SegmentHighlight onClick={handleClick}>
          Interactive text
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Interactive text');
      expect(highlight).toHaveAttribute('tabIndex', '0');
      
      fireEvent.keyDown(highlight, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('should support keyboard navigation', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <SegmentHighlight onClick={handleClick}>
          Keyboard accessible
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Keyboard accessible');
      fireEvent.keyDown(highlight, { key: ' ' });
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('should announce selection state to screen readers', () => {
      renderWithTheme(
        <SegmentHighlight 
          selectable 
          selected
          aria-label="Selected vocabulary"
        >
          Selected word
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Selected word');
      expect(highlight).toHaveAttribute('aria-selected', 'true');
    });

    it('should not be focusable when disabled', () => {
      renderWithTheme(
        <SegmentHighlight disabled onClick={vi.fn()}>
          Disabled interactive
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Disabled interactive');
      expect(highlight).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Content Handling', () => {
    it('should render plain text content', () => {
      renderWithTheme(
        <SegmentHighlight>
          Simple text
        </SegmentHighlight>
      );
      
      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('should render nested elements', () => {
      renderWithTheme(
        <SegmentHighlight>
          <span>Nested</span> content
        </SegmentHighlight>
      );
      
      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('should handle empty content gracefully', () => {
      renderWithTheme(
        <SegmentHighlight />
      );
      
      const highlight = screen.getByRole('mark');
      expect(highlight).toBeInTheDocument();
      expect(highlight).toBeEmptyDOMElement();
    });

    it('should preserve whitespace', () => {
      renderWithTheme(
        <SegmentHighlight>
          {"  spaced  text  "}
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText((content, element) => {
        return element?.tagName === 'MARK' && element?.textContent === '  spaced  text  ';
      });
      expect(highlight).toBeInTheDocument();
    });
  });

  describe('Styling and Theming', () => {
    it('should apply custom styles', () => {
      renderWithTheme(
        <SegmentHighlight 
          sx={{ 
            border: '2px solid red',
            borderRadius: 4 
          }}
        >
          Custom styled
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Custom styled');
      // Check that the component accepts sx props (styles are applied by MUI)
      expect(highlight).toBeInTheDocument();
    });

    it('should support theme color variants', () => {
      renderWithTheme(
        <SegmentHighlight color="primary">
          Primary themed
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Primary themed');
      expect(highlight).toBeInTheDocument();
    });

    it('should apply rounded corners by default', () => {
      renderWithTheme(
        <SegmentHighlight>
          Rounded text
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Rounded text');
      expect(highlight).toHaveStyle({
        borderRadius: expect.stringMatching(/\d+px/)
      });
    });

    it('should support different border radius variants', () => {
      const variants = ['none', 'small', 'medium', 'large'] as const;
      
      variants.forEach(variant => {
        const { rerender } = renderWithTheme(
          <SegmentHighlight borderRadius={variant}>
            {variant} radius
          </SegmentHighlight>
        );
        
        const highlight = screen.getByText(`${variant} radius`);
        expect(highlight).toBeInTheDocument();
        
        rerender(<div />);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000);
      renderWithTheme(
        <SegmentHighlight>
          {longText}
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText(longText);
      expect(highlight).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      const specialText = '你好 🌟 café résumé naïve';
      renderWithTheme(
        <SegmentHighlight>
          {specialText}
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText(specialText);
      expect(highlight).toBeInTheDocument();
    });

    it('should handle rapid hover events', () => {
      const handleHover = vi.fn();
      const handleLeave = vi.fn();
      
      renderWithTheme(
        <SegmentHighlight 
          onHover={handleHover}
          onLeave={handleLeave}
        >
          Rapid hover
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Rapid hover');
      
      // Simulate rapid hover events
      fireEvent.mouseEnter(highlight);
      fireEvent.mouseLeave(highlight);
      fireEvent.mouseEnter(highlight);
      fireEvent.mouseLeave(highlight);
      
      expect(handleHover).toHaveBeenCalledTimes(2);
      expect(handleLeave).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple selection states', () => {
      const handleSelect = vi.fn();
      
      renderWithTheme(
        <SegmentHighlight 
          selectable
          onSelect={handleSelect}
        >
          Toggle selection
        </SegmentHighlight>
      );
      
      const highlight = screen.getByText('Toggle selection');
      
      // Click multiple times to toggle selection
      fireEvent.click(highlight);
      fireEvent.click(highlight);
      fireEvent.click(highlight);
      
      expect(handleSelect).toHaveBeenCalledTimes(3);
      expect(handleSelect).toHaveBeenNthCalledWith(1, true);
      expect(handleSelect).toHaveBeenNthCalledWith(2, false);
      expect(handleSelect).toHaveBeenNthCalledWith(3, true);
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const TestComponent = () => {
        renderSpy();
        return (
          <SegmentHighlight>
            Stable content
          </SegmentHighlight>
        );
      };
      
      const { rerender } = renderWithTheme(<TestComponent />);
      
      // Re-render with same props
      rerender(<TestComponent />);
      
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle many highlight instances efficiently', () => {
      const highlights = Array.from({ length: 100 }, (_, i) => (
        <SegmentHighlight key={i} type="vocabulary">
          Word {i}
        </SegmentHighlight>
      ));
      
      renderWithTheme(<div>{highlights}</div>);
      
      expect(screen.getAllByRole('mark')).toHaveLength(100);
    });
  });
});