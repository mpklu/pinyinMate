# Publishing Lessons to GitHub: Step-by-Step Guide

This guide walks you through creating and publishing Chinese lesson content to a public GitHub repository that can be consumed by PinyinMate as a remote lesson source.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Repository Setup](#repository-setup)
4. [Creating Lesson Content](#creating-lesson-content)
5. [Publishing to GitHub](#publishing-to-github)
6. [Configuring PinyinMate](#configuring-pinyinmate)
7. [Testing and Validation](#testing-and-validation)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

PinyinMate can load lesson content from public GitHub repositories using raw file URLs. This allows educators and content creators to:

- Share lessons with the community
- Version control lesson content
- Collaborate on lesson development
- Distribute content globally via GitHub's CDN

## Prerequisites

### Required Tools
- Git installed on your computer
- GitHub account (free)
- Text editor (VS Code recommended)
- Basic familiarity with JSON format

### Knowledge Requirements
- Basic Git commands
- JSON syntax
- Understanding of Chinese characters and pinyin

## Repository Setup

### Step 1: Create a New GitHub Repository

1. **Go to GitHub.com** and sign in to your account

2. **Click the "+" icon** in the top-right corner and select "New repository"

3. **Configure your repository:**
   ```
   Repository name: chinese-lessons-hsk1
   Description: HSK Level 1 Chinese lessons for PinyinMate
   Visibility: Public ✓
   Initialize with README: ✓
   Add .gitignore: None
   Choose a license: MIT License (recommended)
   ```

4. **Click "Create repository"**

### Step 2: Clone the Repository Locally

```bash
# Replace 'yourusername' with your actual GitHub username
git clone https://github.com/yourusername/chinese-lessons-hsk1.git
cd chinese-lessons-hsk1
```

### Step 3: Create the Directory Structure

```bash
# Create the required directory structure
mkdir -p lessons/intermediate
mkdir -p lessons/advanced
mkdir -p schemas

# Create initial files
touch manifest.json
touch README.md
```

Your repository structure should look like this:
```
chinese-lessons-hsk1/
├── README.md
├── manifest.json
├── lessons/
│   ├── beginner/
│   ├── intermediate/
│   └── advanced/
└── schemas/
    └── lesson.schema.json
```

## Creating Lesson Content

### Step 4: Create the Manifest File

Create `manifest.json` in the root directory:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-02T12:00:00Z",
  "repository": {
    "name": "HSK Level 1 Chinese Lessons",
    "description": "Beginner Chinese lessons covering HSK Level 1 vocabulary and grammar",
    "author": "Your Name",
    "license": "MIT",
    "url": "https://github.com/yourusername/chinese-lessons-hsk1"
  },
  "categories": [
    {
      "id": "hsk1-basics",
      "name": "HSK 1 - Basic Lessons",
      "description": "Fundamental Chinese phrases and vocabulary",
      "difficulty": "beginner",
      "totalLessons": 5,
      "estimatedTime": 120,
      "lessons": [
        {
          "id": "numbers-1-10",
          "title": "Numbers 1-10",
          "description": "Learn to count from 1 to 10 in Chinese",
          "source": {
            "type": "remote",
            "path": "https://raw.githubusercontent.com/yourusername/chinese-lessons-hsk1/main/lessons/beginner/numbers-1-10.json"
          },
          "metadata": {
            "difficulty": "beginner",
            "tags": ["numbers", "counting", "basics", "hsk1"],
            "characterCount": 30,
            "estimatedTime": 20
          }
        },
        {
          "id": "family-members",
          "title": "Family Members",
          "description": "Basic family relationship terms",
          "source": {
            "type": "remote", 
            "path": "https://raw.githubusercontent.com/yourusername/chinese-lessons-hsk1/main/lessons/beginner/family-members.json"
          },
          "metadata": {
            "difficulty": "beginner",
            "tags": ["family", "relationships", "hsk1"],
            "characterCount": 45,
            "estimatedTime": 25
          }
        }
      ]
    }
  ],
  "settings": {
    "cacheDuration": 3600000,
    "maxCacheSize": 10485760,
    "prefetchEnabled": true,
    "supportedFeatures": ["flashcards", "quizzes", "pinyin", "vocabulary"]
  }
}
```

### Step 5: Create Individual Lesson Files

Create `lessons/beginner/numbers-1-10.json`:

```json
{
  "id": "numbers-1-10",
  "title": "Numbers 1-10",
  "description": "Learn to count from 1 to 10 in Chinese with pronunciation and writing practice",
  "content": "一、二、三、四、五、六、七、八、九、十。我有三本书。他买了五个苹果。",
  "metadata": {
    "difficulty": "beginner",
    "tags": ["numbers", "counting", "basics", "hsk1"],
    "characterCount": 30,
    "source": "HSK Level 1 Official Vocabulary",
    "book": "HSK Standard Course Level 1",
    "vocabulary": [
      {
        "word": "一",
        "definition": "one"
      },
      {
        "word": "二", 
        "definition": "two"
      },
      {
        "word": "三",
        "definition": "three"
      },
      {
        "word": "四",
        "definition": "four"
      },
      {
        "word": "五",
        "definition": "five"
      },
      {
        "word": "六",
        "definition": "six"
      },
      {
        "word": "七",
        "definition": "seven"
      },
      {
        "word": "八",
        "definition": "eight"
      },
      {
        "word": "九",
        "definition": "nine"
      },
      {
        "word": "十",
        "definition": "ten"
      },
      {
        "word": "本",
        "definition": "classifier for books"
      },
      {
        "word": "书",
        "definition": "book"
      },
      {
        "word": "个",
        "definition": "general classifier"
      },
      {
        "word": "苹果",
        "definition": "apple"
      }
    ],
    "estimatedTime": 20,
    "createdAt": "2025-10-02T12:00:00Z",
    "updatedAt": "2025-10-02T12:00:00Z"
  }
}
```

Create `lessons/beginner/family-members.json`:

```json
{
  "id": "family-members",
  "title": "Family Members",
  "description": "Learn basic family relationship terms in Chinese",
  "content": "爸爸、妈妈、哥哥、姐姐、弟弟、妹妹。这是我的家人。我爱我的家。",
  "metadata": {
    "difficulty": "beginner", 
    "tags": ["family", "relationships", "hsk1"],
    "characterCount": 45,
    "source": "HSK Level 1 Official Vocabulary",
    "book": "HSK Standard Course Level 1",
    "vocabulary": [
      {
        "word": "爸爸",
        "definition": "father, dad"
      },
      {
        "word": "妈妈",
        "definition": "mother, mom"
      },
      {
        "word": "哥哥",
        "definition": "older brother"
      },
      {
        "word": "姐姐", 
        "definition": "older sister"
      },
      {
        "word": "弟弟",
        "definition": "younger brother"
      },
      {
        "word": "妹妹",
        "definition": "younger sister"
      },
      {
        "word": "家人",
        "definition": "family members"
      },
      {
        "word": "家",
        "definition": "home, family"
      },
      {
        "word": "爱",
        "definition": "to love"
      }
    ],
    "estimatedTime": 25,
    "createdAt": "2025-10-02T12:00:00Z", 
    "updatedAt": "2025-10-02T12:00:00Z"
  }
}
```

### Step 6: Add Schema Validation (Optional)

Copy the lesson schema to `schemas/lesson.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://yourusername.github.io/chinese-lessons-hsk1/schemas/lesson.json",
  "title": "Chinese Lesson Schema",
  "description": "JSON Schema for Chinese lesson content",
  "type": "object",
  "required": ["id", "title", "description", "content", "metadata"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9-_]+$",
      "description": "Unique lesson identifier"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500
    },
    "content": {
      "type": "string",
      "minLength": 1,
      "maxLength": 10000
    },
    "metadata": {
      "type": "object",
      "required": ["difficulty", "tags", "vocabulary"],
      "properties": {
        "difficulty": {
          "type": "string",
          "enum": ["beginner", "intermediate", "advanced"]
        },
        "tags": {
          "type": "array",
          "items": {"type": "string"}
        },
        "vocabulary": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["word", "definition"],
            "properties": {
              "word": {"type": "string"},
              "definition": {"type": "string"}
            }
          }
        }
      }
    }
  }
}
```

### Step 7: Create a Comprehensive README

Update your `README.md`:

```markdown
# HSK Level 1 Chinese Lessons

