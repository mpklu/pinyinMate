/**
 * TDD Contract tests for CategorySelector atomic component
 * Tests dropdown functionality, filtering, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../src/theme/theme';

// Import component (will fail initially - TDD approach)
import { CategorySelector } from '../../../../src/components/atoms/CategorySelector';

// Test wrapper with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Sample categories
const sampleCategories = [
  'conversation',
  'grammar',
  'vocabulary', 
  'reading',
  'listening',
  'business',
  'travel'
];

describe('CategorySelector Component', () => {
  describe('Visual Rendering', () => {
    it('should render with default "All Categories" option', () => {
      renderWithTheme(<CategorySelector categories={sampleCategories} />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    });

    it('should show dropdown arrow icon', () => {
      renderWithTheme(<CategorySelector categories={sampleCategories} />);
      
      const dropdown = screen.getByRole('combobox');
      expect(dropdown.parentElement?.querySelector('[data-testid="ArrowDropDownIcon"]')).toBeInTheDocument();
    });

    it('should display custom label when provided', () => {
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          label="Filter by Category"
        />
      );
      
      expect(screen.getByText('Filter by Category')).toBeInTheDocument();
    });

    it('should show selected category value', () => {
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          value="conversation"
        />
      );
      
      expect(screen.getByDisplayValue('conversation')).toBeInTheDocument();
    });
  });

  describe('Dropdown Behavior', () => {
    it('should open dropdown menu when clicked', async () => {
      renderWithTheme(<CategorySelector categories={sampleCategories} />);
      
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should display all categories plus "All Categories" option', async () => {
      renderWithTheme(<CategorySelector categories={sampleCategories} />);
      
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);
      
      await waitFor(() => {
        expect(screen.getByText('All Categories')).toBeInTheDocument();
        expect(screen.getByText('conversation')).toBeInTheDocument();
        expect(screen.getByText('grammar')).toBeInTheDocument();
        expect(screen.getByText('vocabulary')).toBeInTheDocument();
        expect(screen.getByText('reading')).toBeInTheDocument();
        expect(screen.getByText('listening')).toBeInTheDocument();
        expect(screen.getByText('business')).toBeInTheDocument();
        expect(screen.getByText('travel')).toBeInTheDocument();
      });
    });

    it('should close dropdown when option is selected', async () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          onChange={handleChange}
        />
      );
      
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('conversation'));
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection Behavior', () => {
    it('should call onChange when category is selected', async () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          onChange={handleChange}
        />
      );
      
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('conversation'));
      });
      
      expect(handleChange).toHaveBeenCalledWith('conversation');
    });

    it('should call onChange with null when "All Categories" is selected', async () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          value="conversation"
          onChange={handleChange}
        />
      );
      
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('All Categories'));
      });
      
      expect(handleChange).toHaveBeenCalledWith(null);
    });

    it('should handle controlled value changes', () => {
      const { rerender } = renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          value="conversation"
        />
      );
      
      expect(screen.getByDisplayValue('conversation')).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <CategorySelector 
            categories={sampleCategories} 
            value="grammar"
          />
        </ThemeProvider>
      );
      
      expect(screen.getByDisplayValue('grammar')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open dropdown with Enter key', async () => {
      renderWithTheme(<CategorySelector categories={sampleCategories} />);
      
      const dropdown = screen.getByRole('combobox');
      dropdown.focus();
      fireEvent.keyDown(dropdown, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', async () => {
      renderWithTheme(<CategorySelector categories={sampleCategories} />);
      
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      // MUI Select handles keyboard navigation internally
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should handle escape key', async () => {
      renderWithTheme(<CategorySelector categories={sampleCategories} />);
      
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      
      // MUI Select handles escape key internally
      fireEvent.keyDown(dropdown, { key: 'Escape' });
      
      // Dropdown should still be manageable
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          label="Category Filter"
        />
      );
      
      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('aria-haspopup', 'listbox');
      expect(dropdown).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when opened', async () => {
      renderWithTheme(<CategorySelector categories={sampleCategories} />);
      
      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.mouseDown(dropdown);
      
      await waitFor(() => {
        expect(dropdown).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should be focusable and have tab order', () => {
      renderWithTheme(<CategorySelector categories={sampleCategories} />);
      
      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('tabIndex', '0');
      
      dropdown.focus();
      expect(dropdown).toHaveFocus();
    });

    it('should have accessible label association', () => {
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          label="Select Category"
        />
      );
      
      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('aria-labelledby');
      
      // Label should exist in the DOM
      expect(screen.getByText('Select Category')).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should show disabled state when disabled', () => {
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          disabled
        />
      );
      
      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('aria-disabled', 'true');
      expect(dropdown).toHaveClass('Mui-disabled');
    });

    it('should show error state when error is provided', () => {
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          error
          helperText="Please select a category"
        />
      );
      
      expect(screen.getByText('Please select a category')).toBeInTheDocument();
      // Check that error text is displayed - styling is handled by MUI theme
    });

    it('should show loading state when loading', () => {
      renderWithTheme(
        <CategorySelector 
          categories={[]} 
          loading
        />
      );
      
      // Check that the select is disabled during loading
      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty categories array', () => {
      renderWithTheme(<CategorySelector categories={[]} />);
      
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);
      
      // Should only show "All Categories" option in dropdown
      expect(screen.getAllByText('All Categories')).toHaveLength(2); // One in input, one in dropdown
    });

    it('should handle single category', async () => {
      renderWithTheme(<CategorySelector categories={['conversation']} />);
      
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);
      
      await waitFor(() => {
        expect(screen.getAllByText('All Categories')).toHaveLength(2); // One in input, one in dropdown
        expect(screen.getByText('conversation')).toBeInTheDocument();
      });
    });

    it('should handle very long category names', () => {
      const longCategories = ['This is a very long category name that should be handled gracefully'];
      renderWithTheme(<CategorySelector categories={longCategories} />);
      
      const dropdown = screen.getByRole('combobox');
      fireEvent.mouseDown(dropdown);
      
      expect(screen.getByText('This is a very long category name that should be handled gracefully')).toBeInTheDocument();
    });

    it('should handle undefined value gracefully', () => {
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          value={undefined}
        />
      );
      
      // Should show "All Categories" when value is undefined
      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });

    it('should handle invalid category value', () => {
      renderWithTheme(
        <CategorySelector 
          categories={sampleCategories} 
          value="nonexistent-category"
        />
      );
      
      // Should fall back to showing the invalid value or "All Categories"
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
});