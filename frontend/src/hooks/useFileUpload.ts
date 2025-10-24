import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadGuarantorAttachment } from '@/services/guarantorApi';
import { validateFile } from '@/utils/validation';
import type { FileUploadProgress, GuarantorAttachment } from '@/types/guarantor';

export interface UseFileUploadOptions {
    guarantorId: string;
    onUploadComplete?: (attachment: GuarantorAttachment) => void;
    onUploadError?: (error: string) => void;
}

export const useFileUpload = ({ guarantorId, onUploadComplete, onUploadError }: UseFileUploadOptions) => {
    const [uploads, setUploads] = useState<FileUploadProgress[]>([]);
    const queryClient = useQueryClient();

    const uploadMutation = useMutation({
        mutationFn: ({
            file,
            attachmentType,
            onProgress
        }: {
            file: File;
            attachmentType: string;
            onProgress: (progress: number) => void;
        }) => uploadGuarantorAttachment(guarantorId, file, attachmentType, onProgress),
        onSuccess: (attachment, { file }) => {
            // Update upload status
            setUploads(prev =>
                prev.map(upload =>
                    upload.file === file ? { ...upload, status: 'completed', progress: 100, attachment } : upload
                )
            );

            // Invalidate guarantor query to refresh attachments
            queryClient.invalidateQueries({ queryKey: ['guarantor', guarantorId] });

            onUploadComplete?.(attachment);
        },
        onError: (error, { file }) => {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';

            // Update upload status
            setUploads(prev =>
                prev.map(upload =>
                    upload.file === file ? { ...upload, status: 'error', error: errorMessage } : upload
                )
            );

            onUploadError?.(errorMessage);
        }
    });

    const uploadFile = useCallback(
        (file: File, attachmentType: string) => {
            // Validate file first
            const validationError = validateFile(file);
            if (validationError) {
                onUploadError?.(validationError);
                return;
            }

            // Check if file is already being uploaded
            const existingUpload = uploads.find(upload => upload.file === file);
            if (existingUpload) {
                return;
            }

            // Add to uploads list
            const newUpload: FileUploadProgress = {
                file,
                progress: 0,
                status: 'pending'
            };

            setUploads(prev => [...prev, newUpload]);

            // Start upload
            const onProgress = (progress: number) => {
                setUploads(prev =>
                    prev.map(upload =>
                        upload.file === file
                            ? { ...upload, progress, status: progress === 100 ? 'completed' : 'uploading' }
                            : upload
                    )
                );
            };

            uploadMutation.mutate({ file, attachmentType, onProgress });
        },
        [uploads, uploadMutation, onUploadError]
    );

    const uploadMultipleFiles = useCallback(
        (files: File[], attachmentType: string) => {
            files.forEach(file => uploadFile(file, attachmentType));
        },
        [uploadFile]
    );

    const removeUpload = useCallback((file: File) => {
        setUploads(prev => prev.filter(upload => upload.file !== file));
    }, []);

    const clearCompleted = useCallback(() => {
        setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
    }, []);

    const clearAll = useCallback(() => {
        setUploads([]);
    }, []);

    const getUploadByFile = useCallback(
        (file: File) => {
            return uploads.find(upload => upload.file === file);
        },
        [uploads]
    );

    const getUploadsByStatus = useCallback(
        (status: FileUploadProgress['status']) => {
            return uploads.filter(upload => upload.status === status);
        },
        [uploads]
    );

    // Calculate overall progress
    const overallProgress =
        uploads.length > 0 ? Math.round(uploads.reduce((sum, upload) => sum + upload.progress, 0) / uploads.length) : 0;

    // Check if any uploads are in progress
    const isUploading = uploads.some(upload => upload.status === 'uploading' || upload.status === 'pending');

    // Check if all uploads are completed
    const allCompleted = uploads.length > 0 && uploads.every(upload => upload.status === 'completed');

    // Check if any uploads have errors
    const hasErrors = uploads.some(upload => upload.status === 'error');

    return {
        uploads,
        uploadFile,
        uploadMultipleFiles,
        removeUpload,
        clearCompleted,
        clearAll,
        getUploadByFile,
        getUploadsByStatus,
        overallProgress,
        isUploading,
        allCompleted,
        hasErrors,
        isUploadInProgress: uploadMutation.isPending
    };
};

// Hook for drag and drop functionality
export const useDragAndDrop = (onFileDrop: (files: File[]) => void) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                onFileDrop(files);
            }
        },
        [onFileDrop]
    );

    return {
        isDragOver,
        dragHandlers: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDragOver: handleDragOver,
            onDrop: handleDrop
        }
    };
};
