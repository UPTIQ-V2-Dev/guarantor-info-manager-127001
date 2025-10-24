import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseIcon, BuildingIcon, LinkedinIcon } from 'lucide-react';
import type { GuarantorFormData } from '@/types/guarantor';

export const ProfessionalStep = () => {
    const {
        register,
        formState: { errors },
        watch
    } = useFormContext<GuarantorFormData>();

    const linkedinProfile = watch('linkedin_profile');
    const companyRegNumber = watch('company_registration_number');

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <BriefcaseIcon className='h-5 w-5' />
                        Employment Information
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <Label htmlFor='occupation'>
                                Occupation / Job Title <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='occupation'
                                {...register('occupation')}
                                placeholder='e.g., Real Estate Investor, Software Engineer'
                                className={errors.occupation ? 'border-red-500' : ''}
                            />
                            {errors.occupation && (
                                <p className='text-sm text-red-500 mt-1'>{errors.occupation.message}</p>
                            )}
                            <p className='text-sm text-gray-600 mt-1'>Primary occupation or job title</p>
                        </div>

                        <div>
                            <Label htmlFor='employer_or_business'>
                                Employer / Business Name <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='employer_or_business'
                                {...register('employer_or_business')}
                                placeholder='e.g., Davis Capital Group, Tech Solutions LLC'
                                className={errors.employer_or_business ? 'border-red-500' : ''}
                            />
                            {errors.employer_or_business && (
                                <p className='text-sm text-red-500 mt-1'>{errors.employer_or_business.message}</p>
                            )}
                            <p className='text-sm text-gray-600 mt-1'>Current employer or business entity</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <BuildingIcon className='h-5 w-5' />
                        Business Information
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div>
                        <Label htmlFor='company_registration_number'>Company Registration Number / EIN</Label>
                        <Input
                            id='company_registration_number'
                            {...register('company_registration_number')}
                            placeholder='e.g., AZ-12345678, 12-3456789'
                            className={errors.company_registration_number ? 'border-red-500' : ''}
                        />
                        {errors.company_registration_number && (
                            <p className='text-sm text-red-500 mt-1'>{errors.company_registration_number.message}</p>
                        )}
                        <p className='text-sm text-gray-600 mt-1'>
                            Optional - Employer Identification Number or state registration number (if self-employed)
                        </p>
                        {companyRegNumber && (
                            <div className='mt-2 p-2 bg-blue-50 rounded-md'>
                                <p className='text-sm text-blue-700'>Registration Number: {companyRegNumber}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <LinkedinIcon className='h-5 w-5' />
                        Professional Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div>
                        <Label htmlFor='linkedin_profile'>LinkedIn Profile URL</Label>
                        <Input
                            id='linkedin_profile'
                            {...register('linkedin_profile')}
                            placeholder='https://www.linkedin.com/in/your-profile'
                            className={errors.linkedin_profile ? 'border-red-500' : ''}
                        />
                        {errors.linkedin_profile && (
                            <p className='text-sm text-red-500 mt-1'>{errors.linkedin_profile.message}</p>
                        )}
                        <p className='text-sm text-gray-600 mt-1'>
                            Optional - Professional LinkedIn profile for verification purposes
                        </p>
                        {linkedinProfile && linkedinProfile.includes('linkedin.com') && (
                            <div className='mt-2 p-2 bg-green-50 rounded-md'>
                                <p className='text-sm text-green-700'>✓ Valid LinkedIn URL format</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
                <h4 className='font-medium text-amber-800 mb-2'>Professional Information Guidelines</h4>
                <ul className='text-sm text-amber-700 space-y-1'>
                    <li>• Provide accurate employment information for verification purposes</li>
                    <li>• Company registration numbers help verify business legitimacy</li>
                    <li>• LinkedIn profiles provide additional professional context</li>
                    <li>• All information will be used for background verification only</li>
                </ul>
            </div>
        </div>
    );
};
