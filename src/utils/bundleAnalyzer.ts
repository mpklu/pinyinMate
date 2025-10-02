/**
 * Bundle Analysis Script
 * Analyzes bundle size and provides optimization recommendations
 */

import { resolve } from 'path';
import { promises as fs } from 'fs';

interface BundleAnalysis {
  totalSize: number;
  gzipSize: number;
  modules: ModuleInfo[];
  recommendations: string[];
}

interface ModuleInfo {
  name: string;
  size: number;
  gzipSize: number;
  chunkNames: string[];
}

export class BundleAnalyzer {
  private readonly distPath: string;
  
  constructor(distPath: string = 'dist') {
    this.distPath = resolve(process.cwd(), distPath);
  }
  
  async analyze(): Promise<BundleAnalysis> {
    const analysis: BundleAnalysis = {
      totalSize: 0,
      gzipSize: 0,
      modules: [],
      recommendations: []
    };
    
    try {
      const files = await this.getJSFiles();
      
      for (const file of files) {
        const stats = await fs.stat(file);
        analysis.totalSize += stats.size;
        
        // Basic module info (would need webpack-bundle-analyzer for detailed analysis)
        analysis.modules.push({
          name: file.split('/').pop() || file,
          size: stats.size,
          gzipSize: Math.round(stats.size * 0.3), // Rough estimation
          chunkNames: [file.includes('vendor') ? 'vendor' : 'main']
        });
      }
      
      analysis.gzipSize = Math.round(analysis.totalSize * 0.3);
      analysis.recommendations = this.generateRecommendations(analysis);
      
    } catch (error) {
      console.error('Bundle analysis failed:', error);
    }
    
    return analysis;
  }
  
  private async getJSFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.distPath);
      return files
        .filter(file => file.endsWith('.js'))
        .map(file => resolve(this.distPath, file));
    } catch (error) {
      console.warn('Could not read dist directory, bundle analysis unavailable:', error);
      return [];
    }
  }
  
  private generateRecommendations(analysis: BundleAnalysis): string[] {
    const recommendations: string[] = [];
    
    // Size-based recommendations
    if (analysis.totalSize > 1024 * 1024) { // > 1MB
      recommendations.push('Consider code splitting to reduce initial bundle size');
    }
    
    if (analysis.totalSize > 500 * 1024) { // > 500KB
      recommendations.push('Enable gzip compression on your server');
      recommendations.push('Consider lazy loading non-critical components');
    }
    
    // Module-based recommendations
    const largeModules = analysis.modules.filter(m => m.size > 100 * 1024);
    if (largeModules.length > 0) {
      recommendations.push(`Large modules found: ${largeModules.map(m => m.name).join(', ')}`);
      recommendations.push('Consider dynamic imports for large modules');
    }
    
    // General recommendations
    recommendations.push('Use React.memo() for components with expensive renders');
    recommendations.push('Implement virtual scrolling for large lists');
    recommendations.push('Use debounce/throttle for frequent user interactions');
    
    return recommendations;
  }
  
  printAnalysis(analysis: BundleAnalysis): void {
    console.log('\n📊 Bundle Analysis Report');
    console.log('========================');
    console.log(`Total Size: ${this.formatBytes(analysis.totalSize)}`);
    console.log(`Estimated Gzipped: ${this.formatBytes(analysis.gzipSize)}`);
    
    if (analysis.modules.length > 0) {
      console.log('\n📦 Modules:');
      analysis.modules.forEach(module => {
        console.log(`  - ${module.name}: ${this.formatBytes(module.size)}`);
      });
    }
    
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      analysis.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().then(analysis => {
    analyzer.printAnalysis(analysis);
  });
}