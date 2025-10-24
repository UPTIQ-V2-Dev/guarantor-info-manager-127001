import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { act } from 'react';

// React 19 compatibility for Testing Library
// Patch react-dom/test-utils to use React.act instead of its own
vi.mock('react-dom/test-utils', async () => {
    const actual = await vi.importActual('react-dom/test-utils');
    return {
        ...actual,
        act: act
    };
});

// Mock environment variable for tests
vi.stubEnv('VITE_USE_MOCK_DATA', 'true');

// Cleanup after each test case
afterEach(() => {
    cleanup();
});
