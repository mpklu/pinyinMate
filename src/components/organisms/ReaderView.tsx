/**
 * Simple ReaderView - Working Version
 */

import React from 'react';
import type { ReaderViewProps } from '../../types/reader';

const ReaderView: React.FC<ReaderViewProps> = ({
  segments,
  readerState,
  playingAudioId,
  onSegmentSelect,
  onPlayAudio,
  onProgressChange,
  onSettingsChange,
}) => {
  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: 'white',
      minHeight: '400px'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        fontSize: '14px',
        color: '#666',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
      }}>
        Reader Mode - {segments.length} segments
      </div>

      {/* Content */}
      <div style={{
        color: 'black',
        fontSize: '18px',
        lineHeight: '1.8',
        fontFamily: '"Noto Sans SC", "Inter", sans-serif'
      }}>
        {segments.map((segment, index) => {
          const isActive = index === readerState.progress.currentSegmentIndex;
          const isPlaying = playingAudioId === segment.id;
          
          return (
            <span
              key={segment.id}
              style={{
                cursor: 'pointer',
                backgroundColor: isActive ? '#ADD8E6' : isPlaying ? '#DDA0DD' : 'transparent',
                padding: '2px 1px',
                borderRadius: '3px',
              }}
              onClick={() => {
                console.log('Clicked segment:', segment.text);
                onSegmentSelect(segment.id, index);
                if (segment.hasAudio) {
                  onPlayAudio(segment.id, segment.text);
                }
              }}
            >
              {segment.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default ReaderView;