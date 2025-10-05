Help me add a 'Reader' mode to LesssonPage.
1. Purpose
Reader Mode allows users to read the full lesson text in a smooth, visually comfortable interface with integrated pinyin annotations, pronunciation playback, and optional auto-scroll. The feature extends the existing Lesson, Flashcard, and Quiz modules while maintaining the same design language, coding structure, and user experience logic.
2. Scope
Reader Mode will:
	•	Display full lesson content segmented by words or phrases.
	•	Allow users to toggle pinyin visibility, tone coloring, and reading themes.
	•	Support auto-scrolling for continuous reading.
	•	Provide click-to-pronounce functionality per word / phrases.
	•	Use reading-friendly color schemes to minimize eye strain.
	•	Integrate seamlessly with the existing lesson structure, data models, and state management patterns.
3.  Design Philosophy
Implementation must follow the existing app’s visual style, tone system, and modular logic:
	•	UI structure and styling should reuse existing classes and component patterns when possible
	•	State management, navigations, must integrate with the existing system 
	•	All new components must follow existing naming, prop typing, and event-handling conventions, and atomic design.
	•	The audio synthesis and playback logic must extend existing audio utilities (used in lesson and flashcard pronunciation playback).
4.  Responsive design for mobile, tablet, and desktop   
5.  Functional Requirements
5.1 Reader Display
	•	Reader Mode must display the full lesson text segmented by words or phrases.
	•	Each segment must show pinyin directly above the corresponding Chinese characters 
	•   Pinyin display can be toggled between:
	   •	Hidden
	   •	With tone marks
	•  Tone colors must match existing tone color definitions used in flashcards/quizzes.

5.2 Audio Playback
	•	Clicking on any word or sentence must trigger pronunciation playback.
	•	Only one audio playback session should occur at a time, interrupting prior sounds if necessary.
	•	Currently playing words should be visually highlighted 
5.3 Auto-Scroll and Progress
	•	When auto-scroll is enabled, the reader must smoothly advance through sentences, aligning the current sentence vertically centered in the viewport.
	•	Auto-scroll speed should be adjustable (0.75x / 1x / 1.25x).
	•	Manual user scrolling should temporarily pause auto-scroll until inactivity resumes.
	•	A progress indicator bar should show the reader’s current position through the lesson text.    


## Clarifications

1.Mode Integration: Should the Reader mode be:

A toggle that transforms the current lesson view into reader mode? Yes


2. Segmentation Strategy: For the reader mode, should text be segmented by:

Words/phrases (using the existing text segmentation service)? Yes

3. Auto-scroll Behavior: When auto-scroll is active, should it:

Automatically play audio for each segment as it scrolls? No
Just scroll without audio (user clicks to play)? Yes
Have both options available? No

4. Theme Integration: For the "reading-friendly color schemes", should this:

Use the existing tone colors (#FF6B6B, #4ECDC4, #45B7D1, #96CEB4) from ChineseText.tsx?
Add new reading-specific themes (dark mode, sepia, etc.)? Probably, use your best judgement

5. State Management: Should the Reader mode settings (pinyin visibility, theme, auto-scroll speed) be:

Persisted in localStorage?
Managed through the existing SessionContext? Perhaps, use your best judgement
Local to the reader component?

6. Navigation: Should users be able to:

Switch between normal lesson view and reader mode seamlessly? Yes
Access study tools (flashcards/quizzes) from reader mode? We can, but not necessarily, use your judgement