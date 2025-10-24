import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UsersIcon, MessageCircleIcon, PlusIcon, XIcon } from 'lucide-react';
import type { GuarantorFormData } from '@/types/guarantor';

export const AssociationsStep = () => {
    const [newAssociation, setNewAssociation] = useState('');

    const {
        register,
        formState: { errors },
        watch,
        setValue,
        getValues
    } = useFormContext<GuarantorFormData>();

    const associations = watch('known_associations') || [];
    const comments = watch('comments');

    const handleAddAssociation = () => {
        if (newAssociation.trim() && newAssociation.length >= 2) {
            const currentAssociations = getValues('known_associations') || [];
            setValue('known_associations', [...currentAssociations, newAssociation.trim()]);
            setNewAssociation('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddAssociation();
        }
    };

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <UsersIcon className='h-5 w-5' />
                        Known Associations & Affiliations
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div>
                        <Label htmlFor='new_association'>
                            Add Business Associations, Board Memberships, Organizations
                        </Label>
                        <div className='flex gap-2'>
                            <Input
                                id='new_association'
                                value={newAssociation}
                                onChange={e => setNewAssociation(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder='e.g., Phoenix Real Estate Association, Chamber of Commerce'
                                className='flex-1'
                            />
                            <Button
                                type='button'
                                onClick={handleAddAssociation}
                                disabled={!newAssociation.trim() || newAssociation.length < 2}
                                size='sm'
                            >
                                <PlusIcon className='h-4 w-4' />
                                Add
                            </Button>
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>
                            Add professional associations, board memberships, or organizations the guarantor belongs to
                        </p>
                    </div>

                    {associations.length > 0 && (
                        <div>
                            <Label className='mb-2 block'>Current Associations</Label>
                            <div className='flex flex-wrap gap-2'>
                                {associations.map((association, index) => (
                                    <Badge
                                        key={index}
                                        variant='secondary'
                                        className='flex items-center gap-1 pr-1'
                                    >
                                        <span>{association}</span>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                const currentAssociations = getValues('known_associations') || [];
                                                const updated = currentAssociations.filter((_, i) => i !== index);
                                                setValue('known_associations', updated);
                                            }}
                                            className='ml-1 hover:bg-red-100 rounded-full p-0.5'
                                        >
                                            <XIcon className='h-3 w-3' />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            {errors.known_associations && (
                                <p className='text-sm text-red-500 mt-1'>{errors.known_associations.message}</p>
                            )}
                        </div>
                    )}

                    {associations.length === 0 && (
                        <div className='border-2 border-dashed border-gray-200 rounded-lg p-6 text-center'>
                            <UsersIcon className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                            <p className='text-gray-500 text-sm'>
                                No associations added yet. Add business associations, board memberships, or professional
                                organizations.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <MessageCircleIcon className='h-5 w-5' />
                        Additional Comments & Notes
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div>
                        <Label htmlFor='comments'>Loan Officer Comments</Label>
                        <Textarea
                            id='comments'
                            {...register('comments')}
                            placeholder='Add any additional notes or context about the guarantor, their relationship to the borrower, or special considerations...'
                            rows={4}
                            className={errors.comments ? 'border-red-500' : ''}
                        />
                        {errors.comments && <p className='text-sm text-red-500 mt-1'>{errors.comments.message}</p>}
                        <div className='flex justify-between text-sm text-gray-600 mt-1'>
                            <span>Optional - Additional context or notes</span>
                            <span>{comments?.length || 0}/1000 characters</span>
                        </div>
                    </div>

                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                        <h4 className='font-medium text-blue-800 mb-2'>Helpful Information to Include</h4>
                        <ul className='text-sm text-blue-700 space-y-1'>
                            <li>• Primary contact role for the borrower</li>
                            <li>• Credit history or financial standing knowledge</li>
                            <li>• Duration and nature of relationship</li>
                            <li>• Any special circumstances or considerations</li>
                            <li>• Previous guarantee or loan experience</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <h4 className='font-medium text-green-800 mb-2'>Review Before Proceeding</h4>
                <p className='text-sm text-green-700'>
                    You've completed the core guarantor information. In the next step, you can optionally upload
                    supporting documents such as identification, proof of address, or business certificates to
                    strengthen the background verification process.
                </p>
            </div>
        </div>
    );
};
