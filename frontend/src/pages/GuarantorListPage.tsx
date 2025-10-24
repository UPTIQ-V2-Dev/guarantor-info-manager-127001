import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
    SearchIcon,
    FilterIcon,
    PlusIcon,
    DownloadIcon,
    UsersIcon,
    EyeIcon,
    MoreHorizontalIcon,
    RefreshCcwIcon,
    CalendarIcon
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useGuarantors, useExportGuarantors } from '@/hooks/useGuarantor';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import type { GuarantorSearchFilters, GuarantorStatus, GuarantorSubmission } from '@/types/guarantor';

const statusOptions: { value: GuarantorStatus; label: string; color: string }[] = [
    { value: 'pending_verification', label: 'Pending Verification', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_review', label: 'In Review', color: 'bg-blue-100 text-blue-800' },
    { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' }
];

const StatusBadge = ({ status }: { status: GuarantorStatus }) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    return (
        <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>{statusConfig?.label || status}</Badge>
    );
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const GuarantorRow = ({ guarantor }: { guarantor: GuarantorSubmission }) => {
    return (
        <TableRow className='hover:bg-gray-50'>
            <TableCell className='font-medium'>
                <div>
                    <p className='font-semibold'>{guarantor.guarantor_name}</p>
                    <p className='text-sm text-gray-600 truncate max-w-48'>{guarantor.relationship_to_borrower}</p>
                </div>
            </TableCell>
            <TableCell>
                <div className='text-sm'>
                    <p>{guarantor.occupation}</p>
                    <p className='text-gray-600'>{guarantor.employer_or_business}</p>
                </div>
            </TableCell>
            <TableCell>
                <div className='text-sm'>
                    <p>
                        {guarantor.address.city}, {guarantor.address.state}
                    </p>
                    <p className='text-gray-600'>{guarantor.address.zip}</p>
                </div>
            </TableCell>
            <TableCell>
                <StatusBadge status={guarantor.record_status} />
            </TableCell>
            <TableCell>
                <div className='text-sm'>
                    <p>{formatDate(guarantor.submission_timestamp)}</p>
                    <p className='text-gray-600'>by {guarantor.submitted_by}</p>
                </div>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant='ghost'
                            size='sm'
                        >
                            <MoreHorizontalIcon className='h-4 w-4' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                            <Link to={`/guarantors/${guarantor.id}`}>
                                <EyeIcon className='mr-2 h-4 w-4' />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
};

export const GuarantorListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<GuarantorStatus | 'all'>('all');
    const [sortBy] = useState('submission_timestamp');
    const [sortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filters: GuarantorSearchFilters = useMemo(
        () => ({
            search: debouncedSearchTerm,
            status: statusFilter === 'all' ? undefined : [statusFilter],
            sortBy,
            sortOrder,
            page,
            limit
        }),
        [debouncedSearchTerm, statusFilter, sortBy, sortOrder, page, limit]
    );

    const { data: guarantorsResponse, isLoading, error, refetch } = useGuarantors(filters);

    const exportMutation = useExportGuarantors();

    const handleExport = async (format: 'csv' | 'xlsx' | 'json' = 'csv') => {
        try {
            const blob = await exportMutation.mutateAsync({ filters, format });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `guarantors-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Guarantors exported as ${format.toUpperCase()}`);
        } catch {
            toast.error('Failed to export guarantors');
        }
    };

    const handleRefresh = () => {
        refetch();
        toast.success('Data refreshed');
    };

    const guarantors = guarantorsResponse?.results || [];
    const totalResults = guarantorsResponse?.totalResults || 0;
    const totalPages = guarantorsResponse?.totalPages || 0;

    if (error) {
        return (
            <div className='min-h-screen bg-gray-50 py-8'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <Card className='border-red-200 bg-red-50'>
                        <CardContent className='p-6 text-center'>
                            <p className='text-red-600'>Failed to load guarantors. Please try again.</p>
                            <Button
                                onClick={handleRefresh}
                                className='mt-4'
                            >
                                <RefreshCcwIcon className='mr-2 h-4 w-4' />
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Page Header */}
                <div className='mb-8'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                        <div className='flex items-center gap-3'>
                            <UsersIcon className='h-8 w-8 text-blue-600' />
                            <div>
                                <h1 className='text-3xl font-bold text-gray-900'>Guarantor Submissions</h1>
                                <p className='text-gray-600 mt-1'>Manage and track guarantor background information</p>
                            </div>
                        </div>
                        <div className='flex gap-2'>
                            <Button
                                onClick={handleRefresh}
                                variant='outline'
                            >
                                <RefreshCcwIcon className='mr-2 h-4 w-4' />
                                Refresh
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='outline'>
                                        <DownloadIcon className='mr-2 h-4 w-4' />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                                        Export as CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                                        Export as Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('json')}>
                                        Export as JSON
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button asChild>
                                <Link to='/guarantors/new'>
                                    <PlusIcon className='mr-2 h-4 w-4' />
                                    New Guarantor
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <FilterIcon className='h-5 w-5' />
                            Search & Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-col md:flex-row gap-4'>
                            <div className='flex-1'>
                                <div className='relative'>
                                    <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                                    <Input
                                        placeholder='Search by name, occupation, or employer...'
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className='pl-10'
                                    />
                                </div>
                            </div>
                            <div className='md:w-48'>
                                <Select
                                    value={statusFilter}
                                    onValueChange={value => setStatusFilter(value as GuarantorStatus | 'all')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Filter by status' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='all'>All Status</SelectItem>
                                        {statusOptions.map(option => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {(searchTerm || statusFilter !== 'all') && (
                            <div className='flex items-center justify-between mt-4 pt-4 border-t'>
                                <p className='text-sm text-gray-600'>
                                    {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                                </p>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results Table */}
                <Card>
                    <CardContent className='p-0'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name & Relationship</TableHead>
                                    <TableHead>Professional Info</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>
                                        <div className='flex items-center gap-1'>
                                            <CalendarIcon className='h-4 w-4' />
                                            Submitted
                                        </div>
                                    </TableHead>
                                    <TableHead className='w-12'></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    // Loading skeletons
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <div className='space-y-2'>
                                                    <Skeleton className='h-4 w-32' />
                                                    <Skeleton className='h-3 w-48' />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='space-y-2'>
                                                    <Skeleton className='h-4 w-24' />
                                                    <Skeleton className='h-3 w-32' />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='space-y-2'>
                                                    <Skeleton className='h-4 w-20' />
                                                    <Skeleton className='h-3 w-16' />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className='h-6 w-20' />
                                            </TableCell>
                                            <TableCell>
                                                <div className='space-y-2'>
                                                    <Skeleton className='h-4 w-20' />
                                                    <Skeleton className='h-3 w-16' />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className='h-8 w-8' />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : guarantors.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className='text-center py-8'
                                        >
                                            <div className='flex flex-col items-center gap-3'>
                                                <UsersIcon className='h-12 w-12 text-gray-400' />
                                                <div>
                                                    <p className='text-gray-500 font-medium'>No guarantors found</p>
                                                    <p className='text-gray-400 text-sm mt-1'>
                                                        {searchTerm || statusFilter !== 'all'
                                                            ? 'Try adjusting your search criteria'
                                                            : 'Get started by adding a new guarantor'}
                                                    </p>
                                                </div>
                                                {!searchTerm && statusFilter === 'all' && (
                                                    <Button
                                                        asChild
                                                        className='mt-2'
                                                    >
                                                        <Link to='/guarantors/new'>
                                                            <PlusIcon className='mr-2 h-4 w-4' />
                                                            Add New Guarantor
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    guarantors.map(guarantor => (
                                        <GuarantorRow
                                            key={guarantor.id}
                                            guarantor={guarantor}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className='flex justify-center gap-2 mt-6'>
                        <Button
                            variant='outline'
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <div className='flex items-center gap-1'>
                            <span className='text-sm text-gray-600'>
                                Page {page} of {totalPages}
                            </span>
                        </div>
                        <Button
                            variant='outline'
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
