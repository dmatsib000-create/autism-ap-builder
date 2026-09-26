# Third-party files in .claude/

Cloud sessions (claude.ai/code) do not install plugins, so these plugin files are
copied into the repo to make them available there. On the maintainer's desktop the
original plugins are installed, and these copies are hidden with a local git sparse
checkout (see below) so each command appears only once.

| Copied to | Source | License |
|---|---|---|
| `.claude/commands/feature-dev.md` | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) `plugins/feature-dev/commands/feature-dev.md` | Apache-2.0 |
| `.claude/agents/code-architect.md`, `code-explorer.md`, `code-reviewer.md` | same, `plugins/feature-dev/agents/` | Apache-2.0 |
| `.claude/skills/engineering-code-review/SKILL.md`, `CONNECTORS.md` | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) `engineering/skills/code-review/` and `engineering/CONNECTORS.md` | Apache-2.0 |

Copied 2026-09-26. Full license text: [LICENSE-Apache-2.0.txt](LICENSE-Apache-2.0.txt).

**Changes from the originals:** the code-review skill is renamed `engineering-code-review`
(frontmatter `name`, heading, and usage line) so it does not collide with the built-in
`/code-review`, and its CONNECTORS.md link points at the copy beside it. All other files
are unmodified.

## Hiding the copies on a desktop that has the plugins

Run once per clone, from the repo root, in Git Bash:

```bash
MSYS_NO_PATHCONV=1 git sparse-checkout set --no-cone '/*' '!/.claude/commands/feature-dev.md' '!/.claude/agents/code-architect.md' '!/.claude/agents/code-explorer.md' '!/.claude/agents/code-reviewer.md' '!/.claude/skills/engineering-code-review/'
```

The files stay in git and on GitHub; they are only left off this machine's disk.
Worktrees created afterwards inherit the setting. To edit or refresh the copies, run
`git sparse-checkout disable`, make the change, commit, then run the command above again.
