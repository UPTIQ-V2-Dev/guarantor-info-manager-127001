import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, MapPinIcon, UserIcon } from 'lucide-react';
import type { GuarantorFormData } from '@/types/guarantor';

export const PersonalInfoStep = () => {
    const {
        register,
        formState: { errors },
        watch
    } = useFormContext<GuarantorFormData>();

    const dateOfBirth = watch('date_of_birth');

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <UserIcon className='h-5 w-5' />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='md:col-span-2'>
                            <Label htmlFor='guarantor_name'>
                                Full Name <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='guarantor_name'
                                {...register('guarantor_name')}
                                placeholder='Enter full legal name'
                                className={errors.guarantor_name ? 'border-red-500' : ''}
                            />
                            {errors.guarantor_name && (
                                <p className='text-sm text-red-500 mt-1'>{errors.guarantor_name.message}</p>
                            )}
                            <p className='text-sm text-gray-600 mt-1'>
                                Enter the full legal name as it appears on official documents
                            </p>
                        </div>

                        <div className='md:col-span-2'>
                            <Label htmlFor='relationship_to_borrower'>
                                Relationship to Borrower <span className='text-red-500'>*</span>
                            </Label>
                            <Textarea
                                id='relationship_to_borrower'
                                {...register('relationship_to_borrower')}
                                placeholder='e.g., Business partner and co-owner, Personal guarantor for XYZ LLC'
                                className={errors.relationship_to_borrower ? 'border-red-500' : ''}
                                rows={2}
                            />
                            {errors.relationship_to_borrower && (
                                <p className='text-sm text-red-500 mt-1'>{errors.relationship_to_borrower.message}</p>
                            )}
                            <p className='text-sm text-gray-600 mt-1'>
                                Describe the nature of the relationship and context
                            </p>
                        </div>

                        <div>
                            <Label htmlFor='date_of_birth'>
                                Date of Birth <span className='text-red-500'>*</span>
                            </Label>
                            <div className='relative'>
                                <Input
                                    id='date_of_birth'
                                    type='date'
                                    {...register('date_of_birth')}
                                    className={errors.date_of_birth ? 'border-red-500' : ''}
                                />
                                <CalendarIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                            </div>
                            {errors.date_of_birth && (
                                <p className='text-sm text-red-500 mt-1'>{errors.date_of_birth.message}</p>
                            )}
                            {dateOfBirth && (
                                <p className='text-sm text-gray-600 mt-1'>
                                    Age: {new Date().getFullYear() - new Date(dateOfBirth).getFullYear()} years
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <MapPinIcon className='h-5 w-5' />
                        Address Information
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div>
                        <Label htmlFor='address.street'>
                            Street Address <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                            id='address.street'
                            {...register('address.street')}
                            placeholder='Enter street address'
                            className={errors.address?.street ? 'border-red-500' : ''}
                        />
                        {errors.address?.street && (
                            <p className='text-sm text-red-500 mt-1'>{errors.address.street.message}</p>
                        )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div>
                            <Label htmlFor='address.city'>
                                City <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='address.city'
                                {...register('address.city')}
                                placeholder='Enter city'
                                className={errors.address?.city ? 'border-red-500' : ''}
                            />
                            {errors.address?.city && (
                                <p className='text-sm text-red-500 mt-1'>{errors.address.city.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor='address.state'>
                                State <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='address.state'
                                {...register('address.state')}
                                placeholder='Enter state'
                                className={errors.address?.state ? 'border-red-500' : ''}
                            />
                            {errors.address?.state && (
                                <p className='text-sm text-red-500 mt-1'>{errors.address.state.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor='address.zip'>
                                ZIP Code <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='address.zip'
                                {...register('address.zip')}
                                placeholder='12345 or 12345-6789'
                                className={errors.address?.zip ? 'border-red-500' : ''}
                            />
                            {errors.address?.zip && (
                                <p className='text-sm text-red-500 mt-1'>{errors.address.zip.message}</p>
                            )}
                        </div>
                    </div>

                    <p className='text-sm text-gray-600'>Provide the primary residential or business address</p>
                </CardContent>
            </Card>
        </div>
    );
};
