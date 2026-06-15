import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
    CContainer,
    CHeader,
    CHeaderBrand,
    CHeaderDivider,
    CHeaderNav,
    CHeaderToggler,
    CNav,
    CNavItem,
    CNavLink,
    CSidebar,
    CSidebarBrand,
    CSidebarNav,
    CSidebarToggler,
    CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilEnvelopeOpen, cilList, cilMenu } from '@coreui/icons'
import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { AppSidebarNav } from './sidebar/index'
import _nav from '../_nav'

const AppLayout = () => {
    const [sidebarVisible, setSidebarVisible] = useState(true)
    const [sidebarUnfoldable, setSidebarUnfoldable] = useState(false)

    return (
        <div>
            <CSidebar
                position="fixed"
                visible={sidebarVisible}
                unfoldable={sidebarUnfoldable}
                onVisibleChange={(visible) => {
                    setSidebarVisible(visible)
                }}
            >
                <CSidebarBrand>
                    <CIcon customClassName="sidebar-brand-full" icon={undefined} height={35} />
                    <CIcon customClassName="sidebar-brand-narrow" icon={undefined} height={35} />
                </CSidebarBrand>
                <CSidebarNav>
                    <AppSidebarNav items={_nav} />
                </CSidebarNav>
                <CSidebarToggler
                    className="d-none d-lg-flex"
                    onClick={() => setSidebarUnfoldable(!sidebarUnfoldable)}
                />
            </CSidebar>
            <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                <CHeader className="header header-sticky mb-4">
                    <CContainer fluid>
                        <CHeaderToggler
                            className="ps-1"
                            onClick={() => setSidebarVisible(!sidebarVisible)}
                        >
                            <CIcon icon={cilMenu} size="lg" />
                        </CHeaderToggler>
                        <CHeaderBrand className="mx-auto d-md-none">
                            <CIcon icon={undefined} height={35} />
                        </CHeaderBrand>
                        <CHeaderNav className="d-none d-md-flex me-auto">
                            <CNavItem>
                                <CNavLink href="#/dashboard" active>
                                    Dashboard
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink href="#/users">Users</CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink href="#">Settings</CNavLink>
                            </CNavItem>
                        </CHeaderNav>
                        <CHeaderNav>
                            <CNavItem>
                                <CNavLink href="#">
                                    <CIcon icon={cilBell} size="lg" />
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink href="#">
                                    <CIcon icon={cilList} size="lg" />
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink href="#">
                                    <CIcon icon={cilEnvelopeOpen} size="lg" />
                                </CNavLink>
                            </CNavItem>
                        </CHeaderNav>
                        <CHeaderNav className="ms-3">
                            <AppHeaderDropdown />
                        </CHeaderNav>
                    </CContainer>
                    <CHeaderDivider />
                    <CContainer fluid>
                        <AppBreadcrumb />
                    </CContainer>
                </CHeader>
                <div className="body flex-grow-0 px-3">
                    <CContainer fluid>
                        <Outlet />
                    </CContainer>
                </div>
            </div>
        </div>
    )
}

export default AppLayout
