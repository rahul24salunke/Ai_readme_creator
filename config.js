import fs from "fs";
import os from "os";
import path from "path";

/*
  Config file will be stored at:

  Windows:
  C:\Users\username\.aireadme.json

  Mac/Linux:
  /Users/username/.aireadme.json
*/

const CONFIG_PATH = path.join(os.homedir(), ".aireadme.json");

/* =========================================================
   SAVE CONFIG
========================================================= */

export function saveConfig(data) {
  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

/* =========================================================
   READ CONFIG
========================================================= */

export function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return null;

  try {
    return JSON.parse(
      fs.readFileSync(CONFIG_PATH, "utf-8")
    );
  } catch (err) {
    console.error("Config file corrupted. Resetting...");
    fs.unlinkSync(CONFIG_PATH);
    return null;
  }
}

/* =========================================================
   DELETE CONFIG
========================================================= */

export function deleteConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    fs.unlinkSync(CONFIG_PATH);
  }
}

/* =========================================================
   GET API KEY
========================================================= */

export function getApiKey() {
  // Priority 1 → Environment variable
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_API_KEY;
  }

  // Priority 2 → Local config file
  const config = readConfig();
  return config?.OPENROUTER_API_KEY || null;
}

/* =========================================================
   SET API KEY
========================================================= */

export function setApiKey(key) {
  if (!key) {
    throw new Error("Invalid API key.");
  }

  saveConfig({
    OPENROUTER_API_KEY: key
  });
}

/* =========================================================
   CHECK CONFIG STATUS
========================================================= */

export function hasApiKey() {
  return !!getApiKey();
}