A collection of beginner Chinese lessons covering HSK Level 1 vocabulary and grammar, compatible with PinyinMate and other Chinese learning applications.

## Repository Structure

```
chinese-lessons-hsk1/
├── manifest.json          # Lesson catalog and metadata
├── lessons/
│   ├── beginner/         # HSK 1 lesson files
│   ├── intermediate/     # Future HSK 2 content
│   └── advanced/         # Future HSK 3+ content
└── schemas/            # JSON schemas for validation
```

## Usage with PinyinMate

To use this repository as a remote lesson source in PinyinMate:

1. Add this repository URL to your remote sources configuration
2. The manifest URL is: `https://raw.githubusercontent.com/yourusername/chinese-lessons-hsk1/main/manifest.json`

## Lesson Content

### Available Lessons

- **Numbers 1-10**: Basic counting and number usage
- **Family Members**: Essential family relationship terms

### Features

- ✅ Vocabulary lists with definitions
- ✅ Grammar points explanation
- ✅ Cultural notes and context
- ✅ Character count and difficulty ratings
- ✅ Estimated completion times

## Contributing

We welcome contributions! Please:

1. Fork this repository
2. Create lesson files following our schema
3. Validate JSON syntax
4. Submit a pull request

## License

This content is released under the MIT License. See LICENSE file for details.

