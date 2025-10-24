import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    UserIcon,
    MapPinIcon,
    BriefcaseIcon,
    UsersIcon,
    MessageCircleIcon,
    EditIcon,
    CalendarIcon
} from 'lucide-react';
import type { GuarantorFormData } from '@/types/guarantor';

interface ReviewStepProps {
    onEditStep: (step: number) => void;
}

export const ReviewStep = ({ onEditStep }: ReviewStepProps) => {
    const { watch } = useFormContext<GuarantorFormData>();
    const formData = watch();

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not provided';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateAge = (dateOfBirth: string) => {
        if (!dateOfBirth) return 'Unknown';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return `${age} years old`;
    };

    return (
        <div className='space-y-6'>
            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2'>
                            <UserIcon className='h-5 w-5' />
                            Personal Information
                        </CardTitle>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onEditStep(1)}
                            className='flex items-center gap-1'
                        >
                            <EditIcon className='h-3 w-3' />
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <h4 className='font-medium text-sm text-gray-600 mb-1'>Full Name</h4>
                            <p className='text-lg font-medium'>{formData.guarantor_name || 'Not provided'}</p>
                        </div>

                        <div>
                            <h4 className='font-medium text-sm text-gray-600 mb-1'>Date of Birth</h4>
                            <div className='flex items-center gap-2'>
                                <CalendarIcon className='h-4 w-4 text-gray-500' />
                                <span>{formatDate(formData.date_of_birth)}</span>
                                {formData.date_of_birth && (
                                    <Badge
                                        variant='secondary'
                                        className='text-xs'
                                    >
                                        {calculateAge(formData.date_of_birth)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className='font-medium text-sm text-gray-600 mb-1'>Relationship to Borrower</h4>
                        <p className='text-gray-900'>{formData.relationship_to_borrower || 'Not provided'}</p>
                    </div>

                    <Separator />

                    <div>
                        <h4 className='font-medium text-sm text-gray-600 mb-2 flex items-center gap-1'>
                            <MapPinIcon className='h-4 w-4' />
                            Address
                        </h4>
                        {formData.address ? (
                            <div className='bg-gray-50 rounded-lg p-3'>
                                <p className='text-gray-900'>{formData.address.street || 'Street not provided'}</p>
                                <p className='text-gray-700'>
                                    {[formData.address.city, formData.address.state, formData.address.zip]
                                        .filter(Boolean)
                                        .join(', ') || 'City, State, ZIP not provided'}
                                </p>
                            </div>
                        ) : (
                            <p className='text-gray-500 italic'>Address not provided</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2'>
                            <BriefcaseIcon className='h-5 w-5' />
                            Professional Information
                        </CardTitle>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onEditStep(2)}
                            className='flex items-center gap-1'
                        >
                            <EditIcon className='h-3 w-3' />
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <h4 className='font-medium text-sm text-gray-600 mb-1'>Occupation</h4>
                            <p className='text-gray-900'>{formData.occupation || 'Not provided'}</p>
                        </div>

                        <div>
                            <h4 className='font-medium text-sm text-gray-600 mb-1'>Employer/Business</h4>
                            <p className='text-gray-900'>{formData.employer_or_business || 'Not provided'}</p>
                        </div>
                    </div>

                    {(formData.linkedin_profile || formData.company_registration_number) && (
                        <>
                            <Separator />
                            <div className='space-y-3'>
                                {formData.linkedin_profile && (
                                    <div>
                                        <h4 className='font-medium text-sm text-gray-600 mb-1'>LinkedIn Profile</h4>
                                        <a
                                            href={formData.linkedin_profile}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-600 hover:text-blue-500 underline break-all'
                                        >
                                            {formData.linkedin_profile}
                                        </a>
                                    </div>
                                )}

                                {formData.company_registration_number && (
                                    <div>
                                        <h4 className='font-medium text-sm text-gray-600 mb-1'>
                                            Company Registration Number
                                        </h4>
                                        <Badge
                                            variant='outline'
                                            className='font-mono'
                                        >
                                            {formData.company_registration_number}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Associations */}
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2'>
                            <UsersIcon className='h-5 w-5' />
                            Associations & Comments
                        </CardTitle>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onEditStep(3)}
                            className='flex items-center gap-1'
                        >
                            <EditIcon className='h-3 w-3' />
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div>
                        <h4 className='font-medium text-sm text-gray-600 mb-2'>Known Associations</h4>
                        {formData.known_associations && formData.known_associations.length > 0 ? (
                            <div className='flex flex-wrap gap-2'>
                                {formData.known_associations.map((association, index) => (
                                    <Badge
                                        key={index}
                                        variant='secondary'
                                    >
                                        {association}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className='text-gray-500 italic'>No associations provided</p>
                        )}
                    </div>

                    {formData.comments && (
                        <>
                            <Separator />
                            <div>
                                <h4 className='font-medium text-sm text-gray-600 mb-2 flex items-center gap-1'>
                                    <MessageCircleIcon className='h-4 w-4' />
                                    Additional Comments
                                </h4>
                                <div className='bg-gray-50 rounded-lg p-3'>
                                    <p className='text-gray-900 whitespace-pre-wrap'>{formData.comments}</p>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Submission Summary */}
            <Card className='border-green-200 bg-green-50'>
                <CardHeader>
                    <CardTitle className='text-green-800'>Ready to Submit</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3'>
                        <p className='text-green-700'>
                            Please review all information above before submitting. Once submitted, this guarantor
                            information will be:
                        </p>
                        <ul className='list-disc list-inside text-green-700 space-y-1 text-sm'>
                            <li>Saved to the database with a unique record ID</li>
                            <li>Available for background verification processing</li>
                            <li>Accessible for future reference and updates</li>
                            <li>Formatted as structured JSON for system integration</li>
                        </ul>

                        <div className='bg-white border border-green-200 rounded-lg p-3 mt-4'>
                            <h5 className='font-medium text-green-800 mb-1'>Submission Metadata</h5>
                            <div className='text-sm text-green-700 space-y-1'>
                                <p>• Submission Date: {new Date().toLocaleString()}</p>
                                <p>• Status: Pending Verification</p>
                                <p>• Submitted By: Current User</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
