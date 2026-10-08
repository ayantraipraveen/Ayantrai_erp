export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors?: any[];
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors?: any[],
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

  static badRequest(message: string = 'Bad Request', errors?: any[]): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = 'Unauthorized: Access token is missing or invalid'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden: You do not have permission to access this resource'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Resource Not Found'): ApiError {
    return new ApiError(404, message);
  }

  static methodNotAllowed(
    message: string = 'Method Not Allowed',
    allowedMethods?: string[]
  ): ApiError {
    const detail =
      allowedMethods && allowedMethods.length > 0
        ? `${message}. Allowed methods: ${allowedMethods.join(', ')}`
        : message;
    return new ApiError(405, detail);
  }

  static conflict(message: string = 'Conflict: Resource already exists'): ApiError {
    return new ApiError(409, message);
  }

  static unprocessable(message: string = 'Unprocessable Entity', errors?: any[]): ApiError {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message: string = 'Too Many Requests'): ApiError {
    return new ApiError(429, message);
  }

  static internal(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(500, message);
  }
}

export default ApiError;
