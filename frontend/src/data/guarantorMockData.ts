import type { GuarantorSubmission, GuarantorDashboardStats, GuarantorAttachment } from '@/types/guarantor';

export const mockGuarantorSubmissions: GuarantorSubmission[] = [
    {
        id: '1',
        guarantor_name: 'Michael R. Davis',
        relationship_to_borrower: 'Personal guarantor for BlueRock Holdings LLC',
        address: {
            street: '123 Main Street',
            city: 'Phoenix',
            state: 'AZ',
            zip: '85001'
        },
        date_of_birth: '1978-03-22',
        occupation: 'Real Estate Investor',
        employer_or_business: 'Davis Capital Group',
        linkedin_profile: 'https://www.linkedin.com/in/michaeldavis',
        company_registration_number: 'AZ-12345678',
        known_associations: ['Phoenix Real Estate Association'],
        comments: "Primary contact for borrower's credit line renewal.",
        submission_timestamp: '2025-10-21T10:30:00Z',
        submitted_by: 'LoanOfficer123',
        record_status: 'pending_verification',
        attachments: [
            {
                id: 'att1',
                filename: 'drivers_license.pdf',
                file_type: 'application/pdf',
                file_size: 2048576,
                upload_date: '2025-10-21T10:25:00Z',
                attachment_type: 'identification',
                file_url: '/api/files/att1'
            }
        ]
    },
    {
        id: '2',
        guarantor_name: 'Sarah J. Thompson',
        relationship_to_borrower: 'Business partner and co-owner',
        address: {
            street: '456 Oak Avenue',
            city: 'Austin',
            state: 'TX',
            zip: '73301'
        },
        date_of_birth: '1985-07-15',
        occupation: 'Software Engineer',
        employer_or_business: 'Tech Solutions LLC',
        linkedin_profile: 'https://www.linkedin.com/in/sarahthompson',
        company_registration_number: 'TX-87654321',
        known_associations: ['Austin Tech Association', 'Women in Tech Network'],
        comments: 'High-income guarantor with excellent credit history.',
        submission_timestamp: '2025-10-20T14:15:00Z',
        submitted_by: 'LoanOfficer456',
        record_status: 'verified',
        attachments: []
    },
    {
        id: '3',
        guarantor_name: 'Robert Chen',
        relationship_to_borrower: 'Uncle and business advisor',
        address: {
            street: '789 Pine Street',
            city: 'Seattle',
            state: 'WA',
            zip: '98101'
        },
        date_of_birth: '1972-12-08',
        occupation: 'Financial Consultant',
        employer_or_business: 'Chen Financial Services',
        linkedin_profile: 'https://www.linkedin.com/in/robertchen',
        company_registration_number: 'WA-11223344',
        known_associations: ['Seattle Financial Advisors Association'],
        comments: 'Long-standing family relationship with borrower.',
        submission_timestamp: '2025-10-19T09:45:00Z',
        submitted_by: 'LoanOfficer789',
        record_status: 'in_review'
    },
    {
        id: '4',
        guarantor_name: 'Lisa Martinez',
        relationship_to_borrower: 'Business mentor and investor',
        address: {
            street: '321 Elm Drive',
            city: 'Denver',
            state: 'CO',
            zip: '80201'
        },
        date_of_birth: '1980-04-12',
        occupation: 'Investment Manager',
        employer_or_business: 'Mountain Capital Partners',
        linkedin_profile: 'https://www.linkedin.com/in/lisamartinez',
        company_registration_number: 'CO-99887766',
        known_associations: ['Denver Investment Club', 'Colorado Business Network'],
        comments: 'Extensive investment portfolio and business experience.',
        submission_timestamp: '2025-10-18T16:20:00Z',
        submitted_by: 'LoanOfficer101',
        record_status: 'pending_verification'
    },
    {
        id: '5',
        guarantor_name: 'James Wilson',
        relationship_to_borrower: 'Former business partner',
        address: {
            street: '654 Maple Lane',
            city: 'Miami',
            state: 'FL',
            zip: '33101'
        },
        date_of_birth: '1975-09-30',
        occupation: 'Real Estate Developer',
        employer_or_business: 'Wilson Development Corp',
        linkedin_profile: 'https://www.linkedin.com/in/jameswilson',
        company_registration_number: 'FL-55443322',
        known_associations: ['Miami Real Estate Board'],
        comments: 'Strong real estate portfolio in South Florida.',
        submission_timestamp: '2025-10-17T11:10:00Z',
        submitted_by: 'LoanOfficer202',
        record_status: 'rejected'
    }
];

export const mockDashboardStats: GuarantorDashboardStats = {
    total_submissions: 5,
    pending_verification: 2,
    in_review: 1,
    verified: 1,
    rejected: 1,
    recent_submissions: mockGuarantorSubmissions.slice(0, 3)
};

export const mockAttachments: GuarantorAttachment[] = [
    {
        id: 'att1',
        filename: 'drivers_license.pdf',
        file_type: 'application/pdf',
        file_size: 2048576,
        upload_date: '2025-10-21T10:25:00Z',
        attachment_type: 'identification',
        file_url: '/api/files/att1'
    },
    {
        id: 'att2',
        filename: 'utility_bill.pdf',
        file_type: 'application/pdf',
        file_size: 1536000,
        upload_date: '2025-10-21T10:26:00Z',
        attachment_type: 'proof_of_address',
        file_url: '/api/files/att2'
    },
    {
        id: 'att3',
        filename: 'business_certificate.pdf',
        file_type: 'application/pdf',
        file_size: 3072000,
        upload_date: '2025-10-21T10:27:00Z',
        attachment_type: 'business_certificate',
        file_url: '/api/files/att3'
    }
];
