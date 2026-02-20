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

  const SYSTEM_PROMPT = `
You are a senior software engineer and technical writer.
Generate a COMPLETE production-quality README.md.

OUTPUT REQUIREMENTS:

Return ONLY valid markdown.
Do NOT include explanations outside the README.
Do NOT include phrases like "based on the provided code".
Do NOT hallucinate features that do not exist.
Be precise, professional, and structured.
also explain the routes and their purpose if it's a web server project.


README STRUCTURE:
Generate README.md with EXACTLY these sections:

# Project Title
Generate a clear and meaningful project name based on code.

---

# Description
Write a concise and professional description explaining:

- What the project does
- Why it exists
- Who it is for
- What problem it solves

---

# Features
Provide a bullet list of key features.
Focus on actual capabilities visible in code.
---

# Tech Stack

List technologies used, such as:

- Language
- Framework
- Libraries
- Tools
- APIs

---

# Installation
Provide step-by-step installation instructions.

Include:

- prerequisites
- npm install
- environment setup if needed

Example:

\`\`\`bash
npm install
\`\`\`

---

# Usage
Explain how to run and use the project.
Include CLI commands, examples, or code usage if applicable.

Example:

\`\`\`bash
aireadme generate
\`\`\`

---

# Project Structure

Provide a tree view of important folders and files.

Example:

\`\`\`
project/
├── index.js
├── src/
└── package.json
\`\`\`

Explain key files briefly.

---

# How It Works

Explain internal architecture briefly:

- flow
- modules
- AI integration if present
- processing pipeline

---

# Configuration

Explain environment variables if present.

Example:

\`\`\`
OPENROUTER_API_KEY=your_key
\`\`\`

---

# Contributing
Provide standard contributing guidance.

---

# License
If license file or package.json license exists, mention it.
Otherwise write:
This project is licensed under the ISC License.

---

STYLE REQUIREMENTS:

- Professional
- Clean
- Concise
- No emojis
- No fluff
- No repetition
- No marketing language
- Developer-focused

---
IMPORTANT:
You are generating README.md for a real production for current working directory.
Return ONLY markdown.
END OF INSTRUCTIONS.
`;

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
