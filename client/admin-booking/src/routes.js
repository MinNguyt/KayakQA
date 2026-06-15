import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'

// Lazy load components
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const BusCompany = React.lazy(() => import('./views/bus-company/BusCompany'))
const BusManagement = React.lazy(() => import('./views/bus-management/BusManagement'))
const RoutesManagement = React.lazy(() => import('./views/routes/Routes'))
const StationManagement = React.lazy(() => import('./views/station/StationManageMent'))
const Seats = React.lazy(() => import('./views/seats/Seats'))
const ScheduleManagement = React.lazy(() => import('./views/schedule/ScheduleManagement'))
const TicketManagement = React.lazy(() => import('./views/ticket/TicketManagement'))
const UserManagement = React.lazy(() => import('./views/user/UserManagement'))
const AccountManagement = React.lazy(() => import('./views/account/AccountManagement'))
const RevenueReport = React.lazy(() => import('./views/reports/RevenueReport'))
const TripStatistics = React.lazy(() => import('./views/reports/TripStatistics'))
const ReviewReport = React.lazy(() => import('./views/reports/ReviewReport'))
const SystemSettings = React.lazy(() => import('./views/settings/SystemSettings'))
const BannerManagement = React.lazy(() => import('./views/banner/BannerManagement'))
const DiscountManagement = React.lazy(() => import('./views/discount/DiscountManagement'))

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bus-company" element={<BusCompany />} />
        <Route path="bus-management" element={<BusManagement />} />
        <Route path="routes" element={<RoutesManagement />} />
        <Route path="stations" element={<StationManagement />} />
        <Route path="seats" element={<Seats />} />
        <Route path="schedule-management" element={<ScheduleManagement />} />
        <Route path="ticket-management" element={<TicketManagement />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="account-management" element={<AccountManagement />} />
        <Route path="revenue-report" element={<RevenueReport />} />
        <Route path="trip-statistics" element={<TripStatistics />} />
        <Route path="review-report" element={<ReviewReport />} />
        <Route path="system-settings" element={<SystemSettings />} />
        <Route path="banner-management" element={<BannerManagement />} />
        <Route path="discount-management" element={<DiscountManagement />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
