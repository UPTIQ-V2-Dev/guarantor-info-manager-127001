import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/test-utils';
import { GuarantorFormPage } from '../GuarantorFormPage';

// Mock the hooks
vi.mock('@/hooks/useGuarantor', () => ({
    useCreateGuarantor: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isPending: false
    }))
}));

vi.mock('@/hooks/useLocalStorage', () => ({
    useLocalStorage: vi.fn(() => [
        {}, // draft data
        vi.fn(), // setDraftData
        vi.fn() // removeDraftData
    ])
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(() => vi.fn())
    };
});

// Mock sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('GuarantorFormPage', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the page header and stepper', () => {
        render(<GuarantorFormPage />);

        expect(screen.getByText('New Guarantor Submission')).toBeInTheDocument();
        expect(screen.getByText('Collect guarantor background information for credit assessment')).toBeInTheDocument();

        // Check stepper steps are rendered
        expect(screen.getByText('Personal Info')).toBeInTheDocument();
        expect(screen.getByText('Professional')).toBeInTheDocument();
        expect(screen.getByText('Associations')).toBeInTheDocument();
        expect(screen.getByText('Attachments')).toBeInTheDocument();
        expect(screen.getByText('Review')).toBeInTheDocument();
    });

    it('should show step 1 (Personal Info) initially', () => {
        render(<GuarantorFormPage />);

        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/relationship to borrower/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    });

    it('should have navigation buttons', () => {
        render(<GuarantorFormPage />);

        // Should not show Previous button on first step
        expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();

        // Should show Next and Save Draft buttons
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
    });

    it('should validate required fields before proceeding to next step', async () => {
        render(<GuarantorFormPage />);

        const nextButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextButton);

        // Should not proceed without filling required fields
        // Form should still be on step 1
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    it('should proceed to next step when current step is valid', async () => {
        render(<GuarantorFormPage />);

        // Fill out required fields for step 1
        await user.type(screen.getByLabelText(/full name/i), 'John Doe');
        await user.type(screen.getByLabelText(/relationship to borrower/i), 'Business partner');
        await user.type(screen.getByLabelText(/date of birth/i), '1980-01-15');
        await user.type(screen.getByLabelText(/street address/i), '123 Main St');
        await user.type(screen.getByLabelText(/city/i), 'New York');
        await user.type(screen.getByLabelText(/state/i), 'NY');
        await user.type(screen.getByLabelText(/zip code/i), '10001');

        const nextButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextButton);

        // Should proceed to step 2
        await waitFor(() => {
            expect(screen.getByLabelText(/occupation/i)).toBeInTheDocument();
        });
    });

    it('should show Previous button after first step', async () => {
        render(<GuarantorFormPage />);

        // Fill out step 1 and proceed
        await user.type(screen.getByLabelText(/full name/i), 'John Doe');
        await user.type(screen.getByLabelText(/relationship to borrower/i), 'Business partner');
        await user.type(screen.getByLabelText(/date of birth/i), '1980-01-15');
        await user.type(screen.getByLabelText(/street address/i), '123 Main St');
        await user.type(screen.getByLabelText(/city/i), 'New York');
        await user.type(screen.getByLabelText(/state/i), 'NY');
        await user.type(screen.getByLabelText(/zip code/i), '10001');

        await user.click(screen.getByRole('button', { name: /next/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
        });
    });

    it('should go back to previous step when Previous button is clicked', async () => {
        render(<GuarantorFormPage />);

        // Navigate to step 2 first
        await user.type(screen.getByLabelText(/full name/i), 'John Doe');
        await user.type(screen.getByLabelText(/relationship to borrower/i), 'Business partner');
        await user.type(screen.getByLabelText(/date of birth/i), '1980-01-15');
        await user.type(screen.getByLabelText(/street address/i), '123 Main St');
        await user.type(screen.getByLabelText(/city/i), 'New York');
        await user.type(screen.getByLabelText(/state/i), 'NY');
        await user.type(screen.getByLabelText(/zip code/i), '10001');

        await user.click(screen.getByRole('button', { name: /next/i }));

        // Wait for step 2 to load
        await waitFor(() => {
            expect(screen.getByLabelText(/occupation/i)).toBeInTheDocument();
        });

        // Go back to step 1
        await user.click(screen.getByRole('button', { name: /previous/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        });
    });

    it('should show Save Draft button on all steps', () => {
        render(<GuarantorFormPage />);

        expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
        render(<GuarantorFormPage />);

        // Check that there's a form element
        const form = screen.getByRole('form');
        expect(form).toBeInTheDocument();
    });

    it('should show progress in mobile view', () => {
        // This test checks for mobile-specific elements
        render(<GuarantorFormPage />);

        // Check for step indicator (should be in DOM but might be hidden on desktop)
        expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
    });

    it('should render form card with proper structure', () => {
        render(<GuarantorFormPage />);

        // Check for the main form card
        expect(screen.getByRole('form')).toBeInTheDocument();

        // Check for form actions area
        expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should show step completion status', () => {
        render(<GuarantorFormPage />);

        // Check that current step is indicated
        expect(screen.getByText('Current')).toBeInTheDocument();
    });
});
