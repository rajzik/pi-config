# Pi configuration

Shared settings for the [Pi coding agent](https://pi.dev/), including custom model profiles, subagents, retry settings, Context7 MCP, Blackhole compaction, and local request throttling.

## Quick start

Use the Node.js edition of Pi 1.5.2 with Node.js 22.19 or later, plus Git and zsh. Pi installs the packages declared in `settings.json` on first launch. [Pi package documentation](https://docs.pi.dev/latest/packages)

```sh
git clone https://github.com/rajzik/pi-config.git
cd pi-config
cp -n models.example.json models.json
```

1. In `models.json`, set `providers.custom.baseUrl` to the provider URL supplied by your team.
2. Export `PI_TEAM_API_KEY` in the shell that launches Pi. The `apiKey` field reads that environment variable. [Pi models configuration](https://docs.pi.dev/latest/models-configuration)
3. Launch from your project directory with `PI_CODING_AGENT_DIR` set to the absolute path of the clone.

```sh
PI_CODING_AGENT_DIR="/absolute/path/to/pi-config" pi
```

Pi uses the clone for its settings and local session data, so you can keep your usual `~/.pi/agent` setup. Sign in to Context7 separately if you use its MCP tools.

## Local additions

The original setup also uses local copies of TokenEconomizer, an ADHD output extension, and symlinked skills. Install those separately if you use them. The shared profile prompts before trusting a new project.

Keep provider credentials in your environment and endpoint changes in your ignored `models.json`.
