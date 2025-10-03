# PinyinMate Lesson Builder - Software Requirements Specification

**Project**: PinyinMate Lesson Builder  
**Version**: 1.0  
**Date**: October 2, 2025  
**Author**: Development Team  
**Status**: Draft

## 1. Introduction

### 1.1 Purpose
The PinyinMate Lesson Builder is a standalone web application designed to streamline the creation of Chinese language lessons that conform to the PinyinMate lesson schema. It enables both technical developers and non-technical educators to create high-quality lesson content with automated text processing and direct GitHub integration.

### 1.2 Scope
This application will:
- Provide an intuitive interface for lesson content creation
- Automatically extract and suggest vocabulary from Chinese text
- Validate lessons against the PinyinMate schema in real-time
- Export lessons as JSON files
- Directly publish lessons to GitHub repositories
- Support single lesson creation workflow

### 1.3 Target Users
- **Primary**: Non-technical educators and content creators
- **Secondary**: Technical contributors and developers
- **Use Cases**: Creating individual lessons for PinyinMate application

## 2. Overall Description

### 2.1 Product Perspective
The Lesson Builder is a standalone React web application that complements the main PinyinMate learning platform. It shares the same lesson schema and validation logic but operates independently for content creation purposes.

### 2.2 Product Functions
1. **Content Input**: Rich text editor for Chinese lesson content
2. **Metadata Management**: Form-based input for lesson metadata
3. **Vocabulary Processing**: Automated extraction and manual curation
4. **Schema Validation**: Real-time validation against PinyinMate schema
5. **JSON Preview**: Live preview of generated lesson JSON
6. **GitHub Integration**: Direct publishing to configured repositories
7. **Export Functionality**: Download lesson files locally

### 2.3 User Characteristics
- **Technical Level**: Ranging from non-technical to technical users
- **Domain Knowledge**: Chinese language education background
- **Computer Skills**: Basic web application usage
- **Frequency of Use**: Regular lesson creation sessions

### 2.4 Constraints
- Must deploy on Vercel platform
- Must use hardcoded GitHub authentication (no user tokens)
- Must conform to existing PinyinMate lesson schema
- Must be compatible with modern web browsers
- No AI-powered features for difficulty assessment

## 3. System Features

### 3.1 Lesson Content Creation

#### 3.1.1 Description
Primary interface for inputting Chinese text content and basic lesson information.

#### 3.1.2 Functional Requirements
- **FR-1.1**: System shall provide a rich text input area for Chinese content (max 10,000 characters)
- **FR-1.2**: System shall display real-time character count for Chinese characters
- **FR-1.3**: System shall validate Chinese character encoding (UTF-8)
- **FR-1.4**: System shall provide input fields for:
  - Lesson ID (alphanumeric + hyphens/underscores)
  - Title (max 100 characters)
  - Description (max 500 characters)
  - Difficulty level (dropdown: beginner/intermediate/advanced)
  - Tags (comma-separated, auto-completion)
  - Source attribution
  - Book reference (optional)
  - Estimated time (1-300 minutes)

#### 3.1.3 Input Validation
- Real-time validation with visual feedback
- Error messages for invalid inputs
- Character limits enforced
- Required field indicators

### 3.2 Vocabulary Processing

#### 3.2.1 Description
Automated extraction and manual curation of vocabulary words from lesson content.

#### 3.2.2 Functional Requirements
- **FR-2.1**: System shall analyze Chinese text and extract potential vocabulary words
- **FR-2.2**: System shall use frequency analysis to rank suggested vocabulary
- **FR-2.3**: System shall allow manual addition of vocabulary entries
- **FR-2.4**: System shall allow manual removal of suggested vocabulary
- **FR-2.5**: System shall provide input fields for each vocabulary entry:
  - Chinese word (max 50 characters)
  - English definition (max 200 characters)
