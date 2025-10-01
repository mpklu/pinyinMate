# Translation Service Setup Guide

The `translationService.ts` provides Chinese-to-English translation with multiple provider support and fallback options.

## Quick Start (using built-in fallback)

The service is already working with a built-in dictionary for common Chinese words and phrases. No additional setup required for basic functionality.

## Production Setup Options

### Option 1: Google Translate API (Recommended)

1. **Install dependency:**
   ```bash
   npm install @google-cloud/translate
   ```

2. **Get API credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Cloud Translation API
   - Create a service account and download the JSON key
   - Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS`

3. **Configure in your app:**
   ```typescript
   import { TranslationService } from './services/translationService';
   
   const translationService = new TranslationService({
     googleApiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
   });
   ```

### Option 2: Azure Translator

1. **Install dependency:**
   ```bash
   npm install @azure/cognitiveservices-translatortext
   ```

2. **Get API credentials:**
   - Create an Azure account
   - Create a Translator resource
   - Get your API key and region

3. **Configure:**
   ```typescript
   const translationService = new TranslationService({
     azureApiKey: process.env.AZURE_TRANSLATOR_KEY,
     azureRegion: process.env.AZURE_TRANSLATOR_REGION,
   });
   ```

### Option 3: LibreTranslate (Free, Open Source)

1. **Install LibreTranslate server:**
   ```bash
   # Using Docker
   docker run -ti --rm -p 5000:5000 libretranslate/libretranslate
   
   # Or using pip
   pip install libretranslate
   libretranslate --host 0.0.0.0 --port 5000
   ```

2. **Configure:**
   ```typescript
   const translationService = new TranslationService({
     libreTranslateUrl: 'http://localhost:5000',
   });
   ```

### Option 4: Free Google Translate (Unofficial)

1. **Install dependency:**
   ```bash
   npm install google-translate-api-x
   ```

2. **Note:** This uses an unofficial API and may be unreliable. Use for development only.

## Current Implementation

The translation service is already integrated into your flashcard generation in `App.tsx`. It will:

1. Try to translate Chinese sentences to English
2. Fall back to simple dictionary translations for common words
3. Use placeholder text if translation fails

## Example Usage

```typescript
import { translationService } from './services/translationService';

// Translate a single text
const result = await translationService.translate({ 
  text: '你好，世界！' 
});

if (result.success) {
  console.log(result.data.translatedText); // "Hello, world!"
}

// Batch translate multiple texts
const texts = ['你好', '再见', '谢谢'];
const results = await translationService.translateBatch(texts);
```

## Features

- **Multiple Providers**: Google, Azure, LibreTranslate, and fallback dictionary
- **Automatic Fallback**: If one provider fails, tries the next
- **Caching**: Avoids duplicate API calls for the same text
- **Batch Processing**: Translate multiple texts efficiently
- **Type Safety**: Full TypeScript support

## Customization

You can extend the fallback dictionary in `translationService.ts` by adding more entries to the `simpleTranslations` object. This is useful for domain-specific vocabulary or common phrases in your lessons.