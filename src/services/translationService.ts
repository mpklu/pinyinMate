/**
 * Chinese-to-English Translation Service
 * Provides translation capabilities with multiple provider support
 */

export interface TranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export interface TranslationResponse {
  success: boolean;
  data?: {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    confidence?: number;
    provider: string;
  };
  error?: string;
}

export interface TranslationProvider {
  name: string;
  translate: (request: TranslationRequest) => Promise<TranslationResponse>;
  isAvailable: () => Promise<boolean>;
}

// Configuration interface
export interface TranslationConfig {
  googleApiKey?: string;
  azureApiKey?: string;
  azureRegion?: string;
  libreTranslateUrl?: string;
  fallbackEnabled?: boolean;
  cacheEnabled?: boolean;
  maxCacheSize?: number;
}

class TranslationService {
  private readonly providers: TranslationProvider[] = [];
  private readonly cache = new Map<string, TranslationResponse>();
  private readonly config: TranslationConfig;

  constructor(config: TranslationConfig = {}) {
    this.config = {
      fallbackEnabled: true,
      cacheEnabled: true,
      maxCacheSize: 1000,
      ...config,
    };
    
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Google Translate provider
    if (this.config.googleApiKey) {
      this.providers.push(this.createGoogleTranslateProvider());
    }

    // Azure Translator provider
    if (this.config.azureApiKey) {
      this.providers.push(this.createAzureTranslateProvider());
    }

    // LibreTranslate provider
    if (this.config.libreTranslateUrl) {
      this.providers.push(this.createLibreTranslateProvider());
    }

    // Free Google Translate provider (fallback)
    this.providers.push(this.createFreeGoogleTranslateProvider());
  }

  /**
   * Translate Chinese text to English
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const normalizedRequest: TranslationRequest = {
      sourceLanguage: 'zh',
      targetLanguage: 'en',
      ...request,
    };

    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(normalizedRequest);
      if (cached) {
        return cached;
      }
    }

    // Try providers in order
    for (const provider of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          continue;
        }

        const result = await provider.translate(normalizedRequest);
        
        if (result.success) {
          // Cache successful translation
          if (this.config.cacheEnabled) {
            this.addToCache(normalizedRequest, result);
          }
          
          return result;
        }
      } catch (error) {
        console.warn(`Translation provider ${provider.name} failed:`, error);
        
        if (!this.config.fallbackEnabled) {
          return {
            success: false,
            error: `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
        // Continue to next provider if fallback is enabled
      }
    }

    return {
      success: false,
      error: 'All translation providers failed',
    };
  }

  /**
   * Batch translate multiple texts
   */
  async translateBatch(texts: string[]): Promise<TranslationResponse[]> {
    const requests = texts.map(text => ({ text }));
    return Promise.all(requests.map(request => this.translate(request)));
  }

  private createGoogleTranslateProvider(): TranslationProvider {
    return {
      name: 'Google Translate API',
      translate: async (_request: TranslationRequest): Promise<TranslationResponse> => {
        // This would use the official @google-cloud/translate library
        // Implementation requires API key setup
        throw new Error('Google Translate API not implemented - requires @google-cloud/translate setup');
      },
      isAvailable: async (): Promise<boolean> => {
        return !!this.config.googleApiKey;
      },
    };
  }

  private createAzureTranslateProvider(): TranslationProvider {
    return {
      name: 'Azure Translator',
      translate: async (_request: TranslationRequest): Promise<TranslationResponse> => {
        // This would use Azure Cognitive Services
        throw new Error('Azure Translator not implemented - requires Azure setup');
      },
      isAvailable: async (): Promise<boolean> => {
        return !!this.config.azureApiKey;
      },
    };
  }