## Schema Validation

All lesson files conform to our JSON schema. Validate your content:

```bash
# Using ajv-cli (install with: npm install -g ajv-cli)
ajv validate -s schemas/lesson.schema.json -d "lessons/**/*.json"
```

## Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Issues: [Report bugs or request features](https://github.com/yourusername/chinese-lessons-hsk1/issues)
```

## Publishing to GitHub

### Step 8: Commit and Push Your Content

```bash
# Add all files to git
git add .

# Commit with descriptive message
git commit -m "Initial release: HSK 1 lessons with numbers and family members

- Added manifest.json with lesson catalog
- Created numbers 1-10 lesson with vocabulary
- Created family members lesson with cultural notes
- Added JSON schema for validation
- Comprehensive README with usage instructions"

# Push to GitHub
git push origin main
```

### Step 9: Verify Raw File URLs

After pushing, verify your files are accessible via raw URLs:

1. **Navigate to your repository on GitHub**
2. **Click on `manifest.json`**
3. **Click the "Raw" button**
4. **Copy the URL** - it should look like:
   ```
   https://raw.githubusercontent.com/yourusername/chinese-lessons-hsk1/main/manifest.json
   ```

5. **Test the URL** in your browser to ensure it returns valid JSON

### Step 10: Create a Release (Optional)

For version control and stability:

1. **Go to your repository** on GitHub
2. **Click "Releases"** in the right sidebar  
3. **Click "Create a new release"**
4. **Configure the release:**
   ```
   Tag version: v1.0.0
   Release title: HSK Level 1 Lessons - Initial Release
   Description: 
   Initial collection of HSK Level 1 Chinese lessons including:
   - Numbers 1-10 with usage examples
   - Family member vocabulary with cultural context
   - Complete vocabulary definitions and grammar points
   - JSON schema validation support
   ```
5. **Click "Publish release"**

## Configuring PinyinMate

### Step 11: Add Your Repository as a Remote Source

In your PinyinMate installation, add your repository to the remote sources configuration:

**Option A: Update `src/config/remote-sources.json`:**

```json
{
  "sources": [
    {
      "id": "your-hsk1-lessons",
      "name": "Your HSK 1 Lessons",
      "type": "remote",
      "enabled": true,
      "priority": 1,
      "config": {
        "id": "your-hsk1-lessons", 
        "name": "Your HSK 1 Lessons",
        "description": "Community HSK Level 1 lessons",
        "type": "remote",
        "url": "https://raw.githubusercontent.com/yourusername/chinese-lessons-hsk1/main/manifest.json",
        "lessons": [],
        "metadata": {
          "version": "1.0.0",
          "lastUpdated": "2025-10-02T12:00:00.000Z",
          "totalLessons": 2,
          "categories": ["hsk1"],
          "supportedFeatures": ["flashcards", "quizzes", "pinyin", "vocabulary"]
        },
        "syncInterval": 300,
        "authentication": {
          "type": "none"
        }
      }
    }
  ]
}
```

**Option B: Use the Admin Interface** (if available):
1. Navigate to Settings → Lesson Sources
2. Click "Add Remote Source"  
3. Enter your manifest URL
4. Configure sync settings

### Step 12: Test the Integration

1. **Restart PinyinMate** to load the new configuration
2. **Check the lesson library** for your new content
3. **Try loading a lesson** to verify it works correctly
4. **Test features** like flashcards and quizzes

## Testing and Validation

### Step 13: Validate Your JSON Files

Before publishing updates, always validate your JSON:

```bash
# Install JSON validation tool
npm install -g ajv-cli

