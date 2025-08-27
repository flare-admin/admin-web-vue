export interface HttpOption {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, any>;
  body?: Record<string, any>;
  file?: File;
}
