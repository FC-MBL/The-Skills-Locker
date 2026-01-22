import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Configuration variables - REPLACE WITH YOUR PROJECT CONFIG
// For development, we can use placeholders or environment variables
const firebaseConfig = {
    apiKey: "AIzaSyBWomunDQVqKnP-Y94V2d4IKWpz-6txrhs",
    authDomain: "skills-locker-dev.firebaseapp.com",
    projectId: "skills-locker-dev",
    storageBucket: "skills-locker-dev.firebasestorage.app",
    messagingSenderId: "28939947483",
    appId: "1:28939947483:web:d23c1afca13cad932c2bfe",
    measurementId: "G-T6X52NKW2X"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export interface ScormUploadStatus {
    progress: number;
    downloadUrl?: string;
    storagePath?: string;
    error?: string;
}

/**
 * Uploads a SCORM package (.zip) to Firebase Storage
 * @param file The file to upload
 * @param courseId The associated course ID
 * @param onProgress Callback for upload progress (0-100)
 * @returns Promise resolving to the storage path
 */
export const uploadScormPackage = (
    file: File,
    courseId: string,
    onProgress: (progress: number) => void
): Promise<{ storagePath: string, downloadUrl: string }> => {
    return new Promise((resolve, reject) => {
        // Unique path: scorm-packages/{courseId}/{timestamp}-{filename}
        const timestamp = Date.now();
        const storagePath = `scorm-packages/${courseId}/${timestamp}-${file.name}`;
        const storageRef = ref(storage, storagePath);

        // Upload task
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.error("Upload failed", error);
                reject(error);
            },
            async () => {
                // Upload completed
                try {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({ storagePath, downloadUrl });
                } catch (err) {
                    reject(err);
                }
            }
        );
    });
};

export interface ScormProcessingStatus {
    status: 'QUEUED' | 'PROCESSING' | 'READY' | 'ERROR';
    launchUrl?: string; // Legacy / Fallback
    launchPath?: string;
    error?: string;
    packageId?: string;
    courseStructure?: any[]; // The parsed modules/lessons structure
}

/**
 * Listens to the processing status of a SCORM package in Firestore
 * @param courseId 
 * @param packageId (derived from filename/path usually, or passed back from backend)
 * @param onUpdate Callback with status
 * @returns Unsubscribe function
 */
export const listenToScormStatus = (
    storagePath: string,
    onUpdate: (status: ScormProcessingStatus) => void
) => {
    // We assume the backend writes to a collection 'scorm_statuses' keyed by the storage path (encoded)
    // Or simpler: keyed by a generated ID. For now, let's assume the doc ID is a hash or sanitized version of the storage path.
    // A common pattern is to use the filename or a UUID generated at upload.
    // For simplicity MVP, let's assume the backend writes to `scorm_statuses/{sanitizedPath}`

    const docId = storagePath.replace(/\//g, '_');
    const docRef = doc(db, 'scorm_statuses', docId);

    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            onUpdate(doc.data() as ScormProcessingStatus);
        }
    });
};

/**
 * Exports a course by calling the exportCourse Cloud Function
 * @param courseId The ID of the course to export
 * @param courseData The complete course data (metadata + modules)
 * @returns Promise with download URL
 */
export const exportCourse = async (courseId: string, courseData: any): Promise<string> => {
    const exportCourseFn = httpsCallable(functions, 'exportCourse');
    const result = await exportCourseFn({ courseId, courseData });
    return (result.data as any).downloadUrl;
};

/**
 * Uploads a course import ZIP file
 * @param file The ZIP file containing course.json
 * @param onProgress Progress callback
 * @returns Promise with storage path for status listening
 */
export const uploadCourseImport = (
    file: File,
    onProgress: (progress: number) => void
): Promise<{ storagePath: string }> => {
    return new Promise((resolve, reject) => {
        const importId = `import_${Date.now()}`;
        const storagePath = `course-imports/${importId}/${file.name}`;
        const storageRef = ref(storage, storagePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.error("Upload failed", error);
                reject(error);
            },
            () => {
                resolve({ storagePath: importId }); // Return importId for status tracking
            }
        );
    });
};

/**
 * Listens to course import status
 * @param importId The import identifier
 * @param onUpdate Callback with status updates
 * @returns Unsubscribe function
 */
export const listenToCourseImportStatus = (
    importId: string,
    onUpdate: (status: { status: string; courseId?: string; error?: string }) => void
) => {
    const docRef = doc(db, 'course_import_status', importId);

    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            onUpdate(doc.data() as any);
        }
    });
};