- **FR-2.6**: System should attempt to suggest English definitions via dictionary API
- **FR-2.7**: System shall validate vocabulary entries against schema requirements

#### 3.2.3 Processing Algorithm
1. Parse Chinese text into individual characters and words
2. Apply frequency analysis to identify important terms
3. Filter common particles and function words
4. Rank by frequency and educational value
5. Present top 10-20 suggestions for manual review

### 3.3 Schema Validation

#### 3.3.1 Description
Real-time validation of lesson data against PinyinMate lesson schema.

#### 3.3.2 Functional Requirements
- **FR-3.1**: System shall validate lesson structure in real-time
- **FR-3.2**: System shall display validation errors with specific field references
- **FR-3.3**: System shall display validation warnings for recommendations
- **FR-3.4**: System shall prevent export/publishing of invalid lessons
- **FR-3.5**: System shall use the same validation logic as main PinyinMate application
- **FR-3.6**: System shall validate:
  - Required fields presence
  - Data type correctness
  - String length constraints
  - Enum value validity
  - Cross-field consistency (e.g., character count)

### 3.4 JSON Preview

#### 3.4.1 Description
Live preview of the generated lesson JSON with syntax highlighting.

#### 3.4.2 Functional Requirements
- **FR-4.1**: System shall display formatted JSON preview in real-time
- **FR-4.2**: System shall provide syntax highlighting for JSON structure
- **FR-4.3**: System shall show validation status indicators
- **FR-4.4**: System shall allow copying JSON to clipboard
- **FR-4.5**: System shall update preview automatically as user inputs data
- **FR-4.6**: System shall format JSON with proper indentation and structure

### 3.5 Export Functionality

#### 3.5.1 Description
Export completed lessons as JSON files for local download.

#### 3.5.2 Functional Requirements
- **FR-5.1**: System shall generate valid JSON files conforming to lesson schema
- **FR-5.2**: System shall provide download functionality for generated files
- **FR-5.3**: System shall use lesson ID as default filename (e.g., "greetings.json")
- **FR-5.4**: System shall include proper JSON formatting and UTF-8 encoding
- **FR-5.5**: System shall validate lesson before allowing export

### 3.6 GitHub Integration

#### 3.6.1 Description
Direct publishing of lessons to configured GitHub repositories.

#### 3.6.2 Functional Requirements
- **FR-6.1**: System shall use environment-configured GitHub token for authentication
- **FR-6.2**: System shall target a single, pre-configured GitHub repository
- **FR-6.3**: System shall create files in appropriate directory structure:
  - `lessons/beginner/` for beginner lessons
  - `lessons/intermediate/` for intermediate lessons
  - `lessons/advanced/` for advanced lessons
- **FR-6.4**: System shall auto-generate descriptive commit messages including:
  - Lesson title
  - Difficulty level
  - Brief content summary
  - Vocabulary count
- **FR-6.5**: System shall handle GitHub API errors gracefully
- **FR-6.6**: System shall provide feedback on publishing success/failure
- **FR-6.7**: System shall update repository manifest.json if present

#### 3.6.3 Commit Message Format
```
Add lesson: [Title] ([Difficulty])

- Topic: [Primary tags]
- Vocabulary: [X] words
- Character count: [X]
- Estimated time: [X] minutes

Content: [First 50 characters of content]...
```

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- **NFR-1.1**: Page load time shall not exceed 3 seconds
- **NFR-1.2**: Real-time validation shall respond within 500ms
- **NFR-1.3**: Vocabulary extraction shall complete within 2 seconds for typical content
- **NFR-1.4**: GitHub publishing shall complete within 10 seconds

### 4.2 Usability Requirements
- **NFR-2.1**: Interface shall be responsive for desktop and tablet devices
- **NFR-2.2**: Form validation feedback shall be immediate and clear
- **NFR-2.3**: Application shall provide contextual help and examples
- **NFR-2.4**: Workflow shall be completable by non-technical users

