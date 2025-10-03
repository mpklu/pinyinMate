# GitHub Publishing Setup Guide

This guide explains how to set up the lesson builder to publish lessons directly to the LSCS Chinese Lesson Depot on GitHub.

## Prerequisites

1. **GitHub Repository**: Access to `https://github.com/gelileo/chinese-lesson-depot`
2. **Personal Access Token**: GitHub token with appropriate permissions
3. **Environment Configuration**: Properly configured `.env` file

## Setting up GitHub Personal Access Token

### Step 1: Create Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set token name: `PinyinMate Lesson Builder`
4. Select expiration (recommended: 90 days or custom)
5. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access public repositories) 
   - `contents:write` (Write access to repository contents)
   - `metadata:read` (Read access to metadata)

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update the GitHub configuration:
   ```bash
   # GitHub Integration - Chinese Lesson Depot (LSCS)
   VITE_GITHUB_TOKEN=ghp_your_actual_token_here
   VITE_GITHUB_OWNER=gelileo
   VITE_GITHUB_REPO=chinese-lesson-depot
   VITE_GITHUB_BRANCH=main
   ```

3. **Important**: Never commit the `.env` file with actual tokens!

## Repository Structure

The Chinese Lesson Depot uses LSCS level organization:

```
chinese-lesson-depot/
├── manifest.json           # Auto-generated lesson catalog
└── lessons/
    ├── level1/            # Beginner lessons (Level 1)
    ├── level2/            # Beginner lessons (Level 2)
    ├── level3/            # Intermediate lessons (Level 3)
    ├── level4/            # Intermediate lessons (Level 4)
    ├── level5/            # Intermediate lessons (Level 5)
    ├── level6/            # Advanced lessons (Level 6)
    ├── level7/            # Advanced lessons (Level 7)
    └── advanced/          # Expert-level lessons
```

## Level Mapping

The lesson builder automatically maps PinyinMate difficulty levels to LSCS levels:

| PinyinMate Level | LSCS Levels Available | Default |
|------------------|----------------------|---------|
| Beginner         | Level 1, Level 2      | Level 1 |
| Intermediate     | Level 3, Level 4, Level 5 | Level 3 |
| Advanced         | Level 6, Level 7, Advanced | Level 6 |

## Publishing Workflow

1. **Create Lesson**: Use the lesson builder interface to create your lesson
2. **Select LSCS Level**: Choose the appropriate LSCS level for your lesson
3. **Validate**: Ensure the lesson passes validation
4. **Publish**: Click "Publish to GitHub" button
5. **Automatic Process**:
   - Lesson file is created/updated in appropriate LSCS level folder
   - Manifest.json is automatically updated
   - Commit message is generated with lesson details
   - Changes are pushed to the main branch

## Troubleshooting

### Authentication Errors
- Verify your GitHub token has correct permissions
- Check that token hasn't expired
- Ensure repository name and owner are correct

### Manifest Update Failures
- Check if manifest.json exists in repository root
- Verify the existing manifest has valid JSON structure
- The system will create a new manifest if one doesn't exist

### Network Issues
- Verify internet connection
- Check GitHub API status: https://www.githubstatus.com/
- Try again after a few minutes for rate limit issues

## Security Notes

1. **Token Security**: 
   - Never share your personal access token
   - Use environment variables, never hardcode tokens
   - Rotate tokens regularly (every 90 days)

2. **Repository Access**:
   - Only authorized LSCS members should have write access
   - Consider using fine-grained tokens for additional security

3. **Backup Strategy**:
   - Repository serves as primary backup
   - Local lesson files should be backed up separately
   - Consider periodic exports of lesson data

## Integration with PinyinMate

Once published, lessons become available in PinyinMate through the remote source configuration. The main app automatically:

1. Fetches the updated manifest.json
2. Discovers new lessons by LSCS level
3. Makes lessons available in the appropriate difficulty categories
4. Caches lesson content for offline access

## Support

For issues with:
- **Lesson Builder**: Check console logs and validation messages
- **GitHub Integration**: Verify token permissions and repository access
- **LSCS Level Mapping**: Consult the level mapping table above
- **Repository Structure**: Contact LSCS administrators

## API Reference

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GITHUB_TOKEN` | Personal access token | `ghp_abc123...` |
| `VITE_GITHUB_OWNER` | Repository owner | `gelileo` |
| `VITE_GITHUB_REPO` | Repository name | `chinese-lesson-depot` |
| `VITE_GITHUB_BRANCH` | Target branch | `main` |

### Publishing Functions

- `publishLessonToGitHub(lesson, lscsLevel)`: Main publishing function
- `updateRepositoryManifest(lesson, lscsLevel)`: Updates manifest.json
- `validateRemoteManifest(manifest)`: Validates manifest structure