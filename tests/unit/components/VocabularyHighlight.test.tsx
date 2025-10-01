/**
 * Unit tests for VocabularyHighlight component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { VocabularyHighlight } from '../../../src/components/atoms/VocabularyHighlight';
import { theme } from '../../../src/theme/theme';
import type { VocabularyEntryWithPinyin } from '../../../src/types';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('VocabularyHighlight', () => {
  const mockVocabularyEntry: VocabularyEntryWithPinyin = {
    id: 'test-vocab-1',
    simplified: '你好',
    traditional: '你好',
    pinyin: 'nǐ hǎo',
    definition: 'Hello; Hi',
    difficulty: 'beginner',
    frequency: 100,
    tags: ['greeting'],
    examples: [
      {
        id: 'example-1',
        chinese: '你好，我叫小明。',
        pinyin: 'Nǐ hǎo, wǒ jiào Xiǎo Míng.',
        english: 'Hello, my name is Xiao Ming.',
        difficulty: 'beginner'
      }
    ]
  };

  const defaultProps = {
    word: '你好',
    vocabularyEntry: mockVocabularyEntry,
    difficulty: 'beginner' as const
  };

  it('renders vocabulary word correctly', () => {
    renderWithTheme(<VocabularyHighlight {...defaultProps} />);
    expect(screen.getByText('你好')).toBeInTheDocument();
  });

  it('calls onVocabularyClick when word is clicked', () => {
    const onVocabularyClick = jest.fn();
    renderWithTheme(
      <VocabularyHighlight 
        {...defaultProps} 
        onVocabularyClick={onVocabularyClick}
        clickable={true}
      />
    );
    
    fireEvent.click(screen.getByText('你好'));
    expect(onVocabularyClick).toHaveBeenCalledWith('你好', mockVocabularyEntry);
  });

  it('does not call onVocabularyClick when clickable is false', () => {
    const onVocabularyClick = jest.fn();
    renderWithTheme(
      <VocabularyHighlight 
        {...defaultProps} 
        onVocabularyClick={onVocabularyClick}
        clickable={false}
      />
    );
    
    fireEvent.click(screen.getByText('你好'));
    expect(onVocabularyClick).not.toHaveBeenCalled();
  });

  it('shows popover on hover when showPopover is true', async () => {
    renderWithTheme(
      <VocabularyHighlight 
        {...defaultProps} 
        showPopover={true}
      />
    );
    
    const word = screen.getByText('你好');
    fireEvent.mouseEnter(word);
    
    await waitFor(() => {
      expect(screen.getByText('Hello; Hi')).toBeInTheDocument();
      expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
    });
  });

  it('does not show popover when showPopover is false', async () => {
    renderWithTheme(
      <VocabularyHighlight 
        {...defaultProps} 
        showPopover={false}
      />
    );
    
    const word = screen.getByText('你好');
    fireEvent.mouseEnter(word);
    
    // Wait a bit to ensure popover doesn't appear
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.queryByText('Hello; Hi')).not.toBeInTheDocument();
  });

  it('applies different styling variants correctly', () => {
    const { rerender } = renderWithTheme(
      <VocabularyHighlight {...defaultProps} variant="underline" />
    );
    
    let word = screen.getByText('你好');
    expect(word.closest('span')).toHaveStyle({
      textDecoration: expect.stringContaining('underline')
    });
    
    rerender(
      <ThemeProvider theme={theme}>
        <VocabularyHighlight {...defaultProps} variant="background" />
      </ThemeProvider>
    );
    
    word = screen.getByText('你好');
    expect(word.closest('span')).toHaveStyle({
      backgroundColor: expect.any(String)
    });
  });

  it('applies active styling when active prop is true', () => {
    renderWithTheme(
      <VocabularyHighlight 
        {...defaultProps} 
        active={true}
      />
    );
    
    const word = screen.getByText('你好');
    expect(word.closest('span')).toHaveStyle({
      backgroundColor: expect.any(String)
    });
  });

  it('renders different sizes correctly', () => {
    const { rerender } = renderWithTheme(
      <VocabularyHighlight {...defaultProps} size="small" />
    );
    
    let word = screen.getByText('你好');
    expect(word).toHaveClass(expect.stringContaining('MuiTypography'));
    
    rerender(
      <ThemeProvider theme={theme}>
        <VocabularyHighlight {...defaultProps} size="large" />
      </ThemeProvider>
    );
    
    word = screen.getByText('你好');
    expect(word).toHaveClass(expect.stringContaining('MuiTypography'));
  });

  it('shows examples in popover when vocabulary entry has examples', async () => {
    renderWithTheme(
      <VocabularyHighlight 
        {...defaultProps} 
        showPopover={true}
      />
    );
    
    const word = screen.getByText('你好');
    fireEvent.mouseEnter(word);
    
    await waitFor(() => {
      expect(screen.getByText('你好，我叫小明。')).toBeInTheDocument();
      expect(screen.getByText('Hello, my name is Xiao Ming.')).toBeInTheDocument();
    });
  });

  it('renders without vocabulary entry gracefully', () => {
    renderWithTheme(
      <VocabularyHighlight 
        word="测试"
        difficulty="intermediate"
      />
    );
    
    expect(screen.getByText('测试')).toBeInTheDocument();
  });
});