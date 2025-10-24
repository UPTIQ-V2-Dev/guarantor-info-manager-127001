import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { GuarantorFormPage } from '@/pages/GuarantorFormPage';
import { GuarantorListPage } from '@/pages/GuarantorListPage';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 2,
            refetchOnWindowFocus: false
        },
        mutations: {
            retry: 1
        }
    }
});

export const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute='class'
                defaultTheme='system'
                enableSystem
            >
                <Router>
                    <div className='min-h-screen bg-background'>
                        <Routes>
                            {/* Redirect root to guarantors list */}
                            <Route
                                path='/'
                                element={
                                    <Navigate
                                        to='/guarantors'
                                        replace
                                    />
                                }
                            />

                            {/* Guarantor routes */}
                            <Route
                                path='/guarantors'
                                element={<GuarantorListPage />}
                            />
                            <Route
                                path='/guarantors/new'
                                element={<GuarantorFormPage />}
                            />

                            {/* Catch all route - redirect to guarantors */}
                            <Route
                                path='*'
                                element={
                                    <Navigate
                                        to='/guarantors'
                                        replace
                                    />
                                }
                            />
                        </Routes>
                    </div>

                    {/* Toast notifications */}
                    <Toaster
                        richColors
                        position='top-right'
                        expand={false}
                        visibleToasts={3}
                    />
                </Router>
            </ThemeProvider>
        </QueryClientProvider>
    );
};
