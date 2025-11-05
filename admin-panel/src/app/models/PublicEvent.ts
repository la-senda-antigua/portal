export interface PublicEvent {
    id?: number;
    title: string;
    startTime: Date;
    endTime?: Date;
    description?: string;
    isCancelled: boolean;
    status: string;
}
