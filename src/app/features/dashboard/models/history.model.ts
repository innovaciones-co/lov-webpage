export type HistoryEventType = 'DATA' | 'CALL' | 'SMS' | string;

export interface HistoryItem {
    date: string;
    type: HistoryEventType;
    detail: string;
    amount: number;
    measure: string;
}