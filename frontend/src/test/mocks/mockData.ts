import type {
    GuarantorSubmission,
    GuarantorDashboardStats,
    GuarantorFormData,
    GuarantorAttachment
} from '@/types/guarantor';
import type { PaginatedResponse } from '@/types/api';

export const mockGuarantor: GuarantorSubmission = {
    id: '1',
    guarantor_name: 'John Doe',
    relationship_to_borrower: 'Business partner and co-owner',
    address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001'
    },
    date_of_birth: '1980-01-15',
    occupation: 'Software Engineer',
    employer_or_business: 'Tech Corp',
    linkedin_profile: 'https://www.linkedin.com/in/johndoe',
    company_registration_number: 'NY-12345678',
    known_associations: ['Tech Association', 'Business Network'],
    comments: 'Reliable business partner with excellent credit history',
    submission_timestamp: '2025-10-24T10:30:00Z',
    submitted_by: 'TestUser',
    record_status: 'pending_verification',
    attachments: []
};

export const mockGuarantors: GuarantorSubmission[] = [
    mockGuarantor,
    {
        ...mockGuarantor,
        id: '2',
        guarantor_name: 'Jane Smith',
        record_status: 'verified',
        submission_timestamp: '2025-10-23T14:20:00Z'
    },
    {
        ...mockGuarantor,
        id: '3',
        guarantor_name: 'Bob Wilson',
        record_status: 'in_review',
        submission_timestamp: '2025-10-22T09:15:00Z'
    }
];

export const mockPaginatedResponse: PaginatedResponse<GuarantorSubmission> = {
    results: mockGuarantors,
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 3
};

export const mockDashboardStats: GuarantorDashboardStats = {
    total_submissions: 5,
    pending_verification: 2,
    in_review: 1,
    verified: 1,
    rejected: 1,
    recent_submissions: mockGuarantors.slice(0, 3)
};

export const mockFormData: GuarantorFormData = {
    guarantor_name: 'Test User',
    relationship_to_borrower: 'Business partner',
    address: {
        street: '456 Test St',
        city: 'Test City',
        state: 'TC',
        zip: '12345'
    },
    date_of_birth: '1985-06-15',
    occupation: 'Engineer',
    employer_or_business: 'Test Company',
    linkedin_profile: 'https://www.linkedin.com/in/testuser',
    company_registration_number: 'TC-98765432',
    known_associations: ['Test Association'],
    comments: 'Test comments'
};

export const mockAttachment: GuarantorAttachment = {
    id: 'att1',
    filename: 'test-document.pdf',
    file_type: 'application/pdf',
    file_size: 1024000,
    upload_date: '2025-10-24T12:00:00Z',
    attachment_type: 'identification',
    file_url: '/api/files/att1'
};

export const createMockFile = (
    name: string = 'test.pdf',
    type: string = 'application/pdf',
    size: number = 1024
): File => {
    const blob = new Blob(['test content'], { type });
    return new File([blob], name, { type, lastModified: Date.now() });
};
