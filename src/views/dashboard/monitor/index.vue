<template>
  <div class="container">
    <Breadcrumb :items="['menu.monitor.system']" />
    <a-row :gutter="16">
      <!-- 系统指标卡片 -->
      <a-col v-for="metric in systemMetricsData" :key="metric.title" :span="8">
        <a-card class="metric-card" :loading="loading">
          <a-statistic
            :title="t(metric.title)"
            :value="metric.value"
            :precision="2"
            :suffix="'%'"
            :value-style="{ color: getValueColor(metric.value) }"
          >
            <template #prefix>
              <component :is="metric.icon" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <!-- 内存使用图表 -->
      <a-col :span="12">
        <a-card class="chart-card" :title="t('monitor.memory.title')">
          <Chart :loading="loading" :option="memoryChartOption" style="height: 350px" />
        </a-card>
      </a-col>
      <!-- GC信息图表 -->
      <a-col :span="12">
        <a-card class="chart-card" :title="t('monitor.gc.title')">
          <Chart :loading="loading" :option="gcChartOption" style="height: 350px" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <!-- 运行时指标表格 -->
      <a-col :span="24">
        <a-card :title="t('monitor.runtime.title')">
          <a-descriptions :column="3" :data="runtimeMetricsData" layout="vertical" bordered />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import useLoading from '@/hooks/loading';
import { monitorApi } from '@/api/support/monitor';
import type { SystemMetrics, RuntimeMetrics } from '@/types/api/support/monitor';
import { IconStorage, IconBytedanceColor, IconLarkColor } from '@arco-design/web-vue/es/icon';
import type { ECOption } from '@/types/echarts';
import formatBytes from '@/utils/format';

const { t } = useI18n();
const { loading, setLoading } = useLoading();
const systemMetrics = ref<SystemMetrics | null>(null);
const runtimeMetrics = ref<RuntimeMetrics | null>(null);
let timer: number;

// 系统指标卡片数据
const systemMetricsData = computed(() => [
  {
    title: 'monitor.cpu.usage',
    value: systemMetrics.value?.cpu_usage || 0,
    icon: IconBytedanceColor
  },
  {
    title: 'monitor.memory.usage',
    value: systemMetrics.value?.memory_usage || 0,
    icon: IconLarkColor
  },
  {
    title: 'monitor.disk.usage',
    value: systemMetrics.value?.disk_usage || 0,
    icon: IconStorage
  }
]);

// 运行时指标数据
const runtimeMetricsData = computed(() => {
  if (!runtimeMetrics.value) return [];
  const runtime = runtimeMetrics.value;
  return [
    {
      label: t('monitor.runtime.goroutines'),
      value: runtime.goroutines
    },
    {
      label: t('monitor.runtime.heapAlloc'),
      value: formatBytes(runtime.heap_alloc)
    },
    {
      label: t('monitor.runtime.heapSys'),
      value: formatBytes(runtime.heap_sys)
    },
    {
      label: t('monitor.runtime.heapObjects'),
      value: runtime.heap_objects.toLocaleString()
    },
    {
      label: t('monitor.runtime.gcPauseNs'),
      value: `${(runtime.gc_pause_ns / 1000000).toFixed(2)}ms`
    },
    {
      label: t('monitor.runtime.numGC'),
      value: runtime.num_gc
    }
  ];
});

// 内存使用图表配置
const memoryChartOption = computed<ECOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center'
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      data: [
        {
          name: t('monitor.memory.heap'),
          value: runtimeMetrics.value?.heap_alloc || 0
        },
        {
          name: t('monitor.memory.stack'),
          value: runtimeMetrics.value?.stack_in_use || 0
        },
        {
          name: t('monitor.memory.mspan'),
          value: runtimeMetrics.value?.mspan_in_use || 0
        },
        {
          name: t('monitor.memory.mcache'),
          value: runtimeMetrics.value?.mcache_in_use || 0
        }
      ]
    }
  ]
}));

// GC信息图表配置
const gcChartOption = computed<ECOption>(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['GC CPU占用']
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}%'
    }
  },
  series: [
    {
      data: [
        {
          value: (runtimeMetrics.value?.gc_cpu_fraction || 0) * 100,
          itemStyle: {
            color: '#165DFF'
          }
        }
      ],
      type: 'bar'
    }
  ]
}));

// 获取指标数据
const fetchMetrics = async () => {
  setLoading(true);
  try {
    const [systemData, runtimeData] = await Promise.all([
      monitorApi.getSystemMetrics(),
      monitorApi.getRuntimeMetrics()
    ]);
    systemMetrics.value = systemData;
    runtimeMetrics.value = runtimeData;
  } catch (err) {
    // handle error
  } finally {
    setLoading(false);
  }
};

// 根据数值获取颜色
const getValueColor = (value: number) => {
  if (value >= 90) return '#F53F3F';
  if (value >= 80) return '#FF7D00';
  if (value >= 70) return '#FFAA33';
  return '#00B42A';
};

// 定时刷新数据
onMounted(() => {
  fetchMetrics();
  timer = window.setInterval(fetchMetrics, 30000); // 每30秒刷新一次
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px;
}

.metric-card {
  margin-bottom: 16px;
}

.chart-card {
  height: 400px;
}

:deep(.arco-statistic) {
  text-align: center;

  &-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  &-value {
    font-size: 24px;
  }
}
</style>
