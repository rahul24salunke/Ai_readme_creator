# aireadme

## Description
`aireadme` is a Node‑JS command‑line utility that automatically generates a production‑ready `README.md` for JavaScript or TypeScript projects. By analysing the source files, chunking the content to respect LLM size limits, and orchestrating a series of summarisation steps through the OpenRouter API, the tool produces a comprehensive, well‑structured README without manual effort.

## Features
- **Automatic file discovery** – Recursively walks the project tree while ignoring common noise directories and file types.  
- **Chunking for LLM safety** – Splits source content into configurable text blocks (default ≤ 3000 characters) to stay within model limits.  
- **AI‑driven pipeline** – Summarises each chunk, merges summaries into a project overview, and generates the final markdown using OpenRouter’s `openai/gpt-oss-120b` model.  
- **Configuration management** – Stores the OpenRouter API key in `~/.aireadme.json` with a fallback to the `OPENROUTER_API_KEY` environment variable.  
- **CLI commands** – `generate` to create the README, `config` to manage the API key, and diagnostic helpers.  
- **Progress logging** – Clear console output for long‑running operations and user‑friendly error handling.  

## Tech Stack
| Category | Technology |
|----------|------------|
| Runtime | Node.js (ESM, `"type": "module"`), shebang for direct execution |
| CLI parsing | `yargs` |
| HTTP client | `axios` |
| AI service | OpenRouter (`https://openrouter.ai/api/v1/chat/completions`) |
| File system | Node core modules `fs`, `path`, `os` |
| Packaging | npm (binary entry point `bin: { "aireadme": "./src/index.js" }`) |

## Installation
```bash
# Install globally
npm install -g aireadme

# Or install locally in a project
npm install --save-dev aireadme
```

## Usage
### 1. Configure the OpenRouter API key (once)
```bash
# Store the key in the user config file
aireadme config set-key <YOUR_OPENROUTER_API_KEY>

# Verify configuration
aireadme config doctor
```

### 2. Generate a README for the current project
```bash
# Run from the root of the target repository
aireadme generate
```
The command will:
1. Verify that an API key is available.  
2. Discover source files under the current directory.  
3. Create size‑limited text chunks.  
4. Summarise each chunk, merge the summaries, and produce the final `README.md`.  
5. Prompt before overwriting an existing `README.md` and write the result to the project root.

### 3. Additional configuration commands
| Command | Description |
|---------|-------------|
| `aireadme config set-key <value>` | Save a new API key. |
| `aireadme config delete` | Remove the stored configuration file. |
| `aireadme config doctor` | Show whether a key is present and display a short preview of the configuration. |

## API Endpoints
`aireadme` does not expose its own HTTP API. All external calls are made internally to the OpenRouter chat‑completion endpoint.

## Project Structure
```
aireadme/
├─ src/
│  ├─ commands/
│  │  ├─ generate.js      # implementation of the `generate` command
│  │  └─ config.js        # implementation of the `config` sub‑commands
│  ├─ config.js           # read/write of ~/.aireadme.json and API‑key helpers
│  ├─ fileReader.js       # recursive project file discovery
│  ├─ chunker.js          # creation of LLM‑safe text chunks
│  ├─ openrouter.js       # low‑level wrapper around OpenRouter API
│  ├─ generateReadme.js   # orchestration of summarisation → merge → final README
│  └─ index.js            # CLI entry point (yargs registration)
├─ package.json
├─ README.md               # this file
└─ .gitignore
```

## How It Works
1. **Configuration Check** – `config.hasApiKey()` ensures an OpenRouter key is available.  
2. **File Discovery** – `readProjectFiles(baseDir)` walks the directory tree, skips ignored paths (`node_modules`, `.git`, etc.), and returns an array of `{ path, content }`.  
3. **Chunk Creation** – `chunkFiles(files)` builds blocks prefixed with `FILE: <path>` and groups them into strings ≤ 3000 characters. Oversized blocks are split automatically.  
4. **AI Pipeline** (`generateREADMEFromChunks`)  
   - **Summarise** each chunk via `summarizeChunk(chunk)`.  
   - **Merge** all summaries into a single project overview with `mergeSummaries(summaries)`.  
   - **Generate** the final markdown using `generateFinalReadme(overview)`.  
5. **Output** – The resulting markdown is written to `README.md` in the current working directory.  
6. **Error Handling** – All asynchronous steps are wrapped in `try/catch`. Network or validation errors from OpenRouter are logged with the full response payload before being re‑thrown, and the CLI exits with a non‑zero status code.

## Configuration
- **Location**: `~/.aireadme.json` (JSON file with a single `apiKey` property).  
- **Environment fallback**: `OPENROUTER_API_KEY`.  
- **Key management**: Use the `aireadme config` sub‑commands to set, delete, or inspect the stored key.  
- **Chunk size**: Currently fixed at 3000 characters; can be exposed via a future CLI flag or configuration entry.  

## Contributing
Contributions are welcome. Please follow these steps:

1. Fork the repository and create a feature branch.  
2. Ensure code follows the existing ES module style and uses only the declared dependencies (`axios`, `yargs`).  
3. Run the test suite (if added) and linting tools before submitting a pull request.  
4. Provide a clear description of the change and reference any related issues.  

All contributions will be reviewed for correctness, security (especially around API key handling), and adherence to the project's coding standards.

## License
`aireadme` is released under the MIT License. See the `LICENSE` file for full terms.