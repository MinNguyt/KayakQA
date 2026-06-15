import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner, CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilPeople, cilUser, cilNoteAdd, cilCalendar } from '@coreui/icons'
import { carsAPI, userAPI, ticketAPI, vehicleSchedulesAPI, routesAPI } from '../../lib/Api'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalCars: 0,
    totalUsers: 0,
    totalTickets: 0,
    tripsToday: 0,
    totalRevenue: 0,
    activeRoutes: 0,
  })

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch data from multiple APIs
      const [carsRes, usersRes, ticketsRes, schedulesRes, routesRes] = await Promise.all([
        carsAPI.getCars({ limit: 1000 }).catch(() => ({ success: false })),
        userAPI.getUsers({ limit: 1000 }).catch(() => ({ success: false })),
        ticketAPI.getTickets({ limit: 1000 }).catch(() => ({ success: false })),
        vehicleSchedulesAPI.getSchedules({ limit: 1000 }).catch(() => ({ success: false })),
        routesAPI.getRoutes({ limit: 1000 }).catch(() => ({ success: false })),
      ])

      // Count total cars
      let totalCars = 0
      if (carsRes.success && carsRes.responseObject) {
        const cars = carsRes.responseObject.results || carsRes.responseObject.data || carsRes.responseObject || []
        totalCars = Array.isArray(cars) ? cars.length : 0
      }

      // Count total users
      let totalUsers = 0
      if (usersRes.success && usersRes.responseObject) {
        const users = usersRes.responseObject.results || usersRes.responseObject.data || usersRes.responseObject || []
        totalUsers = Array.isArray(users) ? users.length : 0
      }

      // Count total tickets and calculate revenue
      let totalTickets = 0
      let totalRevenue = 0
      if (ticketsRes.success && ticketsRes.responseObject) {
        const tickets = ticketsRes.responseObject.tickets || ticketsRes.responseObject.data || ticketsRes.responseObject || []
        if (Array.isArray(tickets)) {
          totalTickets = tickets.length
          totalRevenue = tickets.reduce((sum, ticket) => {
            if (ticket.status === 'BOOKED') {
              return sum + (Number(ticket.total_price) || 0)
            }
            return sum
          }, 0)
        }
      }

      // Count trips today
      let tripsToday = 0
      if (schedulesRes.success && schedulesRes.responseObject) {
        const schedules = schedulesRes.responseObject.results || schedulesRes.responseObject.data || schedulesRes.responseObject || []
        if (Array.isArray(schedules)) {
          const today = new Date().toISOString().split('T')[0]
          tripsToday = schedules.filter(schedule => {
            if (schedule.departure_time) {
              const depDate = new Date(schedule.departure_time).toISOString().split('T')[0]
              return depDate === today
            }
            return false
          }).length
        }
      }

      // Count active routes
      let activeRoutes = 0
      if (routesRes.success && routesRes.responseObject) {
        const routes = routesRes.responseObject.results || routesRes.responseObject.data || routesRes.responseObject || []
        activeRoutes = Array.isArray(routes) ? routes.length : 0
      }

      setStats({
        totalCars,
        totalUsers,
        totalTickets,
        tripsToday,
        totalRevenue,
        activeRoutes,
      })
    } catch (err) {
      console.error('Error loading statistics:', err)
      setError(err.message || 'Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-3">Đang tải dữ liệu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid">
        <CAlert color="danger">{error}</CAlert>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Dashboard</h2>

      <CRow>
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 text-white bg-primary">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.totalCars}</h4>
                  <p className="mb-0">Tổng số xe</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon={cilPeople} size="2xl" />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard className="mb-4 text-white bg-success">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.totalUsers}</h4>
                  <p className="mb-0">Người dùng</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon={cilUser} size="2xl" />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard className="mb-4 text-white bg-info">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.totalTickets}</h4>
                  <p className="mb-0">Vé đã bán</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon={cilNoteAdd} size="2xl" />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard className="mb-4 text-white bg-warning">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.tripsToday}</h4>
                  <p className="mb-0">Chuyến xe hôm nay</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon={cilSpeedometer} size="2xl" />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 text-white bg-danger">
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.totalRevenue.toLocaleString('vi-VN')}đ</h4>
                  <p className="mb-0">Tổng doanh thu</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon={cilNoteAdd} size="2xl" />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard className="mb-4" style={{ backgroundColor: '#6610f2', color: 'white' }}>
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.activeRoutes}</h4>
                  <p className="mb-0">Tuyến đường hoạt động</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon={cilCalendar} size="2xl" />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <h5>Thống kê gần đây</h5>
            </CCardHeader>
            <CCardBody>
              <p>Chào mừng đến với hệ thống quản lý xe khách!</p>
              <p>Đây là trang tổng quan hiển thị các thông tin quan trọng về hệ thống.</p>
              <ul className="list-unstyled mt-3">
                <li className="mb-2">• Tổng số xe: {stats.totalCars} xe</li>
                <li className="mb-2">• Tổng người dùng: {stats.totalUsers} người</li>
                <li className="mb-2">• Tổng vé đã bán: {stats.totalTickets} vé</li>
                <li className="mb-2">• Tổng doanh thu: {stats.totalRevenue.toLocaleString('vi-VN')}đ</li>
              </ul>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <h5>Hoạt động hôm nay</h5>
            </CCardHeader>
            <CCardBody>
              <ul className="list-unstyled">
                <li className="mb-2">• Chuyến xe hôm nay: {stats.tripsToday} chuyến</li>
                <li className="mb-2">• Tuyến đường hoạt động: {stats.activeRoutes} tuyến</li>
                <li className="mb-2">• Tổng số xe: {stats.totalCars} xe</li>
                <li className="mb-2">• Tổng người dùng: {stats.totalUsers} người</li>
              </ul>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard
