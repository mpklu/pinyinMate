// Simple test to debug lesson loading
import { manifestBuilder } from '../src/services/manifestBuilder';

async function testManifestBuilder() {
  try {
    console.log('Testing manifest builder...');
    const manifest = await manifestBuilder.buildRuntimeManifest();
    
    console.log('Manifest built successfully!');
    console.log(`Total lessons: ${manifest.lessons.length}`);
    console.log('Lessons:');
    manifest.lessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${lesson.id}: ${lesson.title} (${lesson.metadata.difficulty})`);
    });
    
    console.log('\nCategories:', manifest.categories);
    console.log('Supported features:', manifest.supportedFeatures);
    
  } catch (error) {
    console.error('Error testing manifest builder:', error);
  }
}

testManifestBuilder();