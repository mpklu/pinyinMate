# Quickstart: Enhanced Library and Lesson System

**Feature**: Enhanced Library and Lesson System  
**Purpose**: Validate core user journeys and system integration  
**Duration**: ~15 minutes

## Prerequisites

- Development environment running (`npm run dev`)
- Test data available in `public/lessons/`
- Remote source configuration in `public/config/remote-sources.json`
- Audio functionality enabled in browser

## Test Scenarios

### 1. Library Browsing Journey (5 minutes)

**Objective**: Verify users can browse and discover lessons across multiple sources

**Steps**:
1. Navigate to `/library` page
2. **Verify**: Page displays "Library" heading and source collections
3. **Verify**: Local lessons appear under "Local Lessons" collection
4. **Verify**: Remote sources appear as separate collections (if configured)
5. Click on different difficulty filters (Beginner, Intermediate, Advanced)
6. **Verify**: Lessons filter correctly by difficulty level
7. Search for "greetings" in search box
8. **Verify**: Relevant lessons appear in search results
9. Click on a lesson card from search results
10. **Verify**: Lesson details modal or page appears with metadata

**Expected Results**:
- All lesson sources visible and organized
- Filtering works correctly
- Search functionality returns relevant results
- Lesson metadata displays properly (title, description, difficulty, tags)

**Failure Conditions**:
- Empty library page
- Missing local lessons
- Search returns no results for existing content
- Lesson metadata incomplete or incorrect

### 2. Lesson Study Journey (5 minutes)

**Objective**: Verify core lesson study experience with audio support

**Steps**:
1. From library page, select "Basic Greetings" lesson
2. Click "Start" button on lesson card
3. **Verify**: Navigate to lesson study page (`/lesson/{id}`)
4. **Verify**: Chinese text content displays in readable segments
5. Click on first sentence of Chinese text
6. **Verify**: Audio plays pronunciation for that sentence
7. **Verify**: Vocabulary section displays (if available in lesson)
8. Click on vocabulary word to hear pronunciation
9. **Verify**: Grammar points section visible (if available)
10. **Verify**: Cultural notes section visible (if available)

**Expected Results**:
- Lesson content displays clearly with Chinese text
- Audio pronunciation works for text segments
- All lesson metadata sections render appropriately
- Navigation between text segments works smoothly

**Failure Conditions**:
- Lesson content not loading
- Audio functionality not working
- Missing vocabulary or metadata sections
- Text segmentation not working properly

### 3. Flashcard Study Journey (3 minutes)

**Objective**: Verify flashcard generation and interaction

**Steps**:
1. From lesson study page, click "FlashCards" button
2. **Verify**: Navigate to flashcard interface (`/lesson/{id}/flashcards`)
3. **Verify**: First flashcard displays with Chinese word on front
4. Click anywhere on the flashcard
5. **Verify**: Card flips to show English translation and pinyin
6. **Verify**: Audio playback button appears on back of card
7. Click audio button to hear pronunciation
8. **Verify**: Audio plays for the Chinese word
9. Click "Next" button to advance to next card
10. **Verify**: New flashcard appears
11. Click "Previous" button to go back
12. **Verify**: Previous flashcard appears

**Expected Results**:
- Flashcards generate from lesson vocabulary
- Click-to-flip functionality works
- Linear navigation (next/previous) works correctly
- Audio playback functions on flashcard backs
- Pinyin displays correctly on card backs

**Failure Conditions**:
- No flashcards generated from lesson
- Card flip interaction not working
- Audio buttons not functional
- Navigation buttons not working
- Missing pinyin or translation text

### 4. Quiz Experience Journey (2 minutes)

**Objective**: Verify quiz generation and interaction

