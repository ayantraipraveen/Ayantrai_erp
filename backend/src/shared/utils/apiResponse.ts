export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}

export class ApiResponse<T = any> {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data: T;
  public meta?: ApiResponseMeta;
  public timestamp: string;

  constructor(
    statusCode: number,
    data: T,
    message: string = 'Success',
    meta?: ApiResponseMeta
  ) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }
}

export default ApiResponse;
