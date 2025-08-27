import { CallbackDataParams } from 'echarts/types/dist/shared';
import type { EChartsOption } from 'echarts';

export interface ToolTipFormatterParams extends CallbackDataParams {
  axisDim: string;
  axisIndex: number;
  axisType: string;
  axisId: string;
  axisValue: string;
  axisValueLabel: string;
}

export type ECOption = EChartsOption;
