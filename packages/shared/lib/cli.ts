import path from "path";
import { readFileSync } from "fs";

export const modes = ["prod", "dev"]

export function cli(input: { key: string; short: string; value: string; av: string[]; opt?: boolean }[]) {
  function parseArgv(argv: string[] = process.argv.slice(2)) {
    return argv.reduce<Record<string, string | boolean>>((acc, arg) => {
      if (!arg.startsWith("--")) return acc;
      const i = arg.indexOf("=");
      if (i === -1) {
        const key = arg.slice(2);
        acc[key] = true;
        return acc;
      }
      const key = arg.slice(2, i);
      const val = arg.slice(i + 1);
      if (val === "") return acc;
      acc[key] = val;
      return acc;
    }, {});
  }

  const args = parseArgv(process.argv);

  function generatePrintMsg(): string {
    const desc = input
      .map(d => `--${d.key}    ${d.value}. Available: ${d.av.join(", ")}`)
      .join("\n");

    const usage = input
      .filter(d => !d.opt)
      .map(d => `--${d.key}=<${d.short}>`)
      .join(", ");

    return `Usage: ${usage}

Options:
${desc}
`;
  }

  const printMessage = generatePrintMsg();
  const print = () => console.log(printMessage);

  if (!Object.keys(args).length || args.help) {
    print();
    process.exit(0);
  }

  return { args };
}

export function loadEnv(filePath: string) {
  const data = readFileSync(path.resolve(filePath), "utf-8");
  for (const line of data.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    const val = trimmed.slice(i + 1).trim();
    process.env[key] = val;
  }
}