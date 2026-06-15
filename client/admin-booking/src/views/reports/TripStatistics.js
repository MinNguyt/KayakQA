import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableHead, CTableHeaderCell, CTableRow, CTableBody, CTableDataCell, CSpinner, CAlert, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilCalendar, cilLocationPin, cilChartLine } from '@coreui/icons'
import { vehicleSchedulesAPI, routesAPI } from '../../lib/Api'

const TripStatistics = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [schedules, setSchedules] = useState([])
    const [stats, setStats] = useState({
        totalTrips: 0,
        tripsToday: 0,
        tripsThisWeek: 0,
        tripsThisMonth: 0,
        activeTrips: 0,
        totalRoutes: 0,
        avgDistance: 0,
        avgDuration: 0
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch vehicle schedules and routes
            const [schedulesRes, routesRes] = await Promise.all([
                vehicleSchedulesAPI.getSchedules({ limit: 1000 }).catch(() => ({ success: false })),
                routesAPI.getRoutes({ limit: 1000 }).catch(() => ({ success: false }))
            ])

            let allSchedules = []
            if (schedulesRes.success && schedulesRes.responseObject) {
                allSchedules = schedulesRes.responseObject.results || schedulesRes.responseObject.data || schedulesRes.responseObject || []
            }

            let routes = []
            if (routesRes.success && routesRes.responseObject) {
                routes = routesRes.responseObject.results || routesRes.responseObject.data || routesRes.responseObject || []
            }

            if (Array.isArray(allSchedules)) {
                setSchedules(allSchedules)

                const now = new Date()
                const today = now.toISOString().split('T')[0]

                // Calculate week start (Monday)
                const weekStart = new Date(now)
                weekStart.setDate(now.getDate() - now.getDay() + 1)
                const weekStartStr = weekStart.toISOString().split('T')[0]

                // Calculate month start
                const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

                const tripsToday = allSchedules.filter(s => {
                    if (!s.departure_time) return false
                    const depDate = new Date(s.departure_time).toISOString().split('T')[0]
                    return depDate === today
                }).length

                const tripsThisWeek = allSchedules.filter(s => {
                    if (!s.departure_time) return false
                    const depDate = new Date(s.departure_time).toISOString().split('T')[0]
                    return depDate >= weekStartStr
                }).length

                const tripsThisMonth = allSchedules.filter(s => {
                    if (!s.departure_time) return false
                    const depDate = new Date(s.departure_time).toISOString().split('T')[0]
                    return depDate >= monthStartStr
                }).length

                const activeTrips = allSchedules.filter(s => s.status === 'AVAILABLE').length

                // Calculate average distance and duration from routes
                let avgDistance = 0
                let avgDuration = 0
                if (Array.isArray(routes) && routes.length > 0) {
                    const totalDistance = routes.reduce((sum, r) => sum + (Number(r.distance_km) || 0), 0)
                    const totalDuration = routes.reduce((sum, r) => sum + (Number(r.estimated_duration_hours) || 0), 0)
                    avgDistance = totalDistance / routes.length
                    avgDuration = totalDuration / routes.length
                }

                setStats({
                    totalTrips: allSchedules.length,
                    tripsToday,
                    tripsThisWeek,
                    tripsThisMonth,
                    activeTrips,
                    totalRoutes: routes.length,
                    avgDistance: Math.round(avgDistance * 10) / 10,
                    avgDuration: Math.round(avgDuration * 10) / 10
                })
            }
        } catch (err) {
            console.error('Error loading trip statistics:', err)
            setError(err.message || 'Failed to load trip statistics')
        } finally {
            setLoading(false)
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        return date.toLocaleString('vi-VN')
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const getStatusBadge = (status) => {
        const colorMap = {
            'AVAILABLE': 'success',
            'FULL': 'warning',
            'CANCELLED': 'danger'
        }
        return colorMap[status] || 'secondary'
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
            <h2 className="mb-4">Thống kê chuyến xe</h2>

            {/* Statistics Cards */}
            <CRow className="mb-4">
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-primary">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{stats.totalTrips}</h4>
                                    <p className="mb-0">Tổng chuyến xe</p>
                                </div>
                                <CIcon icon={cilSpeedometer} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-success">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{stats.tripsToday}</h4>
                                    <p className="mb-0">Chuyến xe hôm nay</p>
                                </div>
                                <CIcon icon={cilCalendar} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-info">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{stats.tripsThisWeek}</h4>
                                    <p className="mb-0">Chuyến xe tuần này</p>
                                </div>
                                <CIcon icon={cilChartLine} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-warning">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{stats.activeTrips}</h4>
                                    <p className="mb-0">Chuyến đang hoạt động</p>
                                </div>
                                <CIcon icon={cilLocationPin} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Additional Statistics */}
            <CRow className="mb-4">
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-danger">
                        <CCardBody>
                            <h4 className="mb-0">{stats.tripsThisMonth}</h4>
                            <p className="mb-0">Chuyến xe tháng này</p>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white" style={{ backgroundColor: '#6610f2' }}>
                        <CCardBody>
                            <h4 className="mb-0">{stats.totalRoutes}</h4>
                            <p className="mb-0">Tổng tuyến đường</p>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white" style={{ backgroundColor: '#20c997' }}>
                        <CCardBody>
                            <h4 className="mb-0">{stats.avgDistance} km</h4>
                            <p className="mb-0">Khoảng cách TB</p>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white" style={{ backgroundColor: '#fd7e14' }}>
                        <CCardBody>
                            <h4 className="mb-0">{stats.avgDuration}h</h4>
                            <p className="mb-0">Thời gian TB</p>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Recent Trips */}
            {schedules.length > 0 && (
                <CCard>
                    <CCardHeader>
                        <h5>Danh sách chuyến xe gần đây</h5>
                    </CCardHeader>
                    <CCardBody>
                        <CTable hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>ID</CTableHeaderCell>
                                    <CTableHeaderCell>Thời gian khởi hành</CTableHeaderCell>
                                    <CTableHeaderCell>Xe</CTableHeaderCell>
                                    <CTableHeaderCell>Ghế trống</CTableHeaderCell>
                                    <CTableHeaderCell>Tổng ghế</CTableHeaderCell>
                                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {schedules.slice(0, 10).map((schedule) => (
                                    <CTableRow key={schedule.id}>
                                        <CTableDataCell>{schedule.id}</CTableDataCell>
                                        <CTableDataCell>{formatDateTime(schedule.departure_time)}</CTableDataCell>
                                        <CTableDataCell>{schedule.bus_name}</CTableDataCell>
                                        <CTableDataCell><CBadge color="info">{schedule.available_seats}</CBadge></CTableDataCell>
                                        <CTableDataCell><CBadge color="secondary">{schedule.total_seats}</CBadge></CTableDataCell>
                                        <CTableDataCell>
                                            <CBadge color={getStatusBadge(schedule.status)}>
                                                {schedule.status}
                                            </CBadge>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            )}

            {schedules.length === 0 && !loading && (
                <CCard>
                    <CCardBody className="text-center py-4">
                        <p className="text-muted">Chưa có dữ liệu chuyến xe</p>
                    </CCardBody>
                </CCard>
            )}
        </div>
    )
}

export default TripStatistics