# Validate manifest
ajv validate -s schemas/lesson.schema.json -d manifest.json

# Validate all lesson files
ajv validate -s schemas/lesson.schema.json -d "lessons/**/*.json"

# Check JSON syntax
cat lessons/beginner/numbers-1-10.json | python -m json.tool

# Validate with online tools
# Visit: https://jsonlint.com/
# Paste your JSON content for validation
```

### Step 14: Test Raw URLs

Create a simple test script to verify all your URLs are accessible:

```bash
#!/bin/bash
# test-urls.sh

urls=(
  "https://raw.githubusercontent.com/yourusername/chinese-lessons-hsk1/main/manifest.json"
  "https://raw.githubusercontent.com/yourusername/chinese-lessons-hsk1/main/lessons/beginner/numbers-1-10.json"
  "https://raw.githubusercontent.com/yourusername/chinese-lessons-hsk1/main/lessons/beginner/family-members.json"
)

for url in "${urls[@]}"; do
  echo "Testing: $url"
  curl -s -o /dev/null -w "Status: %{http_code}\n" "$url"
done
```

Run the test:
```bash
chmod +x test-urls.sh
./test-urls.sh
```

All URLs should return `Status: 200`.

## Best Practices

### Content Creation Guidelines

1. **Follow the Schema Strictly**
   - Always validate JSON before committing
   - Include all required fields
   - Use consistent naming conventions

2. **Quality Vocabulary**
   - Provide accurate, contextual definitions
   - Include part-of-speech information when relevant
   - Add usage examples in vocabulary definitions

3. **Cultural Context**
   - Include cultural notes for cultural concepts
   - Explain social contexts for language use
   - Add pronunciation tips for difficult sounds

4. **Progressive Difficulty**
   - Order lessons from simple to complex
   - Build on previously introduced vocabulary
   - Include review and reinforcement

### Repository Management

1. **Version Control**
   - Use semantic versioning (v1.0.0, v1.1.0, etc.)
   - Tag releases for stability
   - Write descriptive commit messages

2. **Documentation**
   - Keep README.md updated
   - Document any custom fields or extensions
   - Include usage examples

3. **Testing**
   - Validate all JSON files before pushing
   - Test URLs after each update
   - Verify integration with PinyinMate

### Performance Optimization

1. **File Size Management**
   - Keep individual lesson files under 100KB
   - Optimize audio files (use MP3, reasonable bitrate)
   - Minimize unnecessary metadata

2. **Caching Considerations**
   - Use stable URLs (avoid frequently changing branch names)
   - Set appropriate cache headers if using custom domain
   - Consider using GitHub releases for stable versions

## Troubleshooting

### Common Issues and Solutions

#### JSON Validation Errors

**Problem**: JSON syntax errors prevent loading
```
SyntaxError: Unexpected token } in JSON at position 1234
```

**Solution**:
```bash
# Use a JSON validator to find the exact error
cat manifest.json | python -m json.tool

