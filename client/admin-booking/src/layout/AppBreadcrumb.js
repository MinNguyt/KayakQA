import React from 'react'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import { useLocation } from 'react-router-dom'

const AppBreadcrumb = () => {
    const location = useLocation()
    const pathnames = location.pathname.split('/').filter((x) => x)

    const getBreadcrumbName = (pathname) => {
        const breadcrumbMap = {
            dashboard: 'Dashboard',
            'bus-company': 'Quản lý công ty',
            'bus-management': 'Quản lý xe',
            routes: 'Quản lý tuyến đường',
            seats: 'Quản lý chỗ ngồi',
            'schedule-management': 'Quản lý lịch trình',
            'ticket-management': 'Quản lý vé xe',
            'user-management': 'Quản lý người dùng',
            'account-management': 'Quản lý tài khoản',
            'revenue-report': 'Báo cáo doanh thu',
            'trip-statistics': 'Thống kê chuyến xe',
            'review-report': 'Báo cáo đánh giá',
            'system-settings': 'Cài đặt hệ thống',
            'banner-management': 'Quản lý banner',
            'discount-management': 'Quản lý khuyến mãi',
        }
        return breadcrumbMap[pathname] || pathname
    }

    return (
        <CBreadcrumb className="m-0 ms-2">
            <CBreadcrumbItem href="/">Home</CBreadcrumbItem>
            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
                const isLast = index === pathnames.length - 1
                return isLast ? (
                    <CBreadcrumbItem key={name} active>
                        {getBreadcrumbName(name)}
                    </CBreadcrumbItem>
                ) : (
                    <CBreadcrumbItem key={name} href={routeTo}>
                        {getBreadcrumbName(name)}
                    </CBreadcrumbItem>
                )
            })}
        </CBreadcrumb>
    )
}

export default AppBreadcrumb
