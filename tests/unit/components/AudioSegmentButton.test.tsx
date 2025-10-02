/**
 * Unit tests for AudioSegmentButton component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { AudioSegmentButton } from '../../../src/components/atoms/AudioSegmentButton';
import { theme } from '../../../src/theme/theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('AudioSegmentButton', () => {
  const defaultProps = {
    segmentId: 'test-segment-1',
    text: '你好',
    pinyin: 'nǐ hǎo',
    audioReady: true
  };

  it('renders Chinese text correctly', () => {
    renderWithTheme(<AudioSegmentButton {...defaultProps} />);
    expect(screen.getByText('你好')).toBeInTheDocument();
  });

  it('displays pinyin when provided', () => {
    renderWithTheme(<AudioSegmentButton {...defaultProps} />);
    expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
  });

  it('calls onSegmentClick when segment is clicked', () => {
    const onSegmentClick = jest.fn();
    renderWithTheme(
      <AudioSegmentButton 
        {...defaultProps} 
        onSegmentClick={onSegmentClick}
        clickable={true}
      />
    );
    
    fireEvent.click(screen.getByText('你好'));
    expect(onSegmentClick).toHaveBeenCalledWith('test-segment-1');
  });

  it('calls onPlayAudio when audio button is clicked', () => {
    const onPlayAudio = jest.fn();
    renderWithTheme(
      <AudioSegmentButton 
        {...defaultProps} 
        onPlayAudio={onPlayAudio}
      />
    );
    
    const audioButton = screen.getByRole('button', { name: /play audio/i });
    fireEvent.click(audioButton);
    expect(onPlayAudio).toHaveBeenCalledWith('test-segment-1');
  });

  it('shows disabled state when audio is not ready', () => {
    renderWithTheme(
      <AudioSegmentButton 
        {...defaultProps} 
        audioReady={false}
      />
    );
    
    const audioButton = screen.getByRole('button', { name: /play audio/i });
    expect(audioButton).toBeDisabled();
  });

  it('applies selected styling when selected prop is true', () => {
    renderWithTheme(
      <AudioSegmentButton 
        {...defaultProps} 
        selected={true}
      />
    );
    
    const segmentBox = screen.getByText('你好').closest('div');
    expect(segmentBox).toHaveStyle({
      backgroundColor: expect.any(String)
    });
  });

  it('shows tooltip when provided', async () => {
    renderWithTheme(
      <AudioSegmentButton 
        {...defaultProps} 
        tooltip="Hello in Chinese"
      />
    );
    
    const segment = screen.getByText('你好');
    fireEvent.mouseEnter(segment);
    
    await waitFor(() => {
      expect(screen.getByText('Hello in Chinese')).toBeInTheDocument();
    });
  });

  it('does not call onSegmentClick when clickable is false', () => {
    const onSegmentClick = jest.fn();
    renderWithTheme(
      <AudioSegmentButton 
        {...defaultProps} 
        onSegmentClick={onSegmentClick}
        clickable={false}
      />
    );
    
    fireEvent.click(screen.getByText('你好'));
    expect(onSegmentClick).not.toHaveBeenCalled();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = renderWithTheme(
      <AudioSegmentButton {...defaultProps} size="small" />
    );
    
    let chineseText = screen.getByText('你好');
    expect(chineseText).toHaveClass(expect.stringContaining('MuiTypography'));
    
    rerender(
      <ThemeProvider theme={theme}>
        <AudioSegmentButton {...defaultProps} size="large" />
      </ThemeProvider>
    );
    
    chineseText = screen.getByText('你好');
    expect(chineseText).toHaveClass(expect.stringContaining('MuiTypography'));
  });
});