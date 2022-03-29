export interface BaseUpdate {
    id: number;
    dailyUpdateComment?: {
        message: string;
        url: string;
    }
}