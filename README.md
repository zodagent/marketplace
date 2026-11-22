# Zod marketplace

The list of connectors Zod offers: MCP servers and MCP Apps, with what each one runs, needs and may do. It is one file, [`connectors.json`](connectors.json), read by:

- the **Zod app** (Connectors → Add): it loads this file at start and every few hours, and falls back to the list built into the app when it cannot be reached;
- the **Zod website** (zod.agency, Marketplace page).

Apps such as [Sheets](https://github.com/zodagent/sheets) and [Books](https://github.com/zodagent/books) stay in their own repositories. This repository only lists them and says how to start them.

> A listing is reviewed metadata, not a guarantee and not trusted code. Zod starts a server as its own program and keeps every change behind an Allow / Deny card. Read a server's source before you install it.

## Add a connector

Open a pull request that adds one object to `connectors` in `connectors.json`:

```json
{
  "type": "mcp",
  "id": "my-server",
  "name": "My server",
  "desc": "One sentence about what it does.",
  "cat": "Developer",
  "domain": "example.com",
  "transport": "stdio",
  "command": "npx",
  "args": "-y my-mcp-server",
  "needs": "npx",
  "env": [{ "name": "MY_API_KEY", "hint": "where to get it" }],
  "headers": [],
  "market": {
    "schema": 1, "kind": "mcp", "id": "my-server", "name": "My server",
    "license": "MIT", "maintainer": "Me", "source": "https://github.com/me/my-mcp-server",
    "category": "Developer", "permissions": ["network"], "reviewed": ""
  }
}
```

- `transport` is `stdio` (a program: `command` + `args`), `http` or `sse` (an `https` `url`, plus `headers` for a token).
- `permissions` use the words in the top-level `permissions` map. They describe what the connector asks for; they are not a sandbox.
- Leave `reviewed` empty: it is filled in (with a date) only after a maintainer has read the source and tried it.
- Run `bun scripts/validate.js` before you open the pull request.

## Fields

| Field | Meaning |
|---|---|
| `id`, `name`, `desc`, `cat`, `domain` | what the card shows (`domain` is used for its logo) |
| `popular`, `isNew` | highlights |
| `transport`, `command`, `args`, `url`, `needs` | how Zod starts or reaches it (`needs` is the tool it requires: `npx`, `uvx`, `bun`) |
| `env`, `headers` | secrets it asks for, with a hint where to get them |
| `tools` | the tools it documents: `{ name, description, readOnly }` |
| `app`, `repo`, `private` | an MCP App with its own pages, its repository, and whether that repository is private |
| `market` | reviewed metadata: license, maintainer, source, category, permissions, reviewed date |

Raw file: `https://raw.githubusercontent.com/zodagent/marketplace/main/connectors.json`
