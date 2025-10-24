import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FormStepper } from '@/components/forms/FormStepper';
import { PersonalInfoStep } from '@/components/forms/PersonalInfoStep';
import { ProfessionalStep } from '@/components/forms/ProfessionalStep';
import { AssociationsStep } from '@/components/forms/AssociationsStep';
import { AttachmentsStep } from '@/components/forms/AttachmentsStep';
import { ReviewStep } from '@/components/forms/ReviewStep';
import { useCreateGuarantor } from '@/hooks/useGuarantor';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { guarantorFormSchema, validateStep, cleanFormData } from '@/utils/validation';
import { ArrowLeftIcon, ArrowRightIcon, SaveIcon, SendIcon, UserPlusIcon } from 'lucide-react';
import type { GuarantorFormData } from '@/types/guarantor';

const FORM_STEPS = [
    {
        id: 1,
        title: 'Personal Info',
        description: 'Name, relationship, address, and date of birth',
        isCompleted: false
    },
    {
        id: 2,
        title: 'Professional',
        description: 'Occupation, employer, and business information',
        isCompleted: false
    },
    {
        id: 3,
        title: 'Associations',
        description: 'Known associations and additional comments',
        isCompleted: false
    },
    {
        id: 4,
        title: 'Attachments',
        description: 'Upload supporting documents (optional)',
        isCompleted: false
    },
    {
        id: 5,
        title: 'Review',
        description: 'Review and submit guarantor information',
        isCompleted: false
    }
];

const DRAFT_STORAGE_KEY = 'guarantor-form-draft';

export const GuarantorFormPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Draft management
    const [draftData, setDraftData] = useLocalStorage<Partial<GuarantorFormData>>(DRAFT_STORAGE_KEY, {});

    // Form setup
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
            ...draftData
        },
        mode: 'onChange'
    });

    const { watch, trigger, getValues, reset } = form;
    const createGuarantorMutation = useCreateGuarantor();

    // Watch form data for auto-save
    const formData = watch();

    // Auto-save draft
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const currentData = getValues();
            setDraftData({ ...currentData, isDraft: true });
        }, 2000); // Save after 2 seconds of inactivity

        return () => clearTimeout(timeoutId);
    }, [formData, getValues, setDraftData]);

    // Update completed steps based on validation
    useEffect(() => {
        const updateCompletedSteps = async () => {
            const newCompletedSteps: number[] = [];
            const currentData = getValues();

            // Check each step
            for (let step = 1; step <= 3; step++) {
                if (validateStep(step, currentData)) {
                    newCompletedSteps.push(step);
                }
            }

            // Step 4 (attachments) is always considered complete since it's optional
            newCompletedSteps.push(4);

            setCompletedSteps(newCompletedSteps);
        };

        updateCompletedSteps();
    }, [formData, getValues]);

    const steps = FORM_STEPS.map(step => ({
        ...step,
        isCompleted: completedSteps.includes(step.id)
    }));

    const canProceed = (step: number): boolean => {
        return validateStep(step, getValues());
    };

    const handleNext = async () => {
        if (currentStep >= 5) return;

        // Validate current step before proceeding
        if (currentStep <= 3) {
            const isValid = await trigger();
            if (!isValid || !canProceed(currentStep)) {
                toast.error(`Please complete all required fields in this step`);
                return;
            }
        }

        setCurrentStep(prev => Math.min(prev + 1, 5));
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleStepClick = (stepId: number) => {
        // Allow navigation to completed steps or current step
        if (stepId <= Math.max(...completedSteps, currentStep)) {
            setCurrentStep(stepId);
        }
    };

    const handleSaveDraft = () => {
        const currentData = getValues();
        setDraftData({ ...cleanFormData(currentData), isDraft: true });
        toast.success('Draft saved successfully');
    };

    const handleSubmit = async (data: GuarantorFormData) => {
        setIsSubmitting(true);

        try {
            const cleanedData = cleanFormData(data);
            const submissionData = {
                ...cleanedData,
                known_associations: cleanedData.known_associations || [],
                comments: cleanedData.comments || '',
                linkedin_profile: cleanedData.linkedin_profile || '',
                company_registration_number: cleanedData.company_registration_number || ''
            };

            const result = await createGuarantorMutation.mutateAsync(submissionData);

            // Clear draft
            setDraftData({});

            toast.success('Guarantor information submitted successfully!');
            navigate('/guarantors', {
                state: {
                    message: 'Guarantor created successfully',
                    guarantorId: result.id
                }
            });
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Failed to submit guarantor information. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearDraft = () => {
        setDraftData({});
        reset();
        setCurrentStep(1);
        toast.success('Form cleared successfully');
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <PersonalInfoStep />;
            case 2:
                return <ProfessionalStep />;
            case 3:
                return <AssociationsStep />;
            case 4:
                return <AttachmentsStep />;
            case 5:
                return <ReviewStep onEditStep={setCurrentStep} />;
            default:
                return <PersonalInfoStep />;
        }
    };

    const isLastStep = currentStep === 5;
    const isFirstStep = currentStep === 1;

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Page Header */}
                <div className='mb-8'>
                    <div className='flex items-center gap-3 mb-4'>
                        <UserPlusIcon className='h-8 w-8 text-blue-600' />
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900'>New Guarantor Submission</h1>
                            <p className='text-gray-600 mt-1'>
                                Collect guarantor background information for credit assessment
                            </p>
                        </div>
                    </div>

                    {draftData.isDraft && (
                        <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
                            <div className='flex justify-between items-center'>
                                <div className='flex items-center gap-2'>
                                    <SaveIcon className='h-4 w-4 text-amber-600' />
                                    <span className='text-sm text-amber-800'>Draft saved automatically</span>
                                </div>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={handleClearDraft}
                                    className='text-amber-700 border-amber-300'
                                >
                                    Clear Draft
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Stepper */}
                <FormStepper
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={handleStepClick}
                />

                {/* Form Content */}
                <FormProvider {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-6'
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>{FORM_STEPS.find(s => s.id === currentStep)?.title}</CardTitle>
                            </CardHeader>
                            <CardContent>{renderCurrentStep()}</CardContent>
                        </Card>

                        {/* Form Actions */}
                        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-white rounded-lg border'>
                            <div className='flex gap-2'>
                                {!isFirstStep && (
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={handlePrevious}
                                        className='flex items-center gap-2'
                                    >
                                        <ArrowLeftIcon className='h-4 w-4' />
                                        Previous
                                    </Button>
                                )}

                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleSaveDraft}
                                    className='flex items-center gap-2'
                                >
                                    <SaveIcon className='h-4 w-4' />
                                    Save Draft
                                </Button>
                            </div>

                            <div className='flex gap-2'>
                                {!isLastStep ? (
                                    <Button
                                        type='button'
                                        onClick={handleNext}
                                        className='flex items-center gap-2'
                                        disabled={currentStep <= 3 && !canProceed(currentStep)}
                                    >
                                        Next
                                        <ArrowRightIcon className='h-4 w-4' />
                                    </Button>
                                ) : (
                                    <Button
                                        type='submit'
                                        disabled={isSubmitting || createGuarantorMutation.isPending}
                                        className='flex items-center gap-2 bg-green-600 hover:bg-green-700'
                                    >
                                        {isSubmitting || createGuarantorMutation.isPending ? (
                                            <div className='h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                        ) : (
                                            <SendIcon className='h-4 w-4' />
                                        )}
                                        Submit for Verification
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
};
