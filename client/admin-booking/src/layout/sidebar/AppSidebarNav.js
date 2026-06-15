import React from 'react'
import { CNavGroup, CNavItem, CNavLink, CNavTitle } from '@coreui/react'
import CIcon from '@coreui/icons-react'

const AppSidebarNav = ({ items }) => {
    const navLink = (name, icon, badge) => {
        return (
            <>
                {icon && typeof icon === 'string' && <CIcon customClassName="nav-icon" icon={icon} />}
                {icon && typeof icon !== 'string' && icon}
                {name && name}
                {badge && (
                    <div className={badge.color}>
                        {badge.text}
                    </div>
                )}
            </>
        )
    }

    const navItem = (item, index) => {
        const { component, name, badge, icon, ...rest } = item
        const Component = component
        return (
            <Component
                {...(rest.to &&
                    !rest.items && {
                    component: CNavLink,
                })}
                key={index}
                {...rest}
            >
                {navLink(name, icon, badge)}
            </Component>
        )
    }
    const navGroup = (item, index) => {
        const { component, name, icon, to, ...rest } = item
        const Component = component
        return (
            <Component
                idx={String(index)}
                key={index}
                toggler={navLink(name, icon)}
                visible={true}
                {...rest}
            >
                {item.items?.map((item, index) =>
                    item.items ? navGroup(item, index) : navItem(item, index),
                )}
            </Component>
        )
    }

    return (
        <React.Fragment>
            {items &&
                items.map((item, index) =>
                    item.items ? navGroup(item, index) : navItem(item, index),
                )}
        </React.Fragment>
    )
}

export default AppSidebarNav


