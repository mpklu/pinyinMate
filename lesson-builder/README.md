# PinyinMate Lesson Builder

A standalone React web application for creating Chinese language lessons that conform to the PinyinMate lesson schema.

## Features

- 📝 **Intuitive Lesson Creation** - Rich forms for Chinese content and metadata
- 🔤 **Automatic Vocabulary Extraction** - AI-powered analysis of Chinese text
- ✅ **Real-time Validation** - Schema compliance checking with detailed feedback  
- 🎨 **JSON Preview** - Live preview with syntax highlighting
- 📤 **GitHub Integration** - Direct publishing to lesson repositories
- 💾 **Auto-save** - Automatic draft saving to prevent data loss

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- GitHub personal access token (for publishing)

### Installation

```bash
# Clone the repository
git clone https://github.com/mpklu/pinyinMate.git
cd pinyinMate/lesson-builder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your GitHub credentials
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file with:

```env
VITE_GITHUB_TOKEN=your_github_token_here
VITE_GITHUB_OWNER=your_username
VITE_GITHUB_REPO=your_lesson_repo
VITE_GITHUB_BRANCH=main
```

## Usage

### Creating a Lesson

1. **Basic Information**
   - Enter lesson ID, title, and description
   - Select difficulty level (beginner/intermediate/advanced)
   - Add relevant tags and source attribution

2. **Content Creation**  
   - Input Chinese text content
   - Use the "Extract Vocabulary" button for automatic word detection
   - Manually add, edit, or remove vocabulary entries

3. **Review & Export**
   - Check the real-time validation status
   - Preview the generated JSON
   - Export to file or publish directly to GitHub

### Vocabulary Extraction

The app analyzes Chinese text to suggest vocabulary words based on:
- Character frequency analysis
- Word length heuristics  
- Educational value assessment

### Schema Validation

All lessons are validated against the PinyinMate schema in real-time:
- ✅ **Required fields** - Ensures all mandatory data is present
- ✅ **Data types** - Validates correct field types and formats
- ✅ **Constraints** - Checks length limits and value ranges
- ⚠️ **Warnings** - Provides recommendations for better content

### GitHub Publishing

Lessons are automatically:
- Saved to the appropriate difficulty folder (`lessons/beginner/`, etc.)
- Committed with descriptive messages including vocabulary count and content preview
- Formatted as valid JSON with proper encoding

## Project Structure

```
lesson-builder/
├── src/
│   ├── components/         # React UI components
│   │   ├── LessonForm.tsx  # Main lesson creation form
│   │   ├── ContentEditor.tsx # Chinese text input
│   │   ├── VocabularyManager.tsx # Vocabulary extraction & editing
│   │   ├── JSONPreview.tsx # Live JSON preview
│   │   └── ValidationStatus.tsx # Validation feedback
│   ├── hooks/             # Custom React hooks
│   │   └── useLessonBuilder.ts # Main state management
│   ├── services/          # External API integrations
│   │   ├── githubService.ts # GitHub API publishing
│   │   └── lessonGenerator.ts # JSON generation
│   ├── utils/             # Utility functions
│   │   ├── validation.ts  # Schema validation
│   │   └── textAnalysis.ts # Chinese text processing
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── dist/                 # Production build output
```

## Technical Stack

- **Frontend**: React 18 + TypeScript 5
- **Build Tool**: Vite 4
- **UI Framework**: Material-UI v5
- **Text Processing**: Custom Chinese analysis utilities
- **Syntax Highlighting**: react-syntax-highlighter
- **Deployment**: Vercel-ready configuration

## Development

### Adding New Features

1. **Components** - Create new UI components in `src/components/`
2. **Services** - Add external integrations in `src/services/`  
3. **Utils** - Add helper functions in `src/utils/`
4. **Types** - Define interfaces in `src/types/`

### Code Style

- Follow existing TypeScript and React patterns
- Use Material-UI components consistently
- Add proper type annotations
- Include JSDoc comments for complex functions

### Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Build

```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Support

- 📚 [Documentation](./SOFTWARE_REQUIREMENTS.md)
- 🐛 [Issues](https://github.com/mpklu/pinyinMate/issues)
- 💬 [Discussions](https://github.com/mpklu/pinyinMate/discussions)

---

Built with ❤️ for the PinyinMate Chinese Learning Platform