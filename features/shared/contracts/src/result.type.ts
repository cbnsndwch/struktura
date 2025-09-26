export interface ErrorResult {
    success: false;
    data?: never;
    error: string;
}

export interface SuccessResult<T> {
    success: true;
    data: T;
    error?: never;
}

export type Result<T> = SuccessResult<T> | ErrorResult;
