import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableHead, CTableHeaderCell, CTableRow, CTableBody, CTableDataCell, CSpinner, CAlert, CBadge } from '@coreui/react'
import { ticketAPI } from '../../lib/Api'

const RevenueReport = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalTickets: 0,
        bookedTickets: 0,
        averagePrice: 0,
        monthlyRevenue: []
    })
    const [recentTickets, setRecentTickets] = useState([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch all tickets
            const ticketsRes = await ticketAPI.getTickets({ limit: 1000 })

            let tickets = []
            if (ticketsRes.success && ticketsRes.responseObject) {
                tickets = ticketsRes.responseObject.tickets || ticketsRes.responseObject.data || ticketsRes.responseObject || []
            }

            if (Array.isArray(tickets)) {
                // Calculate total revenue
                const totalRevenue = tickets.reduce((sum, ticket) => {
                    console.log("ticket", ticket)
                    if (ticket.status === 'BOOKED') {
                        return sum + (Number(ticket.total_price) || 0)
                    }
                    else {
                        return sum;
                    }

                }, 0)

                // Calculate booked tickets
                const bookedTickets = tickets.filter(t => t.status === 'BOOKED')

                // Calculate average price
                const averagePrice = bookedTickets.length > 0
                    ? totalRevenue / bookedTickets.length
                    : 0

                // Calculate monthly revenue
                const monthlyRevenue = calculateMonthlyRevenue(tickets)

                setStats({
                    totalRevenue,
                    totalTickets: tickets.length,
                    bookedTickets: bookedTickets.length,
                    averagePrice,
                    monthlyRevenue
                })

                // Get recent tickets (last 10)
                setRecentTickets(tickets.slice(0, 1000))
            }
        } catch (err) {
            console.error('Error loading revenue data:', err)
            setError(err.message || 'Failed to load revenue report')
        } finally {
            setLoading(false)
        }
    }

    const calculateMonthlyRevenue = (tickets) => {
        const monthlyData = {}

        tickets.forEach(ticket => {
            if (ticket.created_at && ticket.total_price && ticket.status === 'BOOKED') {
                const date = new Date(ticket.created_at)
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { revenue: 0, count: 0 }
                }

                monthlyData[monthKey].revenue += Number(ticket.total_price) || 0;
                monthlyData[monthKey].count += 1;
            }
            else {
                return;
            }
        })

        return Object.entries(monthlyData)
            .map(([month, data]) => ({
                month,
                revenue: data.revenue,
                count: data.count
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('vi-VN') + 'đ'
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
            <h2 className="mb-4">Báo cáo doanh thu</h2>

            {/* Statistics Cards */}
            <CRow className="mb-4">
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-primary">
                        <CCardBody>
                            <h4 className="mb-0">{stats.totalRevenue.toLocaleString('vi-VN')}đ</h4>
                            <p className="mb-0">Tổng doanh thu</p>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-success">
                        <CCardBody>
                            <h4 className="mb-0">{stats.bookedTickets}</h4>
                            <p className="mb-0">Vé đã bán</p>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-info">
                        <CCardBody>
                            <h4 className="mb-0">{stats.averagePrice.toLocaleString('vi-VN')}đ</h4>
                            <p className="mb-0">Giá vé trung bình</p>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-warning">
                        <CCardBody>
                            <h4 className="mb-0">{stats.totalTickets}</h4>
                            <p className="mb-0">Tổng số vé</p>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Monthly Revenue */}
            {stats.monthlyRevenue.length > 0 && (
                <CCard className="mb-4">
                    <CCardHeader>
                        <h5>Doanh thu theo tháng</h5>
                    </CCardHeader>
                    <CCardBody>
                        <CTable hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Tháng</CTableHeaderCell>
                                    <CTableHeaderCell>Số vé</CTableHeaderCell>
                                    <CTableHeaderCell>Doanh thu</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {stats.monthlyRevenue.map((item, idx) => (
                                    <CTableRow key={idx}>
                                        <CTableDataCell>{item.month}</CTableDataCell>
                                        <CTableDataCell><CBadge color="info">{item.count}</CBadge></CTableDataCell>
                                        <CTableDataCell><strong>{formatPrice(item.revenue)}</strong></CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            )}

            {/* Recent Tickets */}
            {recentTickets.length > 0 && (
                <CCard>
                    <CCardHeader>
                        <h5>Vé gần đây</h5>
                    </CCardHeader>
                    <CCardBody>
                        <CTable hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>ID</CTableHeaderCell>
                                    <CTableHeaderCell>Giá vé</CTableHeaderCell>
                                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                                    <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {recentTickets.map((ticket) => {
                                    if (ticket.status === 'BOOKED')
                                        return (
                                            <CTableRow key={ticket.id}>
                                                <CTableDataCell>{ticket.id}</CTableDataCell>
                                                <CTableDataCell>{formatPrice(ticket.total_price)}</CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={ticket.status === 'BOOKED' ? 'success' : 'danger'}>
                                                        {ticket.status}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>{formatDate(ticket.created_at)}</CTableDataCell>
                                            </CTableRow>
                                        )

                                }



                                )}
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            )}
        </div>
    )
}

export default RevenueReport


