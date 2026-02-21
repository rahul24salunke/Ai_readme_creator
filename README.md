# aireadme – AI‑assisted README generator (CLI)

**Generate a polished `README.md` from source code automatically.**  

---

## Overview

`aireadme` is a Node‑JS command‑line utility that inspects a project's source files, splits them into size‑limited text chunks, and uses an LLM (via the OpenRouter API) to produce concise summaries. The tool then merges those summaries and generates a production‑ready `README.md`.  

The CLI is intended for developers who need consistent documentation without manual effort, especially for open‑source libraries, internal tools, or any codebase where a quick project overview is valuable. By automating the summarisation and formatting steps, `aireadme` reduces the time spent on documentation while ensuring the output follows a standard structure.  

Configuration is minimal: a JSON file (`~/.aireadme.json`) stores the OpenRouter API key, or the key can be supplied through the `OPENROUTER_API_KEY` environment variable. The modular design (config, file reader, chunker, LLM pipeline) makes the codebase easy to extend or replace components.  

---

## Key Features

- **Automatic source discovery** – Recursively reads project files while respecting ignore rules and size limits.  
- **Chunking logic** – Splits content into ≤ 3000‑character chunks to stay within LLM token limits.  
- **Three‑stage LLM pipeline** – Summarise each chunk, merge summaries, and generate a final markdown README.  
- **Config management** – Simple JSON config with fallback to environment variable; includes commands to set, delete, and verify the API key.  
- **CLI with `yargs`** – Provides `generate`, `config set-key`, `config delete`, and `config doctor` commands with built‑in help.  
- **Robust error handling** – Detects missing API keys, corrupted config files, I/O errors, and network failures, exiting with clear messages.  

---

## Tech Stack

- **Runtime**: Node.js (ESM)  
- **CLI parsing**: `yargs`  
- **HTTP client**: `axios`  
- **File system**: Built‑in `fs`, `path`, `os`  
- **LLM service**: OpenRouter API (`openai/gpt-oss-120b`)  

---

## Architecture

```
CLI (index.js) ──► Config (config.js)
                │
                ├─► File Reader (fileReader.js)
                │
                ├─► Chunker (chunker.js)
                │
                └─► LLM Pipeline (openrouter.js)
                     ├─ summarizeChunk()
                     ├─ mergeSummaries()
                     └─ generateFinalReadme()
```

1. **Config** validates and retrieves the OpenRouter API key.  
2. **File Reader** walks the project directory, filters out large or ignored files, and returns `{path, content}` objects.  
3. **Chunker** groups file contents into chunks ≤ 3000 characters, adding a `FILE: <path>` header to each.  
4. **LLM Pipeline** calls the OpenRouter chat endpoint three times: (a) summarise each chunk, (b) merge summaries, (c) produce the final `README.md`.  
5. **CLI** orchestrates the flow, logs progress, writes the resulting `README.md` to the project root, and handles exit codes.  

---

## Installation & Setup

1. **Clone the repository**  
   ```bash
   git clone https://github.com/yourorg/aireadme.git
   cd aireadme
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Make the CLI globally available (optional)**  
   ```bash
   npm install -g .
   ```

4. **Configure the OpenRouter API key**  
   - Via environment variable:  
     ```bash
     export OPENROUTER_API_KEY=your_key_here
     ```
   - Or store it with the CLI:  
     ```bash
     aireadme config set-key your_key_here
     ```

5. **Run the generator**  
   ```bash
   aireadme generate
   ```

The command creates (or overwrites) `README.md` in the current directory.

---

## Usage

```bash
# Show help for all commands
aireadme --help

# Generate a README for the current project
aireadme generate

# Store a new API key
aireadme config set-key <YOUR_KEY>

# Remove stored configuration
aireadme config delete

# Verify that a key is available and view a short preview
aireadme config doctor
```

The `generate` command performs the full pipeline: validates the API key, reads source files, creates chunks, obtains summaries from the LLM, merges them, and writes the final markdown file. Errors abort the process with a non‑zero exit status and a descriptive message.

---

## Project Structure

```
aireadme/
├─ src/
│  ├─ config.js          # Config file handling
│  ├─ fileReader.js      # Recursive file discovery
│  ├─ chunker.js         # Text chunking logic
│  ├─ openrouter.js      # LLM request wrappers
│  ├─ generateReadme.js  # High‑level pipeline helper
│  └─ index.js           # CLI entry point (yargs commands)
├─ bin/
│  └─ aireadme           # Executable symlink (defined in package.json)
├─ .gitignore
├─ package.json
└─ README.md
```

- **src/** – Core implementation modules.  
- **bin/** – Executable script linked via the `bin` field.  
- **package.json** – Project metadata, dependencies, and CLI entry point.  

---

## API Endpoints

This project does not expose its own HTTP API. All external calls are made to the OpenRouter endpoint:

- `POST https://openrouter.ai/api/v1/chat/completions`

---

## Future Improvements

- Add support for alternative LLM providers (e.g., OpenAI, Anthropic).  
- Allow custom chunk size and token‑limit configuration.  
- Introduce a templating system for README sections (license, contribution guide, etc.).  
- Parallelise chunk summarisation to reduce overall generation time.  
- Provide a test suite with unit and integration tests.  

---

## Contributing

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feat/your-feature`).  
3. Implement changes and ensure existing functionality still works.  
4. Run `npm test` (once tests are added).  
5. Submit a pull request with a clear description of the changes.  

Contributions must adhere to the project's coding style and include appropriate documentation.

---

## License

[MIT License](LICENSE) (or specify the appropriate license).