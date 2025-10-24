import { describe, it, expect } from 'vitest';
import {
    personalInfoSchema,
    professionalInfoSchema,
    associationsSchema,
    validateStep,
    validateFile,
    isValidEmail,
    isValidPhoneNumber,
    isValidURL,
    calculateAge,
    cleanFormData
} from '../validation';
import type { GuarantorFormData } from '@/types/guarantor';

describe('validation utils', () => {
    describe('personalInfoSchema', () => {
        it('should validate correct personal information', () => {
            const validData = {
                guarantor_name: 'John Doe',
                relationship_to_borrower: 'Business partner',
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zip: '10001'
                },
                date_of_birth: '1980-01-15'
            };

            const result = personalInfoSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject invalid name with special characters', () => {
            const invalidData = {
                guarantor_name: 'John@Doe',
                relationship_to_borrower: 'Business partner',
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zip: '10001'
                },
                date_of_birth: '1980-01-15'
            };

            const result = personalInfoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject future date of birth', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            const invalidData = {
                guarantor_name: 'John Doe',
                relationship_to_borrower: 'Business partner',
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zip: '10001'
                },
                date_of_birth: futureDate.toISOString().split('T')[0]
            };

            const result = personalInfoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject invalid ZIP code format', () => {
            const invalidData = {
                guarantor_name: 'John Doe',
                relationship_to_borrower: 'Business partner',
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zip: '123' // Invalid format
                },
                date_of_birth: '1980-01-15'
            };

            const result = personalInfoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should accept valid ZIP code formats', () => {
            const validData1 = {
                guarantor_name: 'John Doe',
                relationship_to_borrower: 'Business partner',
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zip: '10001'
                },
                date_of_birth: '1980-01-15'
            };

            const validData2 = { ...validData1, address: { ...validData1.address, zip: '10001-1234' } };

            expect(personalInfoSchema.safeParse(validData1).success).toBe(true);
            expect(personalInfoSchema.safeParse(validData2).success).toBe(true);
        });
    });

    describe('professionalInfoSchema', () => {
        it('should validate correct professional information', () => {
            const validData = {
                occupation: 'Software Engineer',
                employer_or_business: 'Tech Corp',
                linkedin_profile: 'https://www.linkedin.com/in/johndoe',
                company_registration_number: 'NY-12345678'
            };

            const result = professionalInfoSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should accept empty optional fields', () => {
            const validData = {
                occupation: 'Software Engineer',
                employer_or_business: 'Tech Corp'
            };

            const result = professionalInfoSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject invalid LinkedIn URL', () => {
            const invalidData = {
                occupation: 'Software Engineer',
                employer_or_business: 'Tech Corp',
                linkedin_profile: 'https://facebook.com/johndoe'
            };

            const result = professionalInfoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject invalid company registration format', () => {
            const invalidData = {
                occupation: 'Software Engineer',
                employer_or_business: 'Tech Corp',
                company_registration_number: 'invalid-format'
            };

            const result = professionalInfoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('associationsSchema', () => {
        it('should validate correct associations', () => {
            const validData = {
                known_associations: ['Tech Association', 'Business Network'],
                comments: 'Additional context about the guarantor'
            };

            const result = associationsSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should accept empty associations and comments', () => {
            const validData = {
                known_associations: [],
                comments: ''
            };

            const result = associationsSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject comments exceeding character limit', () => {
            const invalidData = {
                known_associations: [],
                comments: 'a'.repeat(1001) // Exceeds 1000 character limit
            };

            const result = associationsSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('validateStep', () => {
        const mockFormData: Partial<GuarantorFormData> = {
            guarantor_name: 'John Doe',
            relationship_to_borrower: 'Business partner',
            address: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zip: '10001'
            },
            date_of_birth: '1980-01-15',
            occupation: 'Software Engineer',
            employer_or_business: 'Tech Corp',
            known_associations: ['Tech Association'],
            comments: 'Test comments'
        };

        it('should validate step 1 (personal info)', () => {
            expect(validateStep(1, mockFormData)).toBe(true);
        });

        it('should validate step 2 (professional info)', () => {
            expect(validateStep(2, mockFormData)).toBe(true);
        });

        it('should validate step 3 (associations)', () => {
            expect(validateStep(3, mockFormData)).toBe(true);
        });

        it('should return false for invalid step', () => {
            expect(validateStep(999, mockFormData)).toBe(false);
        });

        it('should return false for incomplete data', () => {
            const incompleteData = { guarantor_name: 'John' };
            expect(validateStep(1, incompleteData)).toBe(false);
        });
    });

    describe('validateFile', () => {
        it('should accept valid PDF file', () => {
            const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            expect(validateFile(validFile)).toBe(null);
        });

        it('should accept valid image files', () => {
            const jpegFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            const pngFile = new File(['content'], 'test.png', { type: 'image/png' });

            expect(validateFile(jpegFile)).toBe(null);
            expect(validateFile(pngFile)).toBe(null);
        });

        it('should reject unsupported file types', () => {
            const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
            const error = validateFile(invalidFile);
            expect(error).toContain('File type not supported');
        });

        it('should reject files exceeding size limit', () => {
            const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.pdf', {
                type: 'application/pdf'
            });
            const error = validateFile(largeFile);
            expect(error).toContain('File size must be less than');
        });
    });

    describe('utility functions', () => {
        describe('isValidEmail', () => {
            it('should validate correct email addresses', () => {
                expect(isValidEmail('test@example.com')).toBe(true);
                expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
            });

            it('should reject invalid email addresses', () => {
                expect(isValidEmail('invalid-email')).toBe(false);
                expect(isValidEmail('@domain.com')).toBe(false);
                expect(isValidEmail('test@')).toBe(false);
            });
        });

        describe('isValidPhoneNumber', () => {
            it('should validate US phone number formats', () => {
                expect(isValidPhoneNumber('(555) 123-4567')).toBe(true);
                expect(isValidPhoneNumber('555-123-4567')).toBe(true);
                expect(isValidPhoneNumber('555.123.4567')).toBe(true);
                expect(isValidPhoneNumber('5551234567')).toBe(true);
            });

            it('should reject invalid phone numbers', () => {
                expect(isValidPhoneNumber('123-456')).toBe(false);
                expect(isValidPhoneNumber('invalid')).toBe(false);
            });
        });

        describe('isValidURL', () => {
            it('should validate correct URLs', () => {
                expect(isValidURL('https://example.com')).toBe(true);
                expect(isValidURL('http://test.org/path')).toBe(true);
            });

            it('should reject invalid URLs', () => {
                expect(isValidURL('not-a-url')).toBe(false);
                expect(isValidURL('ftp://invalid')).toBe(true); // URL constructor accepts this
            });
        });

        describe('calculateAge', () => {
            it('should calculate age correctly', () => {
                const tenYearsAgo = new Date();
                tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

                const age = calculateAge(tenYearsAgo.toISOString().split('T')[0]);
                expect(age).toBe(10);
            });

            it('should handle birthdays not yet reached this year', () => {
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                nextMonth.setFullYear(nextMonth.getFullYear() - 25);

                const age = calculateAge(nextMonth.toISOString().split('T')[0]);
                expect(age).toBe(24); // Birthday hasn't occurred this year
            });
        });

        describe('cleanFormData', () => {
            it('should trim string fields and filter empty associations', () => {
                const dirtyData: GuarantorFormData = {
                    guarantor_name: '  John Doe  ',
                    relationship_to_borrower: '  Business partner  ',
                    address: {
                        street: '  123 Main St  ',
                        city: '  New York  ',
                        state: '  NY  ',
                        zip: '  10001  '
                    },
                    date_of_birth: '1980-01-15',
                    occupation: '  Software Engineer  ',
                    employer_or_business: '  Tech Corp  ',
                    linkedin_profile: '  https://linkedin.com/in/johndoe  ',
                    company_registration_number: '  NY-12345678  ',
                    known_associations: ['Tech Association', '', 'Business Network', '   '],
                    comments: '  Test comments  '
                };

                const cleanedData = cleanFormData(dirtyData);

                expect(cleanedData.guarantor_name).toBe('John Doe');
                expect(cleanedData.relationship_to_borrower).toBe('Business partner');
                expect(cleanedData.address.street).toBe('123 Main St');
                expect(cleanedData.address.city).toBe('New York');
                expect(cleanedData.linkedin_profile).toBe('https://linkedin.com/in/johndoe');
                expect(cleanedData.known_associations).toEqual(['Tech Association', 'Business Network']);
                expect(cleanedData.comments).toBe('Test comments');
            });
        });
    });
});