### 4.3 Reliability Requirements
- **NFR-3.1**: Application shall handle network failures gracefully
- **NFR-3.2**: User input shall be preserved during browser refresh (localStorage)
- **NFR-3.3**: GitHub API failures shall not crash the application
- **NFR-3.4**: Validation errors shall not prevent continued editing

### 4.4 Compatibility Requirements
- **NFR-4.1**: Application shall work on Chrome, Firefox, Safari, Edge (latest 2 versions)
- **NFR-4.2**: Application shall be deployable on Vercel platform
- **NFR-4.3**: Application shall handle Chinese character input correctly

### 4.5 Security Requirements
- **NFR-5.1**: GitHub token shall be stored as environment variable only
- **NFR-5.2**: No sensitive data shall be logged or exposed to client
- **NFR-5.3**: API calls shall use HTTPS only
- **NFR-5.4**: Input validation shall prevent XSS attacks

## 5. Technical Specifications

### 5.1 Architecture

#### 5.1.1 Technology Stack
- **Frontend Framework**: React 19.1+
- **Language**: TypeScript 5.8+
- **Build Tool**: Vite
- **UI Framework**: Material-UI v5
- **Styling**: Material-UI theme system
- **State Management**: React hooks + Context API
- **Chinese Processing**: Custom utilities + pinyin-pro v3
- **HTTP Client**: Fetch API with error handling
- **Deployment**: Vercel

#### 5.1.2 Project Structure
```
lesson-builder/
├── package.json                 # Dependencies and scripts
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── index.html                  # Entry point
├── .env.example                # Environment variables template
├── README.md                   # Setup and deployment guide
├── src/
│   ├── main.tsx                # Application entry
│   ├── App.tsx                 # Main application component
│   ├── theme.ts                # Material-UI theme
│   ├── components/
│   │   ├── LessonForm.tsx      # Main lesson creation form
│   │   ├── ContentEditor.tsx   # Chinese text input component
│   │   ├── MetadataForm.tsx    # Lesson metadata inputs
│   │   ├── VocabularyManager.tsx # Vocabulary extraction/editing
│   │   ├── JSONPreview.tsx     # Formatted JSON display
│   │   ├── ValidationStatus.tsx # Validation feedback
│   │   └── ExportControls.tsx  # Export and publish controls
│   ├── services/
│   │   ├── githubService.ts    # GitHub API integration
│   │   ├── chineseProcessor.ts # Text analysis and vocabulary extraction
│   │   ├── dictionaryService.ts # Definition suggestions (if available)
│   │   └── lessonGenerator.ts  # JSON lesson generation
│   ├── utils/
│   │   ├── validation.ts       # Lesson schema validation
│   │   ├── textAnalysis.ts     # Chinese text processing utilities
│   │   └── storage.ts          # localStorage management
│   ├── types/
│   │   ├── lesson.ts          # Shared lesson types (from main app)
│   │   ├── builder.ts         # Builder-specific types
│   │   └── api.ts             # API response types
│   └── hooks/
│       ├── useLessonBuilder.ts # Main lesson building logic
│       ├── useValidation.ts    # Real-time validation
│       └── useGitHubPublisher.ts # Publishing workflow
└── public/
    ├── favicon.ico
    └── manifest.json
```

### 5.2 Data Models

#### 5.2.1 Builder State
```typescript
interface LessonBuilderState {
  // Basic lesson info
  id: string;
  title: string;
  description: string;
  content: string;
  
  // Metadata
  difficulty: DifficultyLevel;
  tags: string[];
  source: string;
  book: string | null;
  estimatedTime: number;
  
  // Processing state
  vocabulary: VocabularyEntry[];
  suggestedVocabulary: SuggestedVocabEntry[];
  validation: ValidationResult;
  
  // UI state
  isProcessing: boolean;
  isDirty: boolean;
  publishStatus: PublishStatus;
}

interface SuggestedVocabEntry extends VocabularyEntry {
  frequency: number;
  confidence: number;
  isSelected: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface PublishStatus {
  isPublishing: boolean;
  lastPublishSuccess: boolean;
  lastPublishError?: string;
}
```