# Common issues:
# - Trailing commas in objects/arrays
# - Missing quotes around strings
# - Unescaped quotes in strings
# - Missing closing brackets
```

#### URL Access Problems

**Problem**: Raw URLs return 404 or are inaccessible
```
Failed to load lesson: 404 Not Found
```

**Solution**:
1. Verify the file exists in your repository
2. Check the branch name (use `main` not `master`)
3. Ensure the repository is public
4. Test the raw URL directly in browser

#### Schema Validation Failures

**Problem**: Content doesn't match expected schema
```
Invalid lesson content: Lesson must have a valid id
```

**Solution**:
1. Check all required fields are present
2. Verify data types match schema requirements
3. Ensure string lengths are within limits
4. Validate against the lesson schema

#### Character Encoding Issues

**Problem**: Chinese characters display incorrectly
```
Question marks or boxes instead of Chinese characters
```

**Solution**:
1. Save files with UTF-8 encoding
2. Verify your editor's encoding settings
3. Check that GitHub displays characters correctly

#### Rate Limiting

**Problem**: Too many requests to GitHub
```
Rate limit exceeded for source: your-lessons
```

**Solution**:
1. Increase cache duration in manifest
2. Use GitHub releases for stable content
3. Consider GitHub authentication for higher limits

### Getting Help

1. **PinyinMate Issues**: Check the main repository's issue tracker
2. **GitHub Problems**: Consult GitHub's documentation
3. **JSON Schema**: Use online validators and documentation
4. **Chinese Input**: Ensure proper input method setup

### Contributing to the Community

Consider contributing your lessons to community repositories:

1. **Fork existing lesson repositories**
2. **Submit pull requests** with new content
3. **Share your repository URL** in community forums
4. **Collaborate with other educators**

---

## Example: Complete Workflow

Here's a complete example of creating and publishing a new lesson:

### 1. Create the lesson file `lessons/beginner/colors.json`:

```json
{
  "id": "basic-colors",
  "title": "Basic Colors", 
  "description": "Learn essential color vocabulary in Chinese",
  "content": "红色、蓝色、绿色、黄色、黑色、白色。我喜欢红色的花。天空是蓝色的。",
  "metadata": {
    "difficulty": "beginner",
    "tags": ["colors", "adjectives", "hsk1", "vocabulary"],
    "characterCount": 35,
    "source": "HSK Level 1 Official Vocabulary",
    "book": "HSK Standard Course Level 1",
    "vocabulary": [
      {"word": "红色", "definition": "red (color)"},
      {"word": "蓝色", "definition": "blue (color)"},
      {"word": "绿色", "definition": "green (color)"},
      {"word": "黄色", "definition": "yellow (color)"},
      {"word": "黑色", "definition": "black (color)"},
      {"word": "白色", "definition": "white (color)"},
      {"word": "喜欢", "definition": "to like"},
      {"word": "花", "definition": "flower"},
      {"word": "天空", "definition": "sky"}
    ],
    "estimatedTime": 20,
    "createdAt": "2025-10-02T14:00:00Z",
    "updatedAt": "2025-10-02T14:00:00Z"
  }
}
```

### 2. Update the manifest to include the new lesson:

```json
{
  "lessons": [
    {
      "id": "basic-colors",
      "title": "Basic Colors",
      "description": "Learn essential color vocabulary in Chinese",
      "source": {
        "type": "remote",
        "path": "https://raw.githubusercontent.com/yourusername/chinese-lessons-hsk1/main/lessons/beginner/colors.json"
      },
      "metadata": {
        "difficulty": "beginner",
        "tags": ["colors", "adjectives", "hsk1"],
        "characterCount": 35,
        "estimatedTime": 20
      }
    }
  ]
}
```

### 3. Commit and push:

```bash
git add .
git commit -m "Add basic colors lesson

- New vocabulary: 6 essential colors
- Grammar focus: adjective + noun structure  
- Cultural notes about color significance
- Updated manifest with new lesson entry"
git push origin main
```

### 4. Test the integration:

```bash
# Test the new lesson URL
curl "https://raw.githubusercontent.com/yourusername/chinese-lessons-hsk1/main/lessons/beginner/colors.json"

# Validate JSON
cat lessons/beginner/colors.json | python -m json.tool

# Test in PinyinMate by refreshing the lesson library
```

This complete workflow ensures your lessons are properly formatted, accessible, and ready for use in PinyinMate or other compatible applications.

---

## Conclusion

By following this guide, you can create professional-quality Chinese lesson content and share it with the global community of Chinese learners. The combination of GitHub's infrastructure and PinyinMate's flexible remote source system makes it easy to distribute educational content at scale.

Remember to:
- Validate all content before publishing
- Follow the established schema strictly  
- Include rich cultural and linguistic context
- Test your integration thoroughly
- Engage with the community for feedback and collaboration

Happy teaching! 教学愉快！