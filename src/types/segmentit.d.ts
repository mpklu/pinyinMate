// Type definitions for segmentit
declare module 'segmentit' {
  export interface SegmentResult {
    w: string;  // word
    p?: number; // part of speech (optional)
  }

  export class Segment {
    constructor();
    doSegment(text: string, options?: { simple?: boolean }): SegmentResult[];
  }

  export default Segment;
}