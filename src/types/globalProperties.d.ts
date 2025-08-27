import { formatTimestamp } from '@/filters/date';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $filters: {
      formatTimestamp: typeof formatTimestamp;
    };
  }
}
