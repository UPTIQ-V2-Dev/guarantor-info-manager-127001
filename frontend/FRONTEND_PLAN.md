# Guarantor Background Information Collector - Implementation Plan

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Shadcn/ui** components with **Radix UI**
- **Tailwind CSS v4** for styling
- **React Hook Form** + **Zod** for form validation
- **React Router Dom** for navigation
- **TanStack Query** for data management
- **Axios** for API calls

## Application Architecture

### Core Pages & Features

#### 1. **Layout & Navigation** (`src/components/layout/`)

- **AppLayout.tsx** - Main layout with sidebar navigation
- **Header.tsx** - App header with user info and breadcrumbs
- **Sidebar.tsx** - Navigation menu (existing shadcn sidebar)
- **Breadcrumbs.tsx** - Dynamic page navigation

**Components:**

- Uses existing `src/components/ui/sidebar.tsx`
- Custom header and breadcrumb components

**API:** None required

---

#### 2. **Dashboard Page** (`src/pages/Dashboard/`)

- **DashboardPage.tsx** - Main dashboard container
- **StatsCards.tsx** - Summary metrics (total submissions, pending, completed)
- **RecentSubmissions.tsx** - Latest 5 guarantor submissions table
- **QuickActions.tsx** - CTA buttons (New Guarantor, Search, Export)

**Utils:**

- `src/utils/dashboard.ts` - Stats calculation helpers
- `src/utils/formatters.ts` - Date/status formatting

**Types:**

- `src/types/dashboard.ts` - Dashboard metrics interface

