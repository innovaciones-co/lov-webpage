export interface ApiResponse<T> {
    correlationId: string;
    payload: T;
    providerId: number;
    responseCode: number;
    responseDetail: string;
}