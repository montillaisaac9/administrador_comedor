

export interface IErrorResponse {
    statusCode: number
    path: string
    message: string
    timestamp: string
  }
  
  export interface IResponse<T> {
    success: boolean
    data: T | null
    error: IErrorResponse | null
  }
  