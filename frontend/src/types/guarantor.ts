export type GuarantorStatus = 'pending_verification' | 'in_review' | 'verified' | 'rejected' | 'draft';

export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
}

export interface GuarantorSubmission {
    id: string;
    guarantor_name: string;
    relationship_to_borrower: string;
    address: Address;
    date_of_birth: string;
    occupation: string;
    employer_or_business: string;
    linkedin_profile: string;
    company_registration_number: string;
    known_associations: string[];
    comments: string;
    submission_timestamp: string;
    submitted_by: string;
    record_status: GuarantorStatus;
    attachments?: GuarantorAttachment[];
}

export interface CreateGuarantorInput {
    guarantor_name: string;
    relationship_to_borrower: string;
    address: Address;
    date_of_birth: string;
    occupation: string;
    employer_or_business: string;
    linkedin_profile?: string;
    company_registration_number?: string;
    known_associations?: string[];
    comments?: string;
}

export interface UpdateGuarantorInput extends Partial<CreateGuarantorInput> {
    record_status?: GuarantorStatus;
}

export interface GuarantorAttachment {
    id: string;
    filename: string;
    file_type: string;
    file_size: number;
    upload_date: string;
    attachment_type: AttachmentType;
    file_url: string;
}

export type AttachmentType = 'identification' | 'proof_of_address' | 'business_certificate' | 'other';

export interface GuarantorFormData extends CreateGuarantorInput {
    step?: number;
    isDraft?: boolean;
}

export interface GuarantorSearchFilters {
    search?: string;
    status?: GuarantorStatus[];
    dateFrom?: string;
    dateTo?: string;
    submittedBy?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface GuarantorDashboardStats {
    total_submissions: number;
    pending_verification: number;
    in_review: number;
    verified: number;
    rejected: number;
    recent_submissions: GuarantorSubmission[];
}

export interface FileUploadProgress {
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error' | 'pending';
    error?: string;
    attachment?: GuarantorAttachment;
}
