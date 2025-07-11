import HeatMap from "@uiw/react-heat-map";
import { clientOnly } from "vike-react/clientOnly";
import { value } from "../models/heatmap-stats.model";

const Tooltip = clientOnly(() => import("@uiw/react-tooltip").then(m => m.default))

export const Stats = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <h3 className="font-semibold text-2xl">Статистика</h3>
      <p className="text-lg text-neutral-400">
        Наиграл: <strong>1786.1 ч.</strong>
        Месяц: <strong>0.0 ч.</strong>
        Неделя: <strong>0.0 ч.</strong>
        Сегодня: <strong>0.0 ч.</strong>
      </p>
      <HeatMap
        className="w-full"
        value={value}
        startDate={new Date('2025/01/01')}
        panelColors={{
          0: '#252525',
          7: '#3d3d3d',
          14: '#454545',
          21: '#4f4f4f',
          28: '#5d5d5d',
          35: '#888888'
        }}
        rectProps={{ rx: 4 }}
        weekLabels={false}
        monthLabels={false}
        legendCellSize={0}
        rectSize={16}
        rectRender={(props, data) => {
          // if (!data.count) return <rect {...props} />;

          return (
            <Tooltip placement="top" className="text-lg" content={`${data.count || 0}ч`}>
              <rect {...props} />
            </Tooltip>
          );
        }}
      />
    </div>
  )
}