### 5.3 Component Architecture

#### 5.3.1 Component Hierarchy
```
App
├── LessonForm (main container)
│   ├── MetadataForm
│   │   ├── BasicInfoSection
│   │   ├── DifficultySelector
│   │   ├── TagManager
│   │   └── SourceAttributionForm
│   ├── ContentEditor
│   │   ├── ChineseTextInput
│   │   ├── CharacterCounter
│   │   └── ContentValidation
│   ├── VocabularyManager
│   │   ├── VocabularyExtractor
│   │   ├── SuggestedWordsList
│   │   ├── SelectedVocabulary
│   │   └── ManualVocabEntry
│   ├── ValidationStatus
│   │   ├── ErrorList
│   │   ├── WarningList
│   │   └── ValidationSummary
│   ├── JSONPreview
│   │   ├── SyntaxHighlighter
│   │   ├── CopyButton
│   │   └── FormatToggle
│   └── ExportControls
│       ├── DownloadButton
│       ├── GitHubPublisher
│       └── PublishStatusIndicator
```

### 5.4 API Integration

#### 5.4.1 GitHub API Endpoints
- **GET /repos/{owner}/{repo}/contents/{path}** - Check file existence
- **PUT /repos/{owner}/{repo}/contents/{path}** - Create/update lesson file
- **GET /repos/{owner}/{repo}/contents/manifest.json** - Get current manifest
- **PUT /repos/{owner}/{repo}/contents/manifest.json** - Update manifest

#### 5.4.2 Dictionary API (Optional)
- **Service**: Potential integration with Chinese-English dictionary API
- **Fallback**: Manual definition entry if API unavailable
- **Rate Limiting**: Implement request throttling

### 5.5 Environment Configuration

#### 5.5.1 Environment Variables
```env
# GitHub Integration
VITE_GITHUB_TOKEN=ghp_xxxx...           # GitHub personal access token
VITE_GITHUB_OWNER=username              # Repository owner
VITE_GITHUB_REPO=chinese-lessons        # Target repository name
VITE_GITHUB_BRANCH=main                 # Target branch

# API Configuration (Optional)
VITE_DICTIONARY_API_URL=https://api...  # Dictionary service URL
VITE_DICTIONARY_API_KEY=xxx             # API key if required

# Application Settings
VITE_APP_NAME=PinyinMate Lesson Builder
VITE_MAX_CONTENT_LENGTH=10000           # Character limit
VITE_MAX_VOCABULARY_SUGGESTIONS=20      # Max auto-suggestions
```

### 5.6 Deployment Configuration

#### 5.6.1 Vercel Configuration
```json
{
  "name": "pinyinmate-lesson-builder",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_GITHUB_TOKEN": "@github_token",
    "VITE_GITHUB_OWNER": "@github_owner", 
    "VITE_GITHUB_REPO": "@github_repo",
    "VITE_GITHUB_BRANCH": "@github_branch"
  }
}
```

## 6. User Interface Design

### 6.1 Layout Structure
- **Header**: Application title, help links
- **Main Content**: Tabbed interface or accordion layout
- **Sidebar**: JSON preview (collapsible)
- **Footer**: Export controls and status

### 6.2 Workflow Steps
1. **Basic Info**: Enter title, description, ID
2. **Content Input**: Paste/type Chinese text
3. **Auto-Processing**: Review suggested vocabulary
4. **Manual Curation**: Add/remove/edit vocabulary
5. **Metadata**: Complete tags, difficulty, source info
6. **Validation**: Review and fix any issues
7. **Preview**: Review final JSON
8. **Export/Publish**: Download or push to GitHub

