export class Timing {
  private marks = new Map<string, number>();
  private records: string[] = [];

  start(name: string) {
    this.marks.set(name, performance.now());
  }

  end(name: string, desc?: string) {
    const t0 = this.marks.get(name);
    if (t0 === undefined) return;
    const dur = Math.round(performance.now() - t0);
    this.records.push(`${name}${desc ? `;desc="${desc}"` : ""};dur=${dur}`);
    this.marks.delete(name);
  }

  header() {
    return this.records.join(", ").replace(/ /g, ".");
  }
}
