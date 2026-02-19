#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import path from "path";

import { readProjectFiles } from "./fileReader.js";
import { chunkFiles } from "./chunker.js";
import { generateREADMEFromChunks } from "./openrouter.js";

import {
  setApiKey,
  deleteConfig,
  hasApiKey,
  getApiKey
} from "./config.js";

/* =========================================================
   MAIN CLI
========================================================= */

yargs(hideBin(process.argv))

  /* =============================
     GENERATE COMMAND
  ============================== */
  .command(
    "generate",
    "Generate README.md",
    () => {},
    async () => {
      try {
        if (!hasApiKey()) {
          console.log("❌ API key not configured.");
          console.log("Run: aireadme config set-key <your_key>");
          return;
        }

        const projectDir = process.cwd();

        console.log("📂 Reading files...");
        const files = readProjectFiles(projectDir);

        console.log("✂️ Chunking...");
        const chunks = chunkFiles(files);

        if (!chunks.length) {
          console.log("No files found.");
          return;
        }

        console.log("🤖 Generating README...");
        const readme = await generateREADMEFromChunks(chunks);

        fs.writeFileSync(
          path.join(projectDir, "README.md"),
          readme,
          "utf-8"
        );

        console.log("✅ README.md generated successfully");

      } catch (err) {
        console.error("❌ Error:", err.message);
      }
    }
  )

  /* =============================
     CONFIG COMMAND
  ============================== */
  .command(
    "config <action> [value]",
    "Manage configuration",
    (yargs) => {
      yargs
        .positional("action", {
          describe: "set-key | delete | doctor",
          type: "string"
        })
        .positional("value", {
          describe: "API key value",
          type: "string"
        });
    },
    (argv) => {

      const { action, value } = argv;

      if (action === "set-key") {
        if (!value) {
          console.log("❌ Please provide an API key.");
          return;
        }

        setApiKey(value);
        console.log("✅ API key saved successfully.");
        return;
      }

      if (action === "delete") {
        deleteConfig();
        console.log("🗑 Configuration deleted.");
        return;
      }

      if (action === "doctor") {
        if (hasApiKey()) {
          const key = getApiKey();
          console.log("✅ API key configured.");
          console.log(
            "Key preview:",
            key.substring(0, 10) + "..."
          );
        } else {
          console.log("❌ No API key configured.");
        }
        return;
      }

      console.log("Invalid config command.");
    }
  )

  .demandCommand()
  .help()
  .argv;