### 6.3 Responsive Design
- **Desktop**: Full layout with sidebar
- **Tablet**: Stacked layout, collapsible preview
- **Mobile**: Single column, step-by-step wizard

## 7. Development Phases

### 7.1 Phase 1: Core Infrastructure (Week 1)
- Project setup and configuration
- Basic React app with routing
- Material-UI integration
- TypeScript configuration
- Shared types from main app

### 7.2 Phase 2: Content Creation (Week 2)
- Content editor component
- Metadata forms
- Basic validation
- Character counting
- Form state management

### 7.3 Phase 3: Chinese Processing (Week 3)
- Vocabulary extraction algorithm
- Frequency analysis
- Manual vocabulary management
- Text analysis utilities
- Integration testing

### 7.4 Phase 4: Validation & Preview (Week 4)
- Real-time schema validation
- JSON preview component
- Syntax highlighting
- Error/warning display
- Validation testing

### 7.5 Phase 5: Export & Integration (Week 5)
- Local JSON export
- GitHub API integration
- Publishing workflow
- Error handling
- End-to-end testing

### 7.6 Phase 6: Polish & Deploy (Week 6)
- UI/UX improvements
- Performance optimization
- Documentation
- Vercel deployment
- User acceptance testing

## 8. Testing Strategy

### 8.1 Unit Testing
- Component rendering tests
- Validation logic tests
- Text processing algorithms
- GitHub API integration

### 8.2 Integration Testing
- End-to-end lesson creation workflow
- GitHub publishing workflow
- Schema validation integration
- Cross-browser compatibility

### 8.3 User Acceptance Testing
- Non-technical user testing
- Workflow usability testing
- Error handling scenarios
- Performance validation

## 9. Risk Assessment

### 9.1 Technical Risks
- **GitHub API Rate Limits**: Mitigate with proper error handling and user feedback
- **Chinese Character Processing**: Test thoroughly with various input methods
- **Schema Compatibility**: Ensure validation logic stays in sync with main app
- **Vercel Deployment**: Test build configuration early

### 9.2 Usability Risks
- **Complex Vocabulary Extraction**: Provide manual override options
- **Non-Technical Users**: Include comprehensive help documentation
- **Workflow Complexity**: Implement progressive disclosure

### 9.3 Security Risks
- **GitHub Token Exposure**: Use environment variables, never commit tokens
- **Input Validation**: Sanitize all user inputs
- **API Security**: Use HTTPS for all external communications

## 10. Success Criteria

### 10.1 Functional Success
- [ ] Non-technical users can create valid lessons in under 30 minutes
- [ ] Vocabulary extraction suggests 80%+ of relevant words
- [ ] Schema validation catches all schema violations
- [ ] GitHub publishing works reliably with proper commit messages
- [ ] JSON export produces valid, importable lesson files

### 10.2 Technical Success
- [ ] Application loads in under 3 seconds
- [ ] Real-time validation responds within 500ms
- [ ] Cross-browser compatibility verified
- [ ] Successful deployment on Vercel
- [ ] 95%+ uptime for production deployment

### 10.3 User Experience Success
- [ ] Positive feedback from non-technical testers
- [ ] Intuitive workflow requiring minimal documentation
- [ ] Effective error messages and validation feedback
- [ ] Responsive design works on all target devices

## 11. Maintenance and Support

### 11.1 Code Maintenance
- Follow same coding standards as main PinyinMate app
- Use TypeScript strict mode
- Implement comprehensive error logging
- Document all APIs and components

### 11.2 Schema Updates
- Monitor main app for lesson schema changes
- Implement version compatibility checks
- Provide migration tools if needed
- Maintain backward compatibility

### 11.3 Deployment Updates
- Use semantic versioning
- Implement staging environment
- Automated deployment via Git hooks
- Environment variable management

---

**Document Status**: Draft  
**Next Review**: Upon development completion  
**Approval Required**: Product Owner, Technical Lead
