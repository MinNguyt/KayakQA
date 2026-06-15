# Bus Company Management System

## Overview
This is a comprehensive bus company management system for the admin panel, built with React and CoreUI. It provides full CRUD operations for managing bus companies with image upload capabilities.

## Features

### 📊 Dashboard Statistics
- Total number of bus companies
- Active companies count
- Recently added companies (last month)
- Total revenue overview

### 🏢 Company Management
- **Create**: Add new bus companies with logo upload
- **Read**: View all companies with pagination and search
- **Update**: Edit existing company information
- **Delete**: Remove companies with confirmation

### 🔍 Advanced Features
- **Search**: Real-time search by company name
- **Sorting**: Sort by company name or creation date
- **Pagination**: Configurable page sizes (5, 10, 20, 50)
- **Image Upload**: Support for JPG, PNG, GIF up to 5MB
- **Responsive Design**: Works on all screen sizes

## Components

### 1. BusCompany.js
Main component containing:
- Statistics cards
- Data table with sorting and pagination
- Search functionality
- Action buttons (Create, Edit, Delete)

### 2. BusCompanyModal.js
Modal component for creating and editing companies:
- Form validation
- Image upload with preview
- Error handling
- Loading states

### 3. CompanyLogo.js
Reusable component for displaying company logos:
- Loading states
- Error fallbacks
- Consistent sizing

### 4. Api.js
API service layer:
- Axios configuration
- CRUD operations
- Error handling
- Authentication support

## API Endpoints

The system integrates with the following backend endpoints:

- `GET /api/bus-companies` - List companies with pagination
- `GET /api/bus-companies/:id` - Get single company
- `POST /api/bus-companies` - Create new company
- `PUT /api/bus-companies/:id` - Update company
- `DELETE /api/bus-companies/:id` - Delete company

## Usage

### Basic Setup
1. Ensure the backend API is running on `http://localhost:3000`
2. Make sure the uploads folder exists in the backend
3. Configure authentication tokens if required

### Adding a New Company
1. Click "Thêm công ty mới" button
2. Fill in company name (required)
3. Add description (optional)
4. Upload company logo (optional)
5. Click "Create Company"

### Editing a Company
1. Click the edit button (pencil icon) on any row
2. Modify the information as needed
3. Click "Update Company"

### Deleting a Company
1. Click the delete button (trash icon) on any row
2. Confirm the deletion in the modal
3. Click "Xóa" to confirm

## File Structure
```
src/views/bus-company/
├── BusCompany.js          # Main component
├── BusCompanyModal.js     # Create/Edit modal
└── CompanyLogo.js         # Logo display component

src/lib/
└── Api.js                 # API service layer
```

## Dependencies
- React 19.0.0
- CoreUI React 5.5.0
- Axios 1.11.0
- React Router DOM 7.1.5

## Configuration
Update the API base URL in `src/lib/Api.js` if your backend runs on a different port or domain.

## Image Storage
Images are stored in the backend's `uploads` folder and served via `http://localhost:3000/uploads/` endpoint.


