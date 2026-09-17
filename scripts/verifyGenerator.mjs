// Quick verification script testing question generation across all 9 levels and topics
import { CURRICULUM_LEVELS } from '../src/curriculum/kpmCurriculum.ts';
import { QuestionGenerator } from '../src/curriculum/questionGenerator.ts';

console.log('Testing Curriculum Coverage across all 9 levels...');

let totalTests = 0;
let passedTests = 0;

for (const level of CURRICULUM_LEVELS) {
  console.log(`\nTesting Level: ${level.id} (${level.name.bm} / ${level.name.en})`);
  for (const topic of level.topics) {
    totalTests++;
    try {
      const q = QuestionGenerator.generate(level.id, topic.id, 'easy');
      if (!q.id || !q.prompt.bm || !q.prompt.en || q.answer === undefined) {
        throw new Error(`Invalid question structure for topic ${topic.id}`);
      }
      passedTests++;
      console.log(`  ✓ [${topic.id}] (${q.type}): "${q.prompt.bm.substring(0, 35)}..." -> Ans: ${q.answer}`);
    } catch (err) {
      console.error(`  ✕ [${topic.id}] Generation failed:`, err);
    }
  }
}

console.log(`\nGeneration test complete: ${passedTests}/${totalTests} topics verified successfully.`);
