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

STRICT RULES:
- Return ONLY markdown.
- No explanations outside README.
- No hallucination.
- Professional tone.
- No emojis.

Structure:

# Project Title
# Description
# Features
# Tech Stack
# Installation
# Usage
# API Endpoints (if applicable)
# Project Structure
# How It Works
# Configuration
# Contributing
# License
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
