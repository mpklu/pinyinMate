// Test the manifest builder directly
console.log('Testing manifest builder...');

async function testManifest() {
  try {
    // First test: load the public manifest
    console.log('1. Loading public manifest...');
    const response = await fetch('/lessons/manifest.json');
    const manifest = await response.json();
    
    console.log('Public manifest categories:', manifest.categories.length);
    manifest.categories.forEach(cat => {
      console.log(`  ${cat.id}: ${cat.lessons.length} lessons`);
      cat.lessons.forEach(lesson => {
        console.log(`    - ${lesson.id}: ${lesson.source.path}`);
      });
    });
    
    // Second test: try to load each lesson file individually
    console.log('\n2. Testing individual lesson loading...');
    for (const category of manifest.categories) {
      for (const lessonRef of category.lessons) {
        try {
          console.log(`Loading ${lessonRef.id} from ${lessonRef.source.path}...`);
          const lessonResponse = await fetch(lessonRef.source.path);
          if (!lessonResponse.ok) {
            console.error(`❌ Failed to load ${lessonRef.id}: ${lessonResponse.status}`);
          } else {
            const lessonData = await lessonResponse.json();
            console.log(`✅ Loaded ${lessonRef.id}: "${lessonData.title}" (id in file: ${lessonData.id})`);
          }
        } catch (error) {
          console.error(`❌ Error loading ${lessonRef.id}:`, error);
        }
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testManifest();