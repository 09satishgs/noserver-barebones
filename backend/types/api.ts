// REST-like API Request & Response Contracts

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequest<TBody = any, TQuery = Record<string, string | number | boolean | undefined>> {
  method: HttpMethod;
  path: string;
  params?: Record<string, string>;
  query?: TQuery;
  body?: TBody;
}

export interface ApiResponse<TData = any> {
  status: number;
  data?: TData;
  error?: string;
  message?: string;
}

// Worker RPC Message Envelope
export interface WorkerRpcRequest<TBody = any, TQuery = any> {
  id: string; // Correlation ID for async response
  type: 'API_REQUEST';
  payload: ApiRequest<TBody, TQuery>;
}

export interface WorkerRpcResponse<TData = any> {
  id: string;
  type: 'API_RESPONSE';
  payload: ApiResponse<TData>;
}

export interface WorkerEventMessage<TEventData = any> {
  type: 'EVENT';
  event:
    | 'DB_INIT_START'
    | 'DB_DOWNLOADING'
    | 'DB_EXTRACTING'
    | 'DB_READY'
    | 'DB_ERROR'
    | 'DB_SYNCED'
    | 'DB_NO_REMOTE_URL';
  data?: TEventData;
}

export type WorkerToMainMessage = WorkerRpcResponse | WorkerEventMessage;
export type MainToWorkerMessage = WorkerRpcRequest;
