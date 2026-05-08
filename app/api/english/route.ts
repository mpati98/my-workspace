import { InferenceClient } from "@huggingface/inference";
import { NextResponse } from "next/server";

const hfToken = process.env.HF_TOKEN ?? process.env.HF_HUB_TOKEN;
const hf = hfToken ? new InferenceClient(hfToken) : null;

type Skill = "listening" | "reading" | "speaking" | "writing";
type Action =
  | "generate_exercise"   // generate a new exercise for a skill
  | "evaluate_answer"     // evaluate learner's answer
  | "recommend"           // recommend practice methods
  | "chat";               // free mentor conversation

const LEVEL_CONTEXT: Record<string, string> = {
  beginner:     "The learner is a complete beginner. Use simple vocabulary (A1-A2 CEFR). Short sentences, everyday topics.",
  elementary:   "The learner is at elementary level (A2-B1 CEFR). Simple but varied sentence structures.",
  intermediate: "The learner is intermediate (B1-B2 CEFR). Varied topics, idioms, moderate complexity.",
  advanced:     "The learner is advanced (C1-C2 CEFR). Complex texts, nuanced language, academic vocabulary.",
};

const SKILL_PERSONA: Record<Skill, string> = {
  listening: `You are a listening comprehension coach. You create audio-style transcripts and listening exercises, then evaluate how well learners understood the content. Be encouraging and explain difficult words in context.`,
  reading:   `You are a reading comprehension coach. You provide passages of appropriate length and complexity, then ask comprehension, vocabulary, and inference questions. Give detailed feedback on answers.`,
  speaking:  `You are a speaking and pronunciation coach. You give speaking prompts, evaluate written representations of what learners would say (grammar, vocabulary, fluency, coherence), and suggest how to improve spoken delivery.`,
  writing:   `You are a writing coach. You assign writing tasks, then provide detailed corrections on grammar, vocabulary, style, coherence, and structure. Always show a corrected version alongside your feedback.`,
};

const EXERCISE_PROMPTS: Record<Skill, string> = {
  listening: `Create a realistic listening exercise. Randomly choose ONE format:
- A podcast excerpt (2 speakers discussing a topic)
- A short news report (journalist reporting)
- A job interview or workplace conversation
- A travel/tourist scenario
- A documentary narration snippet

Format your response exactly like this:

FORMAT: [Podcast/News/Interview/Travel/Documentary]
TOPIC: [Brief topic description]

TRANSCRIPT:
[Write 120-180 words of natural spoken English. Use contractions, hesitations like "well", "you know", "actually". Make it sound authentic and conversational.]

QUESTIONS:
1. [Main idea question]
2. [Specific detail question]
3. [Inference or opinion question]
4. [Vocabulary-in-context question: "What does the speaker mean by '___'?"]

VOCABULARY FOCUS:
[List 3 words/phrases from the transcript worth learning, with brief meanings]

ANSWER KEY (do NOT show to learner — only use when evaluating):
1. [Answer]
2. [Answer]
3. [Answer]
4. [Answer]`,

  reading: `Create a reading exercise. Write a passage followed by 4-5 questions testing comprehension, vocabulary, and inference. Format:

PASSAGE:
[Write passage — 150-250 words]

QUESTIONS:
1. [Comprehension question]
2. [Vocabulary question — "What does the word '___' mean in context?"]
3. [Inference question]
4. [Main idea question]
5. [Optional: Opinion question]`,

  speaking: `Create a speaking exercise. Give a prompt that requires the learner to respond verbally. Include:

SPEAKING PROMPT:
[The topic/situation to speak about]

TIPS:
• [Useful vocabulary or phrases]
• [Structure suggestion]
• [What makes a good response]

Note: The learner will TYPE what they would say aloud. Evaluate their response as if it were spoken.`,

  writing: `Create a writing exercise. Give a clear writing task with:

WRITING TASK:
[The writing assignment — email, essay paragraph, story, opinion piece, etc.]

REQUIREMENTS:
• [Length guideline]
• [Key elements to include]
• [Grammar focus: e.g., use past perfect, conditional sentences, etc.]`,
};

async function callHuggingFace(systemPrompt: string, messages: any[]): Promise<string> {
  if (!hf) {
    throw new Error("Hugging Face API token not found. Please set HF_HUB_TOKEN in your environment variables.");
  }

  // Build messages array (OpenAI-compatible format)
  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const response = await hf.chatCompletion({
    model: "google/gemma-4-31B-it",
    messages: chatMessages,
    max_tokens: 1000,
  });

  const reply = response?.choices?.[0]?.message?.content;
  if (!reply || typeof reply !== "string") {
    throw new Error("No reply returned from model");
  }

  return reply;
}

export async function GET() {
  return NextResponse.json({
    HF_CLIENT_READY: !!hf,
    HF_TOKEN_EXISTS: !!hfToken,
    HF_TOKEN_PREFIX: hfToken?.substring(0, 10),
    NODE_ENV: process.env.NODE_ENV
  });
}

export async function POST(req: Request) {
  const { skill, action, level = "intermediate", userMessage, history = [], exerciseContext } = await req.json();

  if (!skill || !action) return NextResponse.json({ error: "Missing skill or action" }, { status: 400 });

  const levelCtx = LEVEL_CONTEXT[level] ?? LEVEL_CONTEXT.intermediate;

  // ── Build system prompt ────────────────────────────
  let systemPrompt = `You are an expert English language mentor with 15 years of teaching experience, specializing in ${skill} skills.

${SKILL_PERSONA[skill as Skill]}

${levelCtx}

TEACHING PHILOSOPHY:
- Always be encouraging and supportive, never discouraging
- Explain WHY something is correct or incorrect, not just what
- Give specific, actionable feedback
- Celebrate progress and effort
- Use examples to illustrate corrections
- When correcting, always acknowledge what the learner did well first

Your responses should be clear, structured, and motivating.`;

  // ── Build messages ─────────────────────────────────
  let messages: any[] = [];

  if (action === "generate_exercise") {
    messages = [{
      role: "user",
      content: `Generate a ${level} level ${skill} exercise. ${EXERCISE_PROMPTS[skill as Skill]}\n\nMake it engaging and relevant to everyday life or professional contexts.`,
    }];

  } else if (action === "evaluate_answer") {
    const evalPrompt: Record<Skill, string> = {
      listening: `Evaluate this learner's answers to the listening comprehension exercise.\n\nExercise:\n${exerciseContext}\n\nLearner's answers:\n${userMessage}\n\nProvide:\n1. Score (X/4 or X/5 questions correct)\n2. Question-by-question feedback\n3. Vocabulary/language notes from the transcript\n4. What they did well\n5. One specific practice recommendation`,
      reading:   `Evaluate this learner's answers to the reading exercise.\n\nExercise:\n${exerciseContext}\n\nLearner's answers:\n${userMessage}\n\nProvide:\n1. Score and which answers were correct/incorrect\n2. Explanation for any wrong answers\n3. Vocabulary insights\n4. Reading strategy tips based on their performance`,
      speaking:  `Evaluate this learner's spoken response (typed representation).\n\nSpeaking prompt:\n${exerciseContext}\n\nLearner's response:\n${userMessage}\n\nEvaluate on:\n1. Content & Relevance (Did they address the prompt?)\n2. Grammar (note specific errors and corrections)\n3. Vocabulary (suggest better word choices)\n4. Coherence & Structure (was it well-organized?)\n5. Overall band score (1-9 IELTS-style)\n6. Improved version of their response\n7. Two specific things to practice`,
      writing:   `Evaluate this learner's writing submission.\n\nTask:\n${exerciseContext}\n\nLearner's writing:\n${userMessage}\n\nProvide detailed feedback on:\n1. Task Achievement (did they complete the task?)\n2. Grammar & Accuracy (list specific errors with corrections)\n3. Vocabulary (highlight strong choices, suggest improvements)\n4. Coherence & Cohesion (paragraph structure, linking words)\n5. Style & Tone (appropriate for the task?)\n6. Band Score estimate\n7. Fully corrected version of their text\n8. Top 3 things to work on`,
    };
    messages = [{ role: "user", content: evalPrompt[skill as Skill] }];

  } else if (action === "recommend") {
    messages = [{
      role: "user",
      content: `Give me a personalized ${skill} practice plan for a ${level} English learner. Include:\n\n1. DAILY PRACTICE ROUTINE (15-30 min exercises)\n2. TOP 5 RESOURCES (apps, websites, books, podcasts, YouTube channels) — be specific with names\n3. COMMON MISTAKES to avoid at this level\n4. MILESTONE GOALS for the next 30 days\n5. ONE POWERFUL TECHNIQUE that professional language teachers use for ${skill}`,
    }];

  } else if (action === "chat") {
    // Free conversation with the mentor
    messages = [
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ];
  }

  try {
    const response = await callHuggingFace(systemPrompt, messages);
    return NextResponse.json({ response, skill, action, level });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
