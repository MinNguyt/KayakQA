import React from 'react'
import {
    CDropdown,
    CDropdownHeader,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
} from '@coreui/react'
import {
    cilBell,
    cilEnvelopeOpen,
    cilList,
    cilLockLock,
    cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AppHeaderDropdown = () => {
    return (
        <CDropdown variant="nav-item">
            <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
                <CIcon icon={cilUser} size="lg" />
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
                <CDropdownHeader className="bg-light py-2">
                    <div className="fw-semibold">Tài khoản</div>
                </CDropdownHeader>
                <CDropdownItem href="#/profile">
                    <CIcon icon={cilUser} className="me-2" />
                    Hồ sơ
                </CDropdownItem>
                <CDropdownItem href="#/settings">
                    <CIcon icon={cilList} className="me-2" />
                    Cài đặt
                </CDropdownItem>
                <CDropdownItem href="#/notifications">
                    <CIcon icon={cilBell} className="me-2" />
                    Thông báo
                    <span className="badge badge-danger ms-auto">42</span>
                </CDropdownItem>
                <CDropdownItem href="#/messages">
                    <CIcon icon={cilEnvelopeOpen} className="me-2" />
                    Tin nhắn
                    <span className="badge badge-danger ms-auto">4</span>
                </CDropdownItem>
                <CDropdownHeader className="bg-light py-2">
                    <div className="fw-semibold">Hệ thống</div>
                </CDropdownHeader>
                <CDropdownItem href="#/logout">
                    <CIcon icon={cilLockLock} className="me-2" />
                    Đăng xuất
                </CDropdownItem>
            </CDropdownMenu>
        </CDropdown>
    )
}

export default AppHeaderDropdown


