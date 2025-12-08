export interface PublicEvent {
    id?: number;
    title: string;
    startTime: string;
    endTime?: string;
    description?: string;
    isCancelled: boolean;
    status: string;
}