**API Endpoints:**

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/guarantors/recent` - Recent submissions

---

#### 3. **Guarantor Form Page** (`src/pages/GuarantorForm/`)

- **GuarantorFormPage.tsx** - Main form container with stepper
- **PersonalInfoStep.tsx** - Personal details section (name, DOB, address)
- **ProfessionalStep.tsx** - Employment and business info
- **AssociationsStep.tsx** - Known associations and notes
- **AttachmentsStep.tsx** - File uploads (optional)
- **ReviewStep.tsx** - Final review before submission

**Components:**

- **FormStepper.tsx** - Multi-step navigation component
- **AddressInput.tsx** - Composite address fields with validation
- **FileUpload.tsx** - Drag & drop file upload with preview
- **FormActions.tsx** - Save draft, submit, cancel buttons

**Utils:**

- `src/utils/validation.ts` - Custom Zod schemas for guarantor data
- `src/utils/form.ts` - Form state management helpers
- `src/utils/fileUpload.ts` - File handling and validation

**Types:**

- `src/types/guarantor.ts` - Complete guarantor data interfaces
- `src/types/form.ts` - Form state and validation types

**API Endpoints:**

- `POST /api/guarantors` - Create new guarantor submission
- `PUT /api/guarantors/:id` - Update draft submission
- `POST /api/guarantors/:id/attachments` - Upload files

---

#### 4. **Guarantor List Page** (`src/pages/GuarantorList/`)

- **GuarantorListPage.tsx** - Main list container with filters
- **GuarantorTable.tsx** - Data table with sorting/pagination
- **SearchFilters.tsx** - Name, status, date range filters
- **TableActions.tsx** - Bulk actions and export options

**Components:**

- **StatusBadge.tsx** - Status indicator component
- **DataTable.tsx** - Reusable table with shadcn/ui table
- **Pagination.tsx** - Custom pagination controls
- **ExportDialog.tsx** - Export format selection modal

**Utils:**

- `src/utils/search.ts` - Search and filter logic
- `src/utils/export.ts` - Data export functionality
- `src/utils/pagination.ts` - Pagination helpers

**Types:**

- `src/types/table.ts` - Table configuration interfaces
- `src/types/filters.ts` - Search filter types

**API Endpoints:**

- `GET /api/guarantors` - List guarantors with pagination/filters
- `POST /api/guarantors/export` - Generate export file

---

#### 5. **Guarantor Details Page** (`src/pages/GuarantorDetails/`)

- **GuarantorDetailsPage.tsx** - Main details container
- **InfoTabs.tsx** - Tabbed interface for different data sections
- **PersonalInfoTab.tsx** - Personal details display
- **ProfessionalTab.tsx** - Business information
- **AttachmentsTab.tsx** - Uploaded files viewer
- **HistoryTab.tsx** - Submission and verification history

**Components:**

- **InfoCard.tsx** - Reusable information display card
- **FileViewer.tsx** - Document preview component
- **EditDialog.tsx** - Quick edit modal for corrections
- **ActionButtons.tsx** - Send to verification, edit, delete

**Utils:**

- `src/utils/details.ts` - Data formatting for display
- `src/utils/history.ts` - History tracking helpers

**API Endpoints:**

- `GET /api/guarantors/:id` - Get guarantor details
- `PUT /api/guarantors/:id` - Update guarantor info
- `POST /api/guarantors/:id/verify` - Send to background agent

---

### **Shared Components** (`src/components/shared/`)

- **LoadingSpinner.tsx** - Loading states
- **ErrorBoundary.tsx** - Error handling wrapper
- **ConfirmDialog.tsx** - Confirmation modals
- **Toast.tsx** - Success/error notifications (using sonner)
- **EmptyState.tsx** - No data placeholders

### **Services** (`src/services/`)

- **guarantorApi.ts** - All guarantor-related API calls
- **uploadService.ts** - File upload handling
- **authService.ts** - Authentication (existing)
- **backgroundAgent.ts** - Integration with verification pipeline

### **Hooks** (`src/hooks/`)

- **useGuarantor.ts** - Guarantor CRUD operations with TanStack Query
- **useFileUpload.ts** - File upload with progress tracking
- **useDebounce.ts** - Search input debouncing
- **useLocalStorage.ts** - Form draft saving

### **Utils** (`src/utils/`)

- **constants.ts** - App constants, validation rules (existing)
- **api.ts** - Enhanced API client (existing)
- **utils.ts** - General utilities (existing)
- **dateUtils.ts** - Date formatting and validation
- **addressUtils.ts** - Address parsing and validation

### **Types** (`src/types/`)

- **api.ts** - Enhanced API response types (existing)
- **guarantor.ts** - Core guarantor interfaces
- **form.ts** - Form-specific types
- **dashboard.ts** - Dashboard data types

---

## Testing Strategy

### **Test Organization**

```
src/
  __tests__/           # Integration tests
    pages/             # Page-level tests
    components/        # Component integration tests
  components/
    __tests__/         # Unit tests for components
  pages/
    __tests__/         # Page-specific tests
  utils/
    __tests__/         # Utility function tests
  services/
    __tests__/         # Service layer tests
  hooks/
    __tests__/         # Custom hooks tests
