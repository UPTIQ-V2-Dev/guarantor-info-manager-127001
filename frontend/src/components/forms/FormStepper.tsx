import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckIcon } from 'lucide-react';

interface Step {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
}

interface FormStepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (stepId: number) => void;
}

export const FormStepper = ({ steps, currentStep, onStepClick }: FormStepperProps) => {
    return (
        <div className='w-full'>
            {/* Desktop Stepper */}
            <div className='hidden md:block'>
                <div className='flex items-center justify-between mb-8'>
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className='flex items-center flex-1'
                        >
                            <div className='flex items-center'>
                                {/* Step Circle */}
                                <button
                                    onClick={() => onStepClick?.(step.id)}
                                    disabled={!onStepClick}
                                    className={cn(
                                        'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                                        step.isCompleted && 'bg-green-600 border-green-600 text-white',
                                        currentStep === step.id &&
                                            !step.isCompleted &&
                                            'border-blue-600 bg-blue-50 text-blue-600',
                                        currentStep !== step.id &&
                                            !step.isCompleted &&
                                            'border-gray-300 bg-gray-50 text-gray-500',
                                        onStepClick && 'cursor-pointer hover:border-blue-400'
                                    )}
                                >
                                    {step.isCompleted ? (
                                        <CheckIcon className='w-5 h-5' />
                                    ) : (
                                        <span className='text-sm font-medium'>{step.id}</span>
                                    )}
                                </button>

                                {/* Step Info */}
                                <div className='ml-3'>
                                    <div className='flex items-center gap-2'>
                                        <h3
                                            className={cn(
                                                'text-sm font-medium',
                                                currentStep === step.id && 'text-blue-600',
                                                step.isCompleted && 'text-green-600',
                                                currentStep !== step.id && !step.isCompleted && 'text-gray-500'
                                            )}
                                        >
                                            {step.title}
                                        </h3>
                                        {currentStep === step.id && (
                                            <Badge
                                                variant='secondary'
                                                className='text-xs'
                                            >
                                                Current
                                            </Badge>
                                        )}
                                        {step.isCompleted && (
                                            <Badge
                                                variant='default'
                                                className='text-xs bg-green-100 text-green-800'
                                            >
                                                Complete
                                            </Badge>
                                        )}
                                    </div>
                                    <p className='text-xs text-gray-600 mt-1'>{step.description}</p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'flex-1 h-px mx-4',
                                        step.isCompleted ? 'bg-green-300' : 'bg-gray-300'
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Stepper */}
            <div className='md:hidden mb-6'>
                <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-lg font-semibold'>
                        Step {currentStep} of {steps.length}
                    </h2>
                    <div className='flex space-x-1'>
                        {steps.map(step => (
                            <div
                                key={step.id}
                                className={cn(
                                    'w-2 h-2 rounded-full',
                                    step.isCompleted && 'bg-green-600',
                                    currentStep === step.id && !step.isCompleted && 'bg-blue-600',
                                    currentStep !== step.id && !step.isCompleted && 'bg-gray-300'
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Current Step Info */}
                <div className='bg-gray-50 rounded-lg p-4'>
                    <div className='flex items-center gap-2 mb-1'>
                        <h3 className='font-medium text-blue-600'>{steps.find(s => s.id === currentStep)?.title}</h3>
                        <Badge
                            variant='secondary'
                            className='text-xs'
                        >
                            Step {currentStep}
                        </Badge>
                    </div>
                    <p className='text-sm text-gray-600'>{steps.find(s => s.id === currentStep)?.description}</p>
                </div>

                {/* Progress Bar */}
                <div className='mt-4'>
                    <div className='flex justify-between text-xs text-gray-600 mb-1'>
                        <span>Progress</span>
                        <span>{Math.round((currentStep / steps.length) * 100)}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${(currentStep / steps.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
