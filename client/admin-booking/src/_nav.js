import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilSpeedometer,
  cilStar,
  cilNotes,
  cilEnvelopeClosed,
  cilMap,
  cilCalendar,
  cilPeople,
  cilSettings,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Quản lý hệ thống',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Quản lý công ty',
        to: '/bus-company',
      },
      {
        component: CNavItem,
        name: 'Quản lý xe',
        to: '/bus-management',
      },
      {
        component: CNavItem,
        name: 'Quản lý tuyến đường',
        to: '/routes',
      },
      {
        component: CNavItem,
        name: 'Quản lý bến xe',
        to: '/stations',
      },

      {
        component: CNavItem,
        name: 'Quản lý chỗ ngồi',
        to: '/seats',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Quản lý hoạt động',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Quản lý lịch trình',
        to: '/schedule-management',
      },
      {
        component: CNavItem,
        name: 'Quản lý vé xe',
        to: '/ticket-management',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Quản lý người dùng',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Quản lý tài khoản',
        to: '/account-management',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Báo cáo & Thống kê',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Báo cáo doanh thu',
        to: '/revenue-report',
      },
      {
        component: CNavItem,
        name: 'Thống kê chuyến xe',
        to: '/trip-statistics',
      },
    ],
  },
  // {
  //   component: CNavGroup,
  //   name: 'Hệ thống',
  //   icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Cài đặt hệ thống',
  //       to: '/system-settings',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Quản lý banner',
  //       to: '/banner-management',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Quản lý khuyến mãi',
  //       to: '/discount-management',
  //     },
  //   ],
  // },
]

export default _nav
