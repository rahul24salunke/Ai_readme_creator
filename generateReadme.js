import fs from "fs";
import path from "path";
import { readProjectFiles } from "./fileReader.js";
import { chunkFiles } from "./chunker.js";
import {
  summarizeChunk,
  mergeSummaries,
  generateReadmeFromSummary
} from "./openrouter.js";

export async function generateReadme(projectDir) {

  console.log("📂 Reading files...");
  const files = readProjectFiles(projectDir);

  console.log("✂️ Chunking...");
  const chunks = chunkFiles(files);

  console.log(`🧠 Summarizing ${chunks.length} chunks...`);

  const summaries = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Summarizing chunk ${i + 1}/${chunks.length}`);
    const summary = await summarizeChunk(chunks[i]);
    summaries.push(summary);
  }

  console.log("🔗 Merging summaries...");
  const mergedSummary = await mergeSummaries(summaries);

  console.log("🤖 Generating README...");
  const readme = await generateReadmeFromSummary(mergedSummary);

  fs.writeFileSync(
    path.join(projectDir, "README.md"),
    readme,
    "utf-8"
  );

  console.log("✅ README.md generated successfully");
}
