import { invariant } from "#/helpers/invariant";
import { DATABASES } from "#/shared/constants/databases";
import { cli, modes } from "@repo/shared/lib/cli"

const { args } = cli([
  {
    key: "target",
    value: "Database",
    short: "database",
    av: Object.entries(DATABASES).map((([key, _]) => key))
  },
  {
    key: "mode",
    value: "Environment",
    short: "env",
    av: modes
  }
])

const port = args["port"] ? Number(args["port"]) : 5000;

const db = args["target"] as string;
invariant(db, 'Database must be selected in 3 arg')

let mode = args["mode"] as string;

if (!modes.includes(mode)) {
  console.warn(`Mode not found. Fallback to dev`)
  mode = "dev";
}

const ENV_FILES: Record<string, string[]> = {
  "dev": ["--env-file=.env.development", "--env-file=.env"],
  "prod": ["--env-file=.env.production", "--env-file=.env"]
}

const cmd = [
  "bun",
  "run",
  ...ENV_FILES[mode],
  "drizzle-kit",
  "studio",
  "--verbose",
  "--port",
  `${port}`,
]

const s = Bun.spawn({
  cmd,
  stdout: "inherit",
  stderr: "inherit",
  env: { target: db }
})

await s.exited