```

### **Testing Tools & Setup**

- **Vitest** + **React Testing Library** (already configured)
- **MSW (Mock Service Worker)** for API mocking
- **@testing-library/user-event** for user interactions
- **@vitest/coverage-v8** for coverage reports

### **Test Files Naming Convention**

- Component tests: `ComponentName.test.tsx`
- Hook tests: `useHookName.test.ts`
- Service tests: `serviceName.test.ts`
- Page tests: `PageName.test.tsx`
- Utility tests: `utilityName.test.ts`

### **Required Test Setup Files**

#### `src/test/test-utils.tsx`

```typescript
// Custom render function with providers
// Theme provider, Query client provider, Router wrapper
export const renderWithProviders = (ui: ReactElement, options?: RenderOptions) => {...}
```

#### `src/test/mocks/handlers.ts`

```typescript
// MSW handlers for all API endpoints
export const handlers = [
  rest.get('/api/guarantors', ...),
  rest.post('/api/guarantors', ...),
  // ... all API endpoints
]
```

#### `src/test/mocks/mockData.ts`

```typescript
// Mock guarantor data, form data, API responses
export const mockGuarantor = {...}
export const mockFormData = {...}
```

### **Key Test Cases by Component Type**

#### **Page Tests** (`src/pages/__tests__/`)

- **DashboardPage.test.tsx**
    - Renders stats cards correctly
    - Shows recent submissions table
    - Navigation to form page works
- **GuarantorFormPage.test.tsx**
    - Multi-step form navigation
    - Form validation on each step
    - Draft saving functionality
    - Successful submission flow
    - Error handling for API failures

- **GuarantorListPage.test.tsx**
    - Table rendering with data
    - Search and filtering
    - Pagination functionality
    - Export feature

#### **Component Tests** (`src/components/__tests__/`)

- **PersonalInfoStep.test.tsx**
    - Required field validation
    - Date of birth validation
    - Address validation
    - Form state updates

- **FileUpload.test.tsx**
    - File drag & drop
    - File type validation
    - Upload progress
    - Error states

- **GuarantorTable.test.tsx**
    - Data rendering
    - Sorting functionality
    - Row selection
    - Action buttons

#### **Hook Tests** (`src/hooks/__tests__/`)

- **useGuarantor.test.tsx**
    - CRUD operations
    - Loading states
    - Error handling
    - Cache invalidation

- **useFileUpload.test.tsx**
    - Upload progress tracking
    - File validation
    - Retry logic

#### **Service Tests** (`src/services/__tests__/`)

- **guarantorApi.test.ts**
    - API calls with correct parameters
    - Response data transformation
    - Error response handling
    - Authentication headers

#### **Utility Tests** (`src/utils/__tests__/`)

- **validation.test.ts**
    - Zod schema validation
    - Edge cases for each field
    - Custom validation rules

- **form.test.ts**
    - Form state management
    - Multi-step logic
    - Draft saving/loading

### **Integration Test Scenarios**

- **Complete form submission flow** - User fills all steps and submits
- **Draft save and resume** - User saves draft and continues later
- **Search and filter workflow** - User searches and applies filters
- **File upload and preview** - User uploads files and views them
- **Error recovery** - Network errors, form validation errors
- **Accessibility** - Keyboard navigation, screen reader support

### **Mock Strategy with MSW**

- Mock all API endpoints with realistic data
- Test loading states with delayed responses
- Test error states with HTTP error codes
- Mock file upload with progress simulation

### **Coverage Goals**

- **Components**: 90%+ coverage
- **Services**: 95%+ coverage
- **Utils**: 95%+ coverage
- **Pages**: 80%+ coverage (focus on critical user paths)

### **Test Commands** (already in package.json)

- `pnpm test` - Run tests in watch mode
- `pnpm test:ci` - Run tests once for CI
- `pnpm test:coverage` - Generate coverage report
- `pnpm test:ui` - Run tests with Vitest UI

---

## Implementation Phase Plan

### **Phase 1: Foundation** (Days 1-2)

1. Set up routing with React Router
2. Create layout components (Header, Sidebar, Layout)
3. Set up TanStack Query configuration
4. Create basic types and API client setup

### **Phase 2: Core Form** (Days 3-5)

1. Build multi-step guarantor form
2. Implement form validation with Zod
3. Add file upload functionality
4. Create form persistence (drafts)

### **Phase 3: Data Management** (Days 6-7)

1. Build guarantor list page with search/filter
2. Create details page with tabs
3. Implement dashboard with stats
4. Add export functionality

### **Phase 4: Testing & Polish** (Days 8-9)

1. Write comprehensive test suite
2. Add error boundaries and loading states
3. Implement accessibility features
4. Performance optimization

### **Phase 5: Integration** (Day 10)

1. Connect to background verification agent API
2. End-to-end testing
3. Final bug fixes and deployment prep

This plan provides a structured approach to building a production-ready guarantor information collection system with comprehensive testing coverage.
