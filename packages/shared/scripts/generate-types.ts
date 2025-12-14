import { dbs } from "../constants/dbs";
import { cli, loadEnv, modes } from "../lib/cli";

const { args } = cli([
  {
    key: "target",
    value: "Databases",
    short: "database",
    av: Object.entries(dbs).map(([key, _]) => key)
  },
  {
    key: "mode",
    value: "Environment",
    short: "env mode",
    av: ["dev", "prod"],
    opt: true
  }
])

let mode = args["mode"] as string;

if (!modes.includes(mode)) {
  console.warn(`Mode not found. Fallback to dev`)
  mode = "dev";
}

loadEnv(mode === "prod" ? ".env.production" : ".env.development");

const database = args["target"]?.toString()
if (!database) throw new Error('Database must be selected in 3 arg')

const db = dbs[database];
if (!db) throw new Error();

const dbUrl = process.env[db.envVar];
if (!dbUrl) throw new Error(`URL for ${db.envVar} not found in ${mode} env`);

const s = Bun.spawn({
  cmd: [
    "bun",
    "run",
    "kysely-codegen",
    `--dialect=${db.dialect}`,
    `--url=${dbUrl}`,
    `--out-file=${db.out}`
  ],
  stdout: "inherit",
  stderr: "inherit",
})

await s.exited