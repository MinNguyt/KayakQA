import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import ProtectedRoute from './ProtectedRoute'

// Lazy load components
const Login = React.lazy(() => import('../views/auth/Login'))
const Dashboard = React.lazy(() => import('../views/dashboard/Dashboard'))
const BusCompany = React.lazy(() => import('../views/bus-company/BusCompany'))
const BusManagement = React.lazy(() => import('../views/bus-management/BusManagement'))
const RoutesManagement = React.lazy(() => import('../views/routes/Routes'))
const StationManagement = React.lazy(() => import('../views/station/StationManageMent'))
const Seats = React.lazy(() => import('../views/seats/Seats'))
const ScheduleManagement = React.lazy(() => import('../views/schedule/ScheduleManagement'))
const TicketManagement = React.lazy(() => import('../views/ticket/TicketManagement'))
const UserManagement = React.lazy(() => import('../views/user/UserManagement'))
const AccountManagement = React.lazy(() => import('../views/account/AccountManagement'))
const RevenueReport = React.lazy(() => import('../views/reports/RevenueReport'))
const TripStatistics = React.lazy(() => import('../views/reports/TripStatistics'))
const ReviewReport = React.lazy(() => import('../views/reports/ReviewReport'))
const SystemSettings = React.lazy(() => import('../views/settings/SystemSettings'))
const BannerManagement = React.lazy(() => import('../views/banner/BannerManagement'))
const DiscountManagement = React.lazy(() => import('../views/discount/DiscountManagement'))

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="bus-company" element={
            <ProtectedRoute>
              <BusCompany />
            </ProtectedRoute>
          } />
          <Route path="bus-management" element={
            <ProtectedRoute>
              <BusManagement />
            </ProtectedRoute>
          } />
          <Route path="routes" element={
            <ProtectedRoute>
              <RoutesManagement />
            </ProtectedRoute>
          } />
          <Route path="stations" element={
            <ProtectedRoute>
              <StationManagement />
            </ProtectedRoute>
          } />
          <Route path="seats" element={
            <ProtectedRoute>
              <Seats />
            </ProtectedRoute>
          } />
          <Route path="schedule-management" element={
            <ProtectedRoute>
              <ScheduleManagement />
            </ProtectedRoute>
          } />
          <Route path="ticket-management" element={
            <ProtectedRoute>
              <TicketManagement />
            </ProtectedRoute>
          } />
          <Route path="user-management" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="account-management" element={
            <ProtectedRoute>
              <AccountManagement />
            </ProtectedRoute>
          } />
          <Route path="revenue-report" element={
            <ProtectedRoute>
              <RevenueReport />
            </ProtectedRoute>
          } />
          <Route path="trip-statistics" element={
            <ProtectedRoute>
              <TripStatistics />
            </ProtectedRoute>
          } />
          <Route path="review-report" element={
            <ProtectedRoute>
              <ReviewReport />
            </ProtectedRoute>
          } />
          <Route path="system-settings" element={
            <ProtectedRoute>
              <SystemSettings />
            </ProtectedRoute>
          } />
          <Route path="banner-management" element={
            <ProtectedRoute>
              <BannerManagement />
            </ProtectedRoute>
          } />
          <Route path="discount-management" element={
            <ProtectedRoute>
              <DiscountManagement />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
