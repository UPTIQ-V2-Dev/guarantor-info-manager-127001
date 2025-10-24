import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileTextIcon, UploadIcon, XIcon, CheckCircleIcon, AlertCircleIcon, DownloadIcon } from 'lucide-react';
import { useFileUpload, useDragAndDrop } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';
import type { AttachmentType } from '@/types/guarantor';

interface AttachmentsStepProps {
    guarantorId?: string;
}

const attachmentTypeOptions: { value: AttachmentType; label: string }[] = [
    { value: 'identification', label: 'Identification Document' },
    { value: 'proof_of_address', label: 'Proof of Address' },
    { value: 'business_certificate', label: 'Business Certificate' },
    { value: 'other', label: 'Other Document' }
];

const getAttachmentTypeColor = (type: AttachmentType) => {
    switch (type) {
        case 'identification':
            return 'bg-blue-100 text-blue-800';
        case 'proof_of_address':
            return 'bg-green-100 text-green-800';
        case 'business_certificate':
            return 'bg-purple-100 text-purple-800';
        case 'other':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const AttachmentsStep = ({ guarantorId = 'temp-id' }: AttachmentsStepProps) => {
    const [selectedAttachmentType, setSelectedAttachmentType] = useState<AttachmentType>('identification');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { uploads, uploadMultipleFiles, removeUpload, clearCompleted, isUploading, hasErrors, overallProgress } =
        useFileUpload({
            guarantorId,
            onUploadComplete: attachment => {
                console.log('Upload completed:', attachment);
            },
            onUploadError: error => {
                console.error('Upload error:', error);
            }
        });

    const handleFileDrop = (files: File[]) => {
        uploadMultipleFiles(files, selectedAttachmentType);
    };

    const { isDragOver, dragHandlers } = useDragAndDrop(handleFileDrop);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            uploadMultipleFiles(files, selectedAttachmentType);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const completedUploads = uploads.filter(upload => upload.status === 'completed');
    const errorUploads = uploads.filter(upload => upload.status === 'error');

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <FileTextIcon className='h-5 w-5' />
                        Document Uploads
                        <Badge
                            variant='secondary'
                            className='ml-auto'
                        >
                            Optional
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {/* Upload Area */}
                    <div className='space-y-4'>
                        <div>
                            <label className='text-sm font-medium mb-2 block'>Document Type</label>
                            <Select
                                value={selectedAttachmentType}
                                onValueChange={(value: AttachmentType) => setSelectedAttachmentType(value)}
                            >
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select document type' />
                                </SelectTrigger>
                                <SelectContent>
                                    {attachmentTypeOptions.map(option => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div
                            {...dragHandlers}
                            className={cn(
                                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                                isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
                                isUploading && 'pointer-events-none opacity-60'
                            )}
                        >
                            <UploadIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                            <div className='space-y-2'>
                                <p className='text-lg font-medium'>
                                    Drag and drop files here, or{' '}
                                    <button
                                        type='button'
                                        onClick={handleBrowseClick}
                                        className='text-blue-600 hover:text-blue-500 underline'
                                        disabled={isUploading}
                                    >
                                        browse
                                    </button>
                                </p>
                                <p className='text-sm text-gray-600'>
                                    Supports PDF, JPEG, PNG, and Word documents up to 10MB
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type='file'
                                onChange={handleFileSelect}
                                multiple
                                accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                                className='hidden'
                            />
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className='space-y-2'>
                            <div className='flex justify-between text-sm'>
                                <span>Uploading files...</span>
                                <span>{overallProgress}%</span>
                            </div>
                            <Progress
                                value={overallProgress}
                                className='w-full'
                            />
                        </div>
                    )}

                    {/* Upload List */}
                    {uploads.length > 0 && (
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                                <h4 className='font-medium'>Upload Progress</h4>
                                {completedUploads.length > 0 && (
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={clearCompleted}
                                    >
                                        Clear Completed
                                    </Button>
                                )}
                            </div>

                            <div className='space-y-2 max-h-64 overflow-y-auto'>
                                {uploads.map((upload, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'flex items-center gap-3 p-3 rounded-lg border',
                                            upload.status === 'completed' && 'bg-green-50 border-green-200',
                                            upload.status === 'error' && 'bg-red-50 border-red-200',
                                            (upload.status === 'uploading' || upload.status === 'pending') &&
                                                'bg-blue-50 border-blue-200'
                                        )}
                                    >
                                        <div className='flex-shrink-0'>
                                            {upload.status === 'completed' && (
                                                <CheckCircleIcon className='h-5 w-5 text-green-600' />
                                            )}
                                            {upload.status === 'error' && (
                                                <AlertCircleIcon className='h-5 w-5 text-red-600' />
                                            )}
                                            {(upload.status === 'uploading' || upload.status === 'pending') && (
                                                <div className='h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                                            )}
                                        </div>

                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center gap-2 mb-1'>
                                                <span className='font-medium truncate'>{upload.file.name}</span>
                                                <Badge
                                                    variant='secondary'
                                                    className={cn(
                                                        'text-xs',
                                                        getAttachmentTypeColor(selectedAttachmentType)
                                                    )}
                                                >
                                                    {
                                                        attachmentTypeOptions.find(
                                                            opt => opt.value === selectedAttachmentType
                                                        )?.label
                                                    }
                                                </Badge>
                                            </div>
                                            <div className='flex items-center gap-4 text-sm text-gray-600'>
                                                <span>{formatFileSize(upload.file.size)}</span>
                                                {upload.status === 'error' && upload.error && (
                                                    <span className='text-red-600'>{upload.error}</span>
                                                )}
                                                {(upload.status === 'uploading' || upload.status === 'pending') && (
                                                    <div className='flex items-center gap-2'>
                                                        <Progress
                                                            value={upload.progress}
                                                            className='w-20 h-2'
                                                        />
                                                        <span>{upload.progress}%</span>
                                                    </div>
                                                )}
                                                {upload.status === 'completed' && upload.attachment && (
                                                    <span className='text-green-600'>Upload completed</span>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => removeUpload(upload.file)}
                                            className='flex-shrink-0'
                                        >
                                            <XIcon className='h-4 w-4' />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Summary */}
                    {hasErrors && errorUploads.length > 0 && (
                        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                            <h4 className='font-medium text-red-800 mb-2'>Upload Errors ({errorUploads.length})</h4>
                            <ul className='text-sm text-red-700 space-y-1'>
                                {errorUploads.map((upload, index) => (
                                    <li key={index}>
                                        • {upload.file.name}: {upload.error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Success Summary */}
                    {completedUploads.length > 0 && (
                        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                            <h4 className='font-medium text-green-800 mb-2'>
                                Successfully Uploaded ({completedUploads.length})
                            </h4>
                            <div className='space-y-2'>
                                {completedUploads.map((upload, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center justify-between text-sm text-green-700'
                                    >
                                        <span>• {upload.file.name}</span>
                                        {upload.attachment && (
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                className='h-6 text-green-600 hover:text-green-800'
                                            >
                                                <DownloadIcon className='h-3 w-3' />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <h4 className='font-medium text-blue-800 mb-2'>Recommended Documents</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700'>
                    <div>
                        <h5 className='font-medium mb-1'>Identification:</h5>
                        <ul className='space-y-1'>
                            <li>• Driver's License</li>
                            <li>• Passport</li>
                            <li>• State ID</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className='font-medium mb-1'>Proof of Address:</h5>
                        <ul className='space-y-1'>
                            <li>• Utility Bill</li>
                            <li>• Bank Statement</li>
                            <li>• Lease Agreement</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