**Steps**:
1. From lesson study page, click "Quiz" button
2. **Verify**: Navigate to quiz interface (`/lesson/{id}/quiz`)
3. **Verify**: First quiz question displays with clear prompt
4. **Verify**: Question type is one of: multiple choice, fill-in-blank, or audio recognition
5. For multiple choice: Select an answer option
6. **Verify**: Feedback displays (correct/incorrect)
7. Click "Next Question" to advance
8. **Verify**: New question appears with different type
9. Complete several questions to test variety
10. **Verify**: Quiz supports all three question types over multiple questions

**Expected Results**:
- Quiz questions generate from lesson content/vocabulary
- All three question types appear: multiple choice, fill-in-blank, audio recognition
- Answer feedback system works
- Question progression works smoothly
- Audio recognition questions include audio playback

**Failure Conditions**:
- No quiz questions generated
- Only one question type appearing
- Answer feedback not working
- Audio recognition questions missing audio
- Quiz progression not working

## System Integration Validation

### Data Flow Verification
1. **Library Loading**: Local lessons + remote sources load correctly
2. **Lesson Preparation**: Content segmentation, pinyin generation, flashcard/quiz creation
3. **Audio Integration**: Text-to-speech works across all study modes
4. **State Management**: Navigation preserves lesson context and progress

### Performance Validation
1. **Library loading**: Completes within 5 seconds
2. **Lesson preparation**: Completes within 3 seconds
3. **Audio generation**: Latency under 500ms per sentence
4. **Navigation**: Transitions under 1 second

### Error Handling Validation
1. **Remote source failure**: Displays error message, continues with working sources
2. **Audio unavailable**: Shows fallback message, maintains functionality
3. **Missing lesson data**: Graceful degradation, clear error messages
4. **Network connectivity**: Offline lesson access still works

## Expected Test Data

### Local Lessons Required
- `public/lessons/beginner/greetings.json` - Main test lesson
- `public/lessons/beginner/numbers.json` - Secondary test lesson
- `public/lessons/intermediate/weather.json` - Difficulty filter test

### Remote Source Configuration
```json
{
  "sources": [
    {
      "id": "test-remote",
      "name": "Test Remote Library", 
      "url": "https://example.com/test-manifest.json",
      "enabled": false,
      "description": "Test remote source for validation"
    }
  ]
}
```

## Success Criteria

### Functional Success
- ✅ All 4 user journeys complete without errors
- ✅ Audio functionality works in all contexts
- ✅ Flashcard and quiz generation successful
- ✅ Navigation and state management working

### Performance Success  
- ✅ All performance targets met
- ✅ Smooth transitions between study modes
- ✅ Responsive on mobile devices (320px+ width)

### Error Handling Success
- ✅ Graceful degradation when features unavailable
- ✅ Clear error messages for user issues
- ✅ System remains stable despite failures

## Troubleshooting Guide

### Common Issues

**Library page empty**
- Check `public/lessons/manifest.json` exists
- Verify lesson JSON files are valid
- Check browser console for loading errors

**Audio not working**
- Verify Web Speech API support in browser
- Check browser audio permissions
- Try different browser or enable audio in settings

**Flashcards not generating**
- Ensure lesson has `vocabulary` array
- Check vocabulary entries have required fields
- Verify lesson data validation

**Quiz questions missing**
- Confirm lesson has vocabulary or sufficient content
- Check quiz generation logic in browser console
- Verify question type generation rules

## Manual Test Checklist

- [ ] Library page loads and displays lessons
- [ ] Lesson filtering and search works
- [ ] Lesson study page displays content correctly
- [ ] Audio pronunciation works for text segments
- [ ] Flashcards generate and flip correctly
- [ ] Linear flashcard navigation functions
- [ ] Quiz questions generate with variety
- [ ] All three quiz question types appear
- [ ] Audio works in flashcards and quiz
- [ ] Performance meets time targets
- [ ] Mobile-responsive design verified
- [ ] Error handling works gracefully

**Completion Time**: _____ minutes  
**Test Status**: ⬜ PASS ⬜ FAIL  
**Notes**: ________________________________