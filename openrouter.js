import axios from "axios";
import { getApiKey } from "./config.js";

const MODEL = "openai/gpt-oss-120b";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

/* ======================================================
   GENERIC AI CALL FUNCTION
====================================================== */

async function callOpenRouter(messages) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("OpenRouter API key not configured.");
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages,
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenRouter returned empty response.");
    }

    return content.trim();

  } catch (error) {
    console.error(
      "OpenRouter error:",
      error?.response?.data || error.message
    );
    throw error;
  }
}

/* ======================================================
   STEP 1 — SUMMARIZE CHUNK
====================================================== */

async function summarizeChunk(chunk) {
  return await callOpenRouter([
    {
      role: "system",
      content: `
You are a senior software engineer.
Summarize this code chunk.

Extract:
- Purpose
- Core modules
- Important logic
- Routes (if present)
- Technologies used

Be concise.
Do not hallucinate.
`
    },
    {
      role: "user",
      content: chunk
    }
  ]);
}

/* ======================================================
   STEP 2 — MERGE SUMMARIES
====================================================== */

async function mergeSummaries(summaries) {
  return await callOpenRouter([
    {
      role: "system",
      content: `
You are a software architect.

Merge these partial project summaries into a single structured technical summary.
Remove repetition.
Be clear and concise.
`
    },
    {
      role: "user",
      content: summaries.join("\n\n")
    }
  ]);
}

/* ======================================================
   STEP 3 — FINAL README GENERATION
====================================================== */

async function generateFinalReadme(summary) {

  const SYSTEM_PROMPT =
`You are a senior software engineer and technical documentation expert.

Your task is to generate a professional, production-ready README.md file in clean Markdown format for a real-world software project.

The README must be structured, concise, and suitable for GitHub. It should avoid fluff, avoid generic AI phrases, and must be tailored to the actual project details provided.

Follow this exact structure:

1. Project Title
   - Clear and professional name
   - One-line impactful tagline

2. Overview
   - 2–4 paragraphs explaining:
     - What the project does
     - The problem it solves
     - Who it is for
     - Why it is valuable

3. Key Features
   - Bullet points
   - Action-driven descriptions
   - Focus on functionality, not marketing language

4. Tech Stack
   - Categorized sections:
     - Frontend
     - Backend
     - Database
     - AI / ML (if applicable)
     - DevOps / Tools
   - Use bullet format

5. Architecture
   - Short explanation of system design
   - Mention APIs, database flow, authentication, AI pipelines, etc.

6. Installation & Setup
   - Step-by-step instructions
   - Include:
     - Clone
     - Install dependencies
     - Environment variables
     - Run commands

7. Usage
   - Explain how to use the application
   - Include example workflows

8. Project Structure
   - Brief explanation of folders
   - Highlight important files
   - use as it is relevant to the actual project

9. API Endpoints (if backend project)
   - Table format:
     | Method | Endpoint | Description |

10. Future Improvements
    - Realistic roadmap items

11. Contributing
    - Simple contribution steps

12. License
    - Placeholder if not specified

Formatting Rules:
- Output must be valid Markdown.
- Use proper heading hierarchy (#, ##, ###).
- Do NOT include emojis unless specified.
- Do NOT include explanations outside the README.
- Do NOT mention that you are an AI.
- Do NOT use generic phrases like "This project aims to revolutionize..."
- Keep tone professional and engineering-focused.
- Keep it concise but complete.

If project information is incomplete:
- Make logical assumptions
- Do not fabricate unrealistic features
- Keep descriptions technically accurate

Generate only the final README.md content.`;

  return await callOpenRouter([
    {
      role: "system",
      content: SYSTEM_PROMPT
    },
    {
      role: "user",
      content: summary
    }
  ]);
}

/* ======================================================
   MAIN EXPORTED FUNCTION
====================================================== */

export async function generateREADMEFromChunks(chunks) {

  const summaries = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`🧠 Summarizing chunk ${i + 1}/${chunks.length}`);
    const summary = await summarizeChunk(chunks[i]);
    summaries.push(summary);
  }

  console.log("🔗 Merging summaries...");
  const mergedSummary = await mergeSummaries(summaries);

  console.log("🤖 Generating final README...");
  const readme = await generateFinalReadme(mergedSummary);

  return readme;
}
