import React from 'react'
import { useSelector } from 'react-redux'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  // If not authenticated, don't render the layout
  if (!isAuthenticated) {
    return <AppContent />
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
