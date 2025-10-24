import { z } from 'zod';
import type { GuarantorFormData } from '@/types/guarantor';

// Address validation schema
export const addressSchema = z.object({
    street: z
        .string()
        .min(5, 'Street address must be at least 5 characters')
        .max(100, 'Street address must not exceed 100 characters'),
    city: z.string().min(2, 'City must be at least 2 characters').max(50, 'City must not exceed 50 characters'),
    state: z.string().min(2, 'State must be at least 2 characters').max(50, 'State must not exceed 50 characters'),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789')
});

// Personal information validation schema
export const personalInfoSchema = z.object({
    guarantor_name: z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must not exceed 100 characters')
        .regex(/^[a-zA-Z\s\-.']+$/, 'Name can only contain letters, spaces, hyphens, periods, and apostrophes'),
    relationship_to_borrower: z
        .string()
        .min(3, 'Relationship must be at least 3 characters')
        .max(200, 'Relationship must not exceed 200 characters'),
    address: addressSchema,
    date_of_birth: z
        .string()
        .refine(date => {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                return age >= 18;
            }
            return age >= 18;
        }, 'Guarantor must be at least 18 years old')
        .refine(date => {
            const birthDate = new Date(date);
            const today = new Date();
            return birthDate <= today;
        }, 'Date of birth cannot be in the future')
});

// Professional information validation schema
export const professionalInfoSchema = z.object({
    occupation: z
        .string()
        .min(2, 'Occupation must be at least 2 characters')
        .max(100, 'Occupation must not exceed 100 characters'),
    employer_or_business: z
        .string()
        .min(2, 'Employer/Business name must be at least 2 characters')
        .max(150, 'Employer/Business name must not exceed 150 characters'),
    linkedin_profile: z
        .string()
        .optional()
        .refine(url => {
            if (!url) return true;
            try {
                const urlObj = new URL(url);
                return urlObj.hostname === 'www.linkedin.com' || urlObj.hostname === 'linkedin.com';
            } catch {
                return false;
            }
        }, 'Must be a valid LinkedIn URL'),
    company_registration_number: z
        .string()
        .optional()
        .refine(reg => {
            if (!reg) return true;
            // Basic format: STATE-XXXXXXXX or similar patterns
            return /^[A-Z]{2,3}-?\w{6,12}$/i.test(reg);
        }, 'Invalid company registration number format')
});

// Associations and notes validation schema
export const associationsSchema = z.object({
    known_associations: z
        .array(z.string())
        .optional()
        .default([])
        .refine(associations => {
            if (!associations) return true;
            return associations.every(assoc => assoc.length >= 2 && assoc.length <= 150);
        }, 'Each association must be between 2 and 150 characters'),
    comments: z.string().max(1000, 'Comments must not exceed 1000 characters').optional()
});

// Complete guarantor form validation schema
export const guarantorFormSchema = personalInfoSchema.merge(professionalInfoSchema).merge(associationsSchema);

// File validation
export const validateFile = (file: File): string | null => {
    const maxSizeInMB = 10;
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
        return 'File type not supported. Please upload PDF, JPEG, PNG, or Word documents.';
    }

    if (file.size > maxSizeInMB * 1024 * 1024) {
        return `File size must be less than ${maxSizeInMB}MB.`;
    }

    return null;
};

// Email validation utility
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Phone validation utility
export const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
};

// URL validation utility
export const isValidURL = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Age calculation utility
export const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

// Form step validation
export const validateStep = (step: number, data: Partial<GuarantorFormData>): boolean => {
    try {
        switch (step) {
            case 1: // Personal Information
                personalInfoSchema.parse({
                    guarantor_name: data.guarantor_name,
                    relationship_to_borrower: data.relationship_to_borrower,
                    address: data.address,
                    date_of_birth: data.date_of_birth
                });
                return true;
            case 2: // Professional Information
                professionalInfoSchema.parse({
                    occupation: data.occupation,
                    employer_or_business: data.employer_or_business,
                    linkedin_profile: data.linkedin_profile,
                    company_registration_number: data.company_registration_number
                });
                return true;
            case 3: // Associations
                associationsSchema.parse({
                    known_associations: data.known_associations,
                    comments: data.comments
                });
                return true;
            default:
                return false;
        }
    } catch {
        return false;
    }
};

// Clean and format form data
export const cleanFormData = (data: GuarantorFormData): GuarantorFormData => {
    return {
        ...data,
        guarantor_name: data.guarantor_name?.trim(),
        relationship_to_borrower: data.relationship_to_borrower?.trim(),
        occupation: data.occupation?.trim(),
        employer_or_business: data.employer_or_business?.trim(),
        linkedin_profile: data.linkedin_profile?.trim() || '',
        company_registration_number: data.company_registration_number?.trim() || '',
        comments: data.comments?.trim() || '',
        known_associations: data.known_associations?.filter(assoc => assoc.trim().length > 0) || [],
        address: {
            street: data.address?.street?.trim() || '',
            city: data.address?.city?.trim() || '',
            state: data.address?.state?.trim() || '',
            zip: data.address?.zip?.trim() || ''
        }
    };
};