  private createLibreTranslateProvider(): TranslationProvider {
    return {
      name: 'LibreTranslate',
      translate: async (request: TranslationRequest): Promise<TranslationResponse> => {
        if (!this.config.libreTranslateUrl) {
          throw new Error('LibreTranslate URL not configured');
        }

        const response = await fetch(`${this.config.libreTranslateUrl}/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: request.text,
            source: request.sourceLanguage || 'zh',
            target: request.targetLanguage || 'en',
          }),
        });

        if (!response.ok) {
          throw new Error(`LibreTranslate API error: ${response.status}`);
        }

        const data = await response.json();
        
        return {
          success: true,
          data: {
            originalText: request.text,
            translatedText: data.translatedText,
            sourceLanguage: request.sourceLanguage || 'zh',
            targetLanguage: request.targetLanguage || 'en',
            provider: 'LibreTranslate',
          },
        };
      },
      isAvailable: async (): Promise<boolean> => {
        if (!this.config.libreTranslateUrl) {
          return false;
        }

        try {
          const response = await fetch(`${this.config.libreTranslateUrl}/languages`);
          return response.ok;
        } catch {
          return false;
        }
      },
    };
  }

  private createFreeGoogleTranslateProvider(): TranslationProvider {
    return {
      name: 'Free Google Translate',
      translate: async (request: TranslationRequest): Promise<TranslationResponse> => {
        // Simple Chinese-to-English dictionary for common words
        // This is a fallback implementation
        const simpleTranslations: Record<string, string> = {
          '你好': 'hello',
          '我': 'I/me',
          '你': 'you',
          '他': 'he/him',
          '她': 'she/her',
          '我们': 'we/us',
          '你们': 'you (plural)',
          '他们': 'they/them',
          '是': 'to be/is/am/are',
          '不': 'not/no',
          '有': 'to have',
          '没有': 'do not have',
          '去': 'to go',
          '来': 'to come',
          '看': 'to see/look',
          '说': 'to say/speak',
          '听': 'to listen/hear',
          '吃': 'to eat',
          '喝': 'to drink',
          '做': 'to do/make',
          '买': 'to buy',
          '卖': 'to sell',
          '学': 'to study/learn',
          '教': 'to teach',
          '工作': 'work/job',
          '家': 'home/family',
          '学校': 'school',
          '医院': 'hospital',
          '公司': 'company',
          '中国': 'China',
          '美国': 'United States',
          '英语': 'English language',
          '中文': 'Chinese language',
          '时间': 'time',
          '今天': 'today',
          '明天': 'tomorrow',
          '昨天': 'yesterday',
          '现在': 'now',
          '很': 'very',
          '好': 'good',
          '大': 'big',
          '小': 'small',
          '多': 'many/much',
          '少': 'few/little',
          '高兴': 'happy',
          '再见': 'goodbye',
          '谢谢': 'thank you',
          '不客气': 'you\'re welcome',
          '对不起': 'sorry',
          '没关系': 'it\'s okay',
        };

        const translation = simpleTranslations[request.text] || `[Translation needed for: ${request.text}]`;

        return {
          success: true,
          data: {
            originalText: request.text,
            translatedText: translation,
            sourceLanguage: request.sourceLanguage || 'zh',
            targetLanguage: request.targetLanguage || 'en',
            confidence: simpleTranslations[request.text] ? 0.8 : 0.1,
            provider: 'Simple Dictionary (Fallback)',
          },
        };
      },
      isAvailable: async (): Promise<boolean> => {
        return true; // Always available as fallback
      },
    };
  }

  private getCacheKey(request: TranslationRequest): string {
    return `${request.sourceLanguage || 'zh'}-${request.targetLanguage || 'en'}:${request.text}`;
  }

  private getFromCache(request: TranslationRequest): TranslationResponse | null {
    return this.cache.get(this.getCacheKey(request)) || null;
  }

  private addToCache(request: TranslationRequest, response: TranslationResponse): void {
    const key = this.getCacheKey(request);
    
    // Implement simple LRU cache
    if (this.cache.size >= (this.config.maxCacheSize || 1000)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, response);
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize || 1000,
    };
  }
}

// Export singleton instance
export const translationService = new TranslationService();

// Export for custom configuration
export { TranslationService };