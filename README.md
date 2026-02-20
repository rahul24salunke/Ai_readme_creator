# aireadme – Automated README Generator (CLI)

---

## Description
`aireadme` is a Node.js command‑line tool that automatically creates a production‑ready `README.md` for any project. It scans the project directory, chunks source files into size‑limited pieces, sends each chunk to the OpenRouter LLM for summarisation, merges the summaries, and finally generates a complete markdown README.  

- **Purpose**: Reduce the manual effort of writing comprehensive READMEs.  
- **Target audience**: Developers who want consistent documentation without spending time on formatting.  
- **Problem solved**: Eliminates repetitive, error‑prone README authoring and ensures documentation stays in sync with the codebase.

---

## Features
- Recursive project file discovery with configurable ignore rules.  
- Automatic chunking of files to stay within LLM token limits.  
- Summarisation of each chunk via OpenRouter (model `openai/gpt-oss-120b`).  
- Merging of individual summaries into a single technical overview.  
- Generation of a complete, production‑ready `README.md` in markdown format.  
- Local configuration management for the OpenRouter API key (`~/.aireadme.json`).  
- CLI commands for generation and configuration (`generate`, `config set-key`, `config delete`, `config doctor`).  

---

## Tech Stack
- **Runtime**: Node.js (ESM)  
- **CLI**: `yargs`  
- **HTTP client**: `axios`  
- **File system**: Native `fs`, `path`, `os` modules  
- **LLM provider**: OpenRouter (`openai/gpt-oss-120b`)  
- **Configuration storage**: JSON file in the user’s home directory  

---

## Installation

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Steps
```bash
# Clone the repository
git clone https://github.com/yourusername/aireadme.git
cd aireadme

# Install dependencies
npm install
```

---

## Usage

### Set the OpenRouter API key (once)
```bash
aireadme config set-key YOUR_OPENROUTER_API_KEY
```

### Generate a README for the current project
```bash
aireadme generate
```
The command creates (or overwrites) `README.md` in the current working directory.

### Additional CLI commands
```bash
# Show whether a key is configured
aireadme config doctor

# Remove stored configuration
aireadme config delete
```

---

## Project Structure
```
aireadme/
├─ src/
│  ├─ index.js            # CLI definition (yargs)
│  ├─ fileReader.js       # Recursively reads project files
│  ├─ chunker.js          # Splits files into ≤3000‑char chunks
│  ├─ config.js           # Handles API‑key persistence
│  ├─ openrouter.js       # Wrapper around OpenRouter chat endpoint
│  └─ generateReadme.js   # Orchestrates the generation pipeline
├─ package.json
├─ README.md               # This file
└─ .gitignore
```
- **index.js**: Entry point; parses commands and dispatches actions.  
- **fileReader.js**: Returns an array of `{ path, content }` for all relevant source files.  
- **chunker.js**: Produces LLM‑safe text chunks.  
- **config.js**: Reads/writes `~/.aireadme.json` and falls back to `process.env.OPENROUTER_API_KEY`.  
- **openrouter.js**: Sends prompts for summarisation, merging, and final README generation.  
- **generateReadme.js**: Executes the full pipeline and writes `README.md`.

---

## How It Works
1. **API‑key verification** – `config.hasApiKey()` ensures a key is available.  
2. **File collection** – `readProjectFiles(process.cwd())` gathers all text files ≤ 200 KB, ignoring typical binary or build artifacts.  
3. **Chunking** – `chunkFiles(files)` creates an array of strings, each ≤ 3 000 characters, prefixed with the file path.  
4. **Per‑chunk summarisation** – `summarizeChunk(chunk)` calls OpenRouter to obtain a concise description of the code segment.  
5. **Merging** – `mergeSummaries(summaries)` produces a single technical overview from all chunk summaries.  
6. **README generation** – `generateReadmeFromSummary(merged)` asks the LLM to format the overview into a full markdown README.  
7. **Write output** – The resulting markdown is saved as `README.md` in the project root.

Progress is logged to the console with simple emojis for visual feedback.

---

## Configuration
The tool looks for the OpenRouter API key in two places:

1. Environment variable `OPENROUTER_API_KEY`.  
2. Local JSON file `~/.aireadme.json`:

```json
{
  "OPENROUTER_API_KEY": "your_key_here"
}
```

CLI helpers (`config set-key`, `config delete`, `config doctor`) manage this file.

---

## Contributing
Contributions are welcome. Please follow these steps:

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feature/your-feature`).  
3. Ensure code follows existing style and passes linting (`npm run lint`).  
4. Write or update tests as appropriate.  
5. Submit a pull request with a clear description of changes.

---

## License
This project is licensed under the MIT License.