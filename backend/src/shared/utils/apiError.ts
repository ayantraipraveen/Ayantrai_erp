export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: any[];
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors: any[] = [],
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(msg: string, errors: any[] = []): ApiError {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg: string = 'Unauthorized'): ApiError {
    return new ApiError(401, msg);
  }

  static forbidden(msg: string = 'Forbidden'): ApiError {
    return new ApiError(403, msg);
  }

  static notFound(msg: string = 'Resource not found'): ApiError {
    return new ApiError(404, msg);
  }

  static methodNotAllowed(
    msg: string = 'Method not allowed',
    allowedMethods?: string[]
  ): ApiError {
    const detail =
      allowedMethods && allowedMethods.length > 0
        ? `${msg}. Allowed methods: ${allowedMethods.join(', ')}`
        : msg;
    return new ApiError(405, detail);
  }

  static conflict(msg: string = 'Resource conflict'): ApiError {
    return new ApiError(409, msg);
  }

  static tooManyRequests(msg: string = 'Too Many Requests'): ApiError {
    return new ApiError(429, msg);
  }

  static internal(msg: string = 'Internal server error'): ApiError {
    return new ApiError(500, msg);
  }
}

export default ApiError;
