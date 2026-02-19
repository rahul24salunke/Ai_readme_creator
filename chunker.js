const MAX_CHUNK_SIZE = 3000; // smaller = safer

export function chunkFiles(files) {
  const chunks = [];
  let current = "";

  for (const file of files) {
    const text = `FILE: ${file.path}\n${file.content}\n\n`;

    if (text.length > MAX_CHUNK_SIZE) {
      // If single file is too large, split it
      for (let i = 0; i < text.length; i += MAX_CHUNK_SIZE) {
        chunks.push(text.slice(i, i + MAX_CHUNK_SIZE));
      }
      continue;
    }

    if (current.length + text.length > MAX_CHUNK_SIZE) {
      chunks.push(current);
      current = "";
    }

    current += text;
  }

  if (current) chunks.push(current);

  return chunks;
}
