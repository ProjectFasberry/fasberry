import { DATABASES } from "#/shared/constants/databases";

function parseArgv(argv: string[] = process.argv.slice(2)) {
  return argv.reduce<Record<string, string | boolean>>((acc, arg) => {
    if (!arg.startsWith("--")) return acc;
    const [key, rawValue] = arg.slice(2).split("=");
    if (rawValue === "") return acc; 
    acc[key] = rawValue !== undefined ? rawValue : true; 
    return acc;
  }, {});
}

const args = parseArgv(process.argv)

function print() {
  console.log(`
Usage: bun run studio.ts --target=<database> --mode=<mode> [options]

Options:
  --target     Database to use. Available values: ${Object.entries(DATABASES).map((([key, _]) => key)).join(", ")}
  --mode       Environment mode. Available values: production, development. Default: development
  --help       Show this help message
`);
}

if (Object.keys(args).length === 0) {
  print()
  process.exit(0);
}

if (args.help) {
  print()
  process.exit(0);
}

const modes = ["production", "development"] as const;
const port = args["port"] ? Number(args["port"]) : 5000;

let database = args["target"]?.toString() 
if (!database) throw new Error('Database must be selected in 3 arg')

let mode = args["mode"] as typeof modes[number];

if (!modes.includes(mode)) {
  console.warn(`Mode "${mode}" is not defined. Fallback to development`)
  mode = "development";
}

const envFiles = mode === "production"
  ? ["--env-file=.env.production", "--env-file=.env"]
  : ["--env-file=.env.development", "--env-file=.env"];

const s = Bun.spawn([
  "bun",
  "run",
  ...envFiles,
  "drizzle-kit",
  "studio",
  "--verbose",
  "--port",
  `${port}`,
], {
  stdout: "inherit",
  stderr: "inherit",
  env: {
    target: database
  }
})

await s.exited