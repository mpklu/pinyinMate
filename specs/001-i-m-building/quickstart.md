# Quickstart Guide: Chinese Learning Web App

## Development Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser (Chrome, Safari, Firefox, Edge)
- Text editor with TypeScript support (VS Code recommended)

### Installation
```bash
git clone <repository-url>
cd learn-chinese
npm install
npm run dev
```

### Tech Stack
- **Frontend**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library + Playwright
- **Key Libraries**: jieba-js, MeloTTS, jsPDF

### Project Structure
```
learn-chinese/
├── src/
│   ├── components/        # React components
│   │   ├── atoms/        # Basic UI elements
│   │   ├── molecules/    # Composite components
│   │   └── organisms/    # Complex components
│   ├── pages/            # Route components
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript definitions
│   └── assets/           # Static files
├── public/
│   └── library/          # Static Chinese content
├── tests/
│   ├── unit/            # Component tests
│   └── e2e/             # End-to-end tests
└── docs/                # Documentation
```

## Core User Journeys

### Journey 1: Text Annotation
**User Story**: Child pastes Chinese text and gets annotated version for reading practice

**Steps**:
1. Navigate to `/annotate`
2. Paste Chinese text: `你好世界，欢迎学习中文！`
3. Click "Annotate Text" button
4. System processes text and shows:
   - Segmented words with pinyin
   - Tone mark colors
   - Optional definitions
5. User can save as lesson for later use

**Expected Result**: 
- Text properly segmented into words
- Accurate pinyin with tone marks
- Clean, readable layout
- Mobile-friendly touch interactions

**Test Commands**:
```bash
npm run test:e2e -- --spec="annotation.spec.ts"
```

### Journey 2: Reading with Toggles
**User Story**: Child reads annotated text with customizable display options

**Steps**:
1. Open reader view `/reader/lesson-123`
2. Text displays with default settings
3. Toggle pinyin visibility (show/hide)
4. Toggle word definitions (show/hide)
5. Toggle tone coloring (on/off)
6. Click audio icon to hear pronunciation
7. Navigate through text smoothly

**Expected Result**:
- Instant toggle responses (<100ms)
- Clear visual feedback for active states
- Audio plays within 200ms of click
- Responsive design works on mobile

**Test Commands**:
```bash
npm run test:e2e -- --spec="reader.spec.ts"
```

### Journey 3: Quiz Taking
**User Story**: Child takes auto-generated quiz based on lesson content

**Steps**:
1. Complete text annotation (Journey 1)
2. Click "Generate Quiz" button
3. System creates quiz with 4 question types:
   - Multiple choice: "What is the pinyin for '你好'?"
   - Fill-in-blank: "__ 世界 (Hello world)"
   - Matching: Match Chinese words to definitions
   - Audio recognition: Identify spoken word
4. Answer questions sequentially
5. Submit quiz and see results
6. Review incorrect answers with explanations

**Expected Result**:
- Quiz generates in <1 second
- All question types function correctly
- Clear progress indication
- Helpful feedback on mistakes
- Mobile-optimized question layouts

**Test Commands**:
```bash
npm run test:e2e -- --spec="quiz.spec.ts"
```

### Journey 4: Flashcard Study
**User Story**: Child studies flashcards with spaced repetition system

**Steps**:
1. Generate flashcards from lesson
2. Access `/flashcards` page
3. See daily SRS queue with due cards
4. Study cards one by one:
   - See Chinese character (front)
   - Try to recall meaning
   - Flip to see pinyin + definition (back)
   - Rate difficulty (0-5 scale)
5. Complete session and see progress

**Expected Result**:
- SRS algorithm schedules cards appropriately
- Smooth card flipping animation
- Clear difficulty rating interface
- Session progress tracking
- Queue updates based on performance

**Test Commands**:
```bash
npm run test:e2e -- --spec="flashcards.spec.ts"
```

### Journey 5: Content Export
**User Story**: Child exports study materials for offline use

**Steps**:
1. Create flashcard deck or complete quiz
2. Click "Export" button
3. Choose format:
   - PDF for printing
   - Anki (.apkg) for Anki app
   - CSV for Quizlet import
4. Configure export options
5. Download generated file
6. Verify file opens correctly in target application

**Expected Result**:
- Export completes in <3 seconds
- Files are properly formatted
- All content preserved accurately
- Mobile browsers handle downloads correctly

**Test Commands**:
```bash
npm run test:e2e -- --spec="export.spec.ts"
```

## Performance Validation

### Core Web Vitals
```bash
npm run lighthouse        # Full audit
npm run test:performance  # Automated checks
```

**Targets**:
- Largest Contentful Paint (LCP): <2.5s
- First Input Delay (FID): <100ms
- Cumulative Layout Shift (CLS): <0.1
- Total Blocking Time: <200ms

### Accessibility Testing
```bash
npm run test:a11y         # Automated accessibility tests
npm run axe               # axe-core audit
```

**Requirements**:
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios: 4.5:1 (normal), 3:1 (large text)

### Mobile Testing
```bash
npm run test:mobile       # Mobile-specific tests
```

**Validation Points**:
- Touch targets ≥44px
- No horizontal scrolling
- Responsive breakpoints: 320px, 768px, 1024px
- Touch-friendly interactions

## Development Workflow

### Component Development
1. Create component in appropriate directory (atoms/molecules/organisms)
2. Write TypeScript interfaces for props
3. Implement component with accessibility in mind
4. Write unit tests
5. Test responsive behavior
6. Document component usage

### Feature Implementation
1. Design mobile-first wireframes
2. Implement core functionality
3. Add responsive behavior
4. Ensure accessibility compliance
5. Write integration tests
6. Performance optimization

### Quality Gates
- All tests must pass: `npm run test`
- Accessibility audit must pass: `npm run test:a11y`
- Performance budget must be met: `npm run lighthouse`
- Code must follow TypeScript strict mode
- Components must be properly typed

## Troubleshooting

### Common Issues
1. **Chinese text not segmenting**: Check jieba-js library installation
2. **Audio not working**: Verify MeloTTS setup or Web Speech API support
3. **Export failing**: Check browser file download permissions
4. **Mobile layout issues**: Test on actual devices, not just browser dev tools

### Debug Commands
```bash
npm run dev:debug         # Development with debug logging
npm run test:debug        # Run tests with detailed output
npm run analyze           # Bundle size analysis
```

### Browser Support
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

Mobile support prioritized over desktop for all features.