import fs from 'fs';

const topics = [
  { name: 'HTML', count: 100 },
  { name: 'CSS', count: 100 },
  { name: 'JavaScript', count: 100 },
  { name: 'React', count: 50 },
  { name: 'Node.js', count: 50 },
  { name: 'HTTP & APIs', count: 50 },
  { name: 'Web Security', count: 50 }
];

let questions = [];

topics.forEach(topic => {
  for (let i = 1; i <= topic.count; i++) {
    questions.push(`  ["What is a key concept #${i} in ${topic.name}?", "Correct Concept ${i}", "Wrong Concept A", "Wrong Concept B", "Wrong Concept C"]`);
  }
});

const content = `export interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const rawQuestions = [
${questions.join(',\n')}
];

export const QUESTIONS: Question[] = rawQuestions.map((q, i) => {
  const options = [q[1], q[2], q[3], q[4]].sort(() => Math.random() - 0.5);
  return {
    id: "q_" + i,
    category: "Web Programming",
    question: q[0],
    options: options,
    correctAnswer: q[1]
  };
});
`;

fs.writeFileSync('src/questions.ts', content);
