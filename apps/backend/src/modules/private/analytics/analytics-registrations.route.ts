import { general } from "#/shared/database/main-db";
import dayjs from "dayjs";
import Elysia from "elysia";
import z from "zod";

const registrationsSchema = z.object({
  type: z.enum(["day", "month", "hour"]).optional().default("month")
})

type RecordItem = {
  id: string;
  created_at: number;
};

type ChartData = {
  label: string;
  registrations: number;
};

function getChartData(
  records: RecordItem[],
  period: 'day' | 'month' | 'hour',
  specificDay?: number, days = 30
): ChartData[] {
  if (!records.length) return [];

  const grouped: Record<string, number> = {};

  records.forEach(r => {
    const dt = dayjs(r.created_at);
    let label: string;

    if (period === 'day') {
      label = dt.format('YYYY-MM-DD');
    } else if (period === 'month') {
      label = dt.format('YYYY-MM');
    } else { 
      if (!specificDay) return;
      const dayStart = dayjs(specificDay).startOf('day');
      if (!dt.isSame(dayStart, 'day')) return;
      label = dt.format('HH:00');
    }

    grouped[label] = (grouped[label] || 0) + 1;
  });

  const result: ChartData[] = [];

  if (period === 'day') {
    const end = dayjs().startOf('day'); 
    const start = end.subtract(days - 1, 'day'); 

    let current = start;

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const label = current.format('YYYY-MM-DD');
      result.push({ label, registrations: grouped[label] || 0 });
      current = current.add(1, 'day');
    }
  } else if (period === 'month') {
    let start = dayjs(Math.min(...records.map(r => r.created_at))).startOf('month');
    const end = dayjs(Math.max(...records.map(r => r.created_at))).startOf('month');

    while (start.isBefore(end) || start.isSame(end, 'month')) {
      const label = start.format('YYYY-MM');
      result.push({ label, registrations: grouped[label] || 0 });
      start = start.add(1, 'month');
    }
  } else { 
    if (!specificDay) throw new Error('For period === hour must be required the specificDay');
    let start = dayjs(specificDay).startOf('day');
    const end = start.endOf('day');

    while (start.isBefore(end) || start.isSame(end, 'hour')) {
      const label = start.format('HH:00');
      result.push({ label, registrations: grouped[label] || 0 });
      start = start.add(1, 'hour');
    }
  }

  return result;
}

export const registrations = new Elysia()
  .get("/registrations", async ({ query, status }) => {
    const type = query.type;

    const base = await general
      .selectFrom("AUTH")
      .select([
        "NICKNAME as id",
        "REGDATE as created_at"
      ])
      .execute()

    const results = base.map((target) => ({
      id: target.id,
      created_at: Number(target.created_at!)
    }))

    if (type !== 'hour') {
      const data = getChartData(results, type);

      return { data }
    }

    if (type === 'hour') {
      const specificDay = 1759702413576
      const data = getChartData(results, 'hour', specificDay);

      return { data }
    }
  }, {
    query: registrationsSchema
  })
