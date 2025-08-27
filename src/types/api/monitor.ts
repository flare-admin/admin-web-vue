export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  created_at: string;
}

export interface RuntimeMetrics {
  goroutines: number;
  heap_alloc: number;
  heap_sys: number;
  heap_objects: number;
  stack_in_use: number;
  stack_sys: number;
  mspan_in_use: number;
  mspan_sys: number;
  mcache_in_use: number;
  mcache_sys: number;
  gc_pause_ns: number;
  last_gc: number;
  num_gc: number;
  gc_cpu_fraction: number;
}

export interface MetricsResponse {
  system: SystemMetrics;
  runtime: RuntimeMetrics;
}
