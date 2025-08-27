export interface LoginLogRecord {
  id: number;
  userId: string;
  username: string;
  tenantId: string;
  ip: string;
  location: string;
  device: string;
  os: string;
  browser: string;
  status: number;
  message: string;
  loginTime: number;
}

export interface LogQueryParams {
  current: number;
  pageSize: number;
  username?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}

export interface LogQueryResult {
  list: LoginLogRecord[];
  total: number;
}

export interface OperationLogRecord {
  id: number;
  username: string;
  ip: string;
  method: string;
  path: string;
  query: string;
  body: string;
  userAgent: string;
  status: number;
  error: string;
  duration: number;
  module: string;
  action: string;
  createdAt: number;
}

export interface OperationLogQueryParams {
  current: number;
  pageSize: number;
  username?: string;
  module?: string;
  action?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}

export interface OperationLogQueryResult {
  list: OperationLogRecord[];
  total: number;
}
