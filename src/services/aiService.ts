import type { AIGenerationParams } from '../types';

// For a real implementation, you would use environment variables from .env files
const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY;

interface AIGeneratedCard {
  question: string;
  answer: string;
  hint?: string;
  options?: string[];
}

export async function generateFlashcards(params: AIGenerationParams): Promise<AIGeneratedCard[]> {
  try {
    const { topic, subject, className, count, difficulty, language } = params;
    
    // Build the enhanced prompt
    let prompt = `You are an expert study assistant who writes high-quality spaced-repetition flashcards.
Generate a set of *unique* flashcards for the following context:

Topic: ${topic}`;

    if (subject) {
      prompt += `\nSubject: ${subject}`;
    }
    if (className) {
      prompt += `\nClass/Grade: ${className}`;
    }

    prompt += `
----------------------------------------
OUTPUT REQUIREMENTS
• Return **exactly ${count}** items.
• Output must be a **single JSON array** of objects, nothing else.
• Each object MUST include these fields:
  {
    "question": "...",
    "answer": "...",
    "hint": "...",
    "options": ["...", "...", "...", "..."]
  }

QUALITY RULES
1. **No two questions should test the same fact** or use the same wording.
2. Vary the style among:
   – definition / "What is …?"  
   – fill-in-the-blank  
   – why / how reasoning  
   – true-or-false  
   – multiple-choice style (list options in the question text)  
   – comparison ("Differences between …")  
3. Keep questions clear and concise; max 25 words each.
4. Hints should be short mnemonic aids (≤ 12 words), not the answer.
5. Answers must be factually correct and ≤ 30 words.
6. IMPORTANT: For every flashcard, include exactly 4 options in the "options" array:
   - The first option MUST be the correct answer (identical to the "answer" field)
   - The other 3 options must be plausible but incorrect alternatives
   - All options should be distinct and clearly distinguishable
   - Each option should be roughly the same length and format

OPTIONAL SETTINGS`;

    if (difficulty) {
      prompt += `\n• Difficulty level: ${difficulty}`;
    }
    prompt += `\n• Format: Multiple-choice flashcards with Q-and-A`;

    if (language && language.toLowerCase() !== 'english') {
      prompt += `\n• Language for question, answer, hint, and options: ${language}`;
    }

    prompt += `
----------------------------------------
Begin generating the JSON array now:`;
    
    // Check if API key exists
    if (COHERE_API_KEY) {
      return await makeRealCohereRequest(prompt);
    } else {
      console.warn('No Cohere API key found. Using mock data instead.');
      return getMockFlashcards(params);
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards. Please try again later.');
  }
}

async function makeRealCohereRequest(prompt: string): Promise<AIGeneratedCard[]> {
  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 2000,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.generations[0].text;
    
    // Extract JSON array from the response
    const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    if (!jsonMatch) {
      console.error('Could not extract JSON from response:', generatedText);
      throw new Error('Could not parse AI response into flashcards');
    }
    
    try {
      const cards: AIGeneratedCard[] = JSON.parse(jsonMatch[0]);
      
      // Validate and clean up cards
      return cards.slice(0, Math.min(cards.length, 10)).map(card => ({
        question: card.question || 'Question unavailable',
        answer: card.answer || 'Answer unavailable',
        hint: card.hint || undefined,
        options: Array.isArray(card.options) && card.options.length >= 4 
          ? card.options.slice(0, 4) 
          : [card.answer || 'Answer unavailable', 'Option 2', 'Option 3', 'Option 4']
      }));
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error calling Cohere API:', error);
    // Fall back to mock data if API fails
    return getMockFlashcards({ topic: 'default', count: 5 });
  }
}

// Mock data for development
function getMockFlashcards(params: AIGenerationParams): AIGeneratedCard[] {
  const { topic, count } = params;
  
  const mockCards: AIGeneratedCard[] = [];
  
  const topics: Record<string, AIGeneratedCard[]> = {
    'javascript': [
      { 
        question: 'What is a closure in JavaScript?', 
        answer: "A function that retains access to its lexical scope even when executed outside that scope.",
        hint: 'Think function + scope retention',
        options: [
          "A function that retains access to its lexical scope even when executed outside that scope.",
          "A way to close browser windows using JavaScript",
          "A method to terminate event propagation",
          "A design pattern for hiding implementation details"
        ]
      },
      { 
        question: 'Which operator performs type coercion in JavaScript?', 
        answer: '== (loose equality)',
        hint: "Double equals, not triple",
        options: [
          "== (loose equality)",
          "=== (strict equality)",
          "= (assignment)",
          "=> (arrow function)"
        ]
      },
      { 
        question: 'How do you stop event bubbling in the DOM?', 
        answer: 'Call event.stopPropagation()',
        hint: 'Think about stopping the upward flow',
        options: [
          "Call event.stopPropagation()",
          "Return false from the event handler",
          "Use event.preventDefault()",
          "Set event.bubbles = false"
        ]
      },
      { 
        question: 'Which statement about Promises is FALSE?', 
        answer: 'Promises can be canceled once initiated',
        hint: 'Consider the immutable nature of Promises',
        options: [
          "Promises can be canceled once initiated",
          "Promises represent asynchronous operations",
          "Promises can be chained with .then()",
          "Promises have three states: pending, fulfilled, rejected"
        ]
      },
      { 
        question: 'In arrow functions, "this" is determined by:', 
        answer: 'The surrounding lexical context where the function is defined',
        hint: 'Location matters, not invocation',
        options: [
          "The surrounding lexical context where the function is defined",
          "The object that calls the function",
          "The global window object",
          "The first parameter passed to the function"
        ]
      },
    ],
    'react': [
      { 
        question: 'JSX in React is:', 
        answer: 'A syntax extension that allows writing HTML-like code in JavaScript',
        hint: 'HTML + JS = ?',
        options: [
          "A syntax extension that allows writing HTML-like code in JavaScript",
          "A new programming language created by Facebook",
          "JavaScript XML library",
          "A browser-specific JavaScript implementation"
        ]
      },
      { 
        question: 'How does React\'s virtual DOM improve performance?', 
        answer: 'By batching DOM updates and minimizing direct manipulations',
        hint: 'Think batch processing vs. immediate changes',
        options: [
          "By batching DOM updates and minimizing direct manipulations",
          "By using WebAssembly for all DOM operations",
          "By bypassing the browser's rendering engine",
          "By caching all webpage elements permanently"
        ]
      },
      { 
        question: 'Which hook is NOT a built-in React hook?', 
        answer: 'useDatabase',
        hint: 'Consider data storage and retrieval',
        options: [
          "useDatabase",
          "useState",
          "useEffect",
          "useContext"
        ]
      },
      { 
        question: 'In React forms, controlled components:',
        answer: 'Have their values controlled by React state',
        hint: 'State drives the input, not vice versa',
        options: [
          "Have their values controlled by React state",
          "Cannot be modified by users",
          "Don't require event handlers",
          "Are automatically validated by React"
        ]
      },
      { 
        question: 'The useCallback hook is primarily used to:', 
        answer: 'Memoize functions to prevent unnecessary re-renders',
        hint: 'Performance optimization for function references',
        options: [
          "Memoize functions to prevent unnecessary re-renders",
          "Create callback URLs for navigation",
          "Handle form submissions",
          "Manage asynchronous API calls"
        ]
      },
    ],
    'default': [
      { 
        question: `What is the primary focus of ${topic}?`, 
        answer: `The systematic study and application of ${topic}-specific principles and methodologies.`,
        hint: 'Core purpose and scope',
        options: [
          `The systematic study and application of ${topic}-specific principles and methodologies.`,
          `The historical development of theories related to ${topic}.`,
          `The commercial exploitation of ${topic}-related technologies.`,
          `The philosophical implications of ${topic} in modern society.`
        ]
      },
      { 
        question: `Which era marked the modern development of ${topic}?`, 
        answer: `The Information Age (late 20th century)`,
        hint: 'Recent technological revolution',
        options: [
          "The Information Age (late 20th century)",
          "The Industrial Revolution (18th-19th century)",
          "The Renaissance (14th-17th century)",
          "The Digital Revolution (21st century)"
        ]
      },
      { 
        question: `Which methodology is NOT typically associated with ${topic}?`, 
        answer: `Retroactive inference modeling`,
        hint: 'Look for the fabricated term',
        options: [
          "Retroactive inference modeling",
          "Quantitative analysis",
          "Qualitative assessment",
          "Comparative evaluation"
        ]
      },
      { 
        question: `In professional settings, ${topic} is most valuable for:`, 
        answer: `Solving complex problems through systematic approaches`,
        hint: 'Think practical application value',
        options: [
          "Solving complex problems through systematic approaches",
          "Creating entertaining content for social media",
          "Reducing operational costs in all scenarios",
          "Replacing human decision-making entirely"
        ]
      },
      { 
        question: `The biggest challenge facing ${topic} today is:`, 
        answer: `Integration with rapidly evolving technologies`,
        hint: 'Keeping pace with change',
        options: [
          "Integration with rapidly evolving technologies",
          "Declining public interest",
          "Excessive government regulation",
          "Lack of historical precedent"
        ]
      },
    ]
  };
  
  // Choose the appropriate topic set or default
  const cardSet = topics[topic.toLowerCase()] || topics.default;
  
  // Return the requested number of cards (cycle through if more requested than available)
  for (let i = 0; i < count; i++) {
    mockCards.push(cardSet[i % cardSet.length]);
  }
  
  return mockCards;
} 