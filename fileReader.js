import fs from "fs";
import path from "path";

const IGNORE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".env",
  ".env.local",
  ".env.production",
  ".DS_Store",
  "README.md", // avoid reading generated README
  "LICENSE"
];

const IGNORE_EXT = [
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".gif",
  ".lock",
  ".log",
  ".zip",
  ".pdf"
];

const MAX_FILE_SIZE = 200 * 1024; // 200KB

export function readProjectFiles(dir) {
  const filesData = [];

  function traverse(current) {
    const files = fs.readdirSync(current);

    for (const file of files) {
      const fullPath = path.join(current, file);

      if (IGNORE_DIRS.some(d => fullPath.includes(d))) continue;
      if (IGNORE_EXT.some(ext => file.endsWith(ext))) continue;

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else {
        if (stat.size > MAX_FILE_SIZE) continue;

        const content = fs.readFileSync(fullPath, "utf-8");

        filesData.push({
          path: fullPath.replace(dir, ""),
          content
        });
      }
    }
  }

  traverse(dir);
  return filesData;
}
