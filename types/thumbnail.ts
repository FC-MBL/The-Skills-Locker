export interface ThumbnailData {
    fullName: string;
    courseName: string;
    branch: string;
    profileImage: string | null; // Base64 or URL
    processedImage: string | null; // Base64 of AI processed image
}

export enum ProcessingStatus {
    IDLE = 'IDLE',
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}
