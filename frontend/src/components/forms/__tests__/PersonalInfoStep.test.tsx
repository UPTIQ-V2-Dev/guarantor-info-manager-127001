import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { render } from '@/test/test-utils';
import { PersonalInfoStep } from '../PersonalInfoStep';
import { guarantorFormSchema } from '@/utils/validation';
import type { GuarantorFormData } from '@/types/guarantor';

// Wrapper component to provide form context
const PersonalInfoStepWrapper = ({ defaultValues = {} as Partial<GuarantorFormData> }) => {
    const form = useForm<GuarantorFormData>({
        resolver: zodResolver(guarantorFormSchema),
        defaultValues: {
            guarantor_name: '',
            relationship_to_borrower: '',
            address: {
                street: '',
                city: '',
                state: '',
                zip: ''
            },
            date_of_birth: '',
            occupation: '',
            employer_or_business: '',
            linkedin_profile: '',
            company_registration_number: '',
            known_associations: [],
            comments: '',
            ...defaultValues
        },
        mode: 'onChange'
    });

    return (
        <FormProvider {...form}>
            <PersonalInfoStep />
        </FormProvider>
    );
};

describe('PersonalInfoStep', () => {
    const user = userEvent.setup();

    it('should render all form fields', () => {
        render(<PersonalInfoStepWrapper />);

        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/relationship to borrower/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
    });

    it('should show required field indicators', () => {
        render(<PersonalInfoStepWrapper />);

        // Check for asterisks indicating required fields
        expect(screen.getByText(/full name/i).parentElement).toHaveTextContent('*');
        expect(screen.getByText(/relationship to borrower/i).parentElement).toHaveTextContent('*');
        expect(screen.getByText(/date of birth/i).parentElement).toHaveTextContent('*');
        expect(screen.getByText(/street address/i).parentElement).toHaveTextContent('*');
        expect(screen.getByText('City').parentElement).toHaveTextContent('*');
        expect(screen.getByText('State').parentElement).toHaveTextContent('*');
        expect(screen.getByText(/zip code/i).parentElement).toHaveTextContent('*');
    });

    it('should accept valid input in all fields', async () => {
        render(<PersonalInfoStepWrapper />);

        const nameInput = screen.getByLabelText(/full name/i);
        const relationshipInput = screen.getByLabelText(/relationship to borrower/i);
        const dobInput = screen.getByLabelText(/date of birth/i);
        const streetInput = screen.getByLabelText(/street address/i);
        const cityInput = screen.getByLabelText(/city/i);
        const stateInput = screen.getByLabelText(/state/i);
        const zipInput = screen.getByLabelText(/zip code/i);

        await user.type(nameInput, 'John Doe');
        await user.type(relationshipInput, 'Business partner');
        await user.type(dobInput, '1980-01-15');
        await user.type(streetInput, '123 Main Street');
        await user.type(cityInput, 'New York');
        await user.type(stateInput, 'NY');
        await user.type(zipInput, '10001');

        expect(nameInput).toHaveValue('John Doe');
        expect(relationshipInput).toHaveValue('Business partner');
        expect(dobInput).toHaveValue('1980-01-15');
        expect(streetInput).toHaveValue('123 Main Street');
        expect(cityInput).toHaveValue('New York');
        expect(stateInput).toHaveValue('NY');
        expect(zipInput).toHaveValue('10001');
    });

    it('should display age when valid date of birth is entered', async () => {
        render(<PersonalInfoStepWrapper />);

        const dobInput = screen.getByLabelText(/date of birth/i);
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - 30;

        await user.type(dobInput, `${birthYear}-01-15`);

        await waitFor(() => {
            expect(screen.getByText(/age: 30 years/i)).toBeInTheDocument();
        });
    });

    it('should render with default values', () => {
        const defaultValues = {
            guarantor_name: 'Jane Smith',
            relationship_to_borrower: 'Co-owner',
            date_of_birth: '1985-06-15',
            address: {
                street: '456 Oak Ave',
                city: 'Boston',
                state: 'MA',
                zip: '02101'
            }
        };

        render(<PersonalInfoStepWrapper defaultValues={defaultValues} />);

        expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Co-owner')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1985-06-15')).toBeInTheDocument();
        expect(screen.getByDisplayValue('456 Oak Ave')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Boston')).toBeInTheDocument();
        expect(screen.getByDisplayValue('MA')).toBeInTheDocument();
        expect(screen.getByDisplayValue('02101')).toBeInTheDocument();
    });

    it('should display helpful placeholder text', () => {
        render(<PersonalInfoStepWrapper />);

        expect(screen.getByPlaceholderText('Enter full legal name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/business partner and co-owner/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter street address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter city')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter state')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/12345 or 12345-6789/i)).toBeInTheDocument();
    });

    it('should have proper form field structure', () => {
        render(<PersonalInfoStepWrapper />);

        // Check that form fields have proper structure
        const nameInput = screen.getByLabelText(/full name/i);
        expect(nameInput).toHaveAttribute('id', 'guarantor_name');
        expect(nameInput.getAttribute('class')).not.toContain('border-red-500');

        const dobInput = screen.getByLabelText(/date of birth/i);
        expect(dobInput).toHaveAttribute('type', 'date');
        expect(dobInput).toHaveAttribute('id', 'date_of_birth');
    });

    it('should display helper text for various fields', () => {
        render(<PersonalInfoStepWrapper />);

        expect(screen.getByText(/enter the full legal name as it appears on official documents/i)).toBeInTheDocument();
        expect(screen.getByText(/describe the nature of the relationship and context/i)).toBeInTheDocument();
        expect(screen.getByText(/provide the primary residential or business address/i)).toBeInTheDocument();
    });
});
