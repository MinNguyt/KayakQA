import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableHead, CTableHeaderCell, CTableRow, CTableBody, CTableDataCell, CSpinner, CAlert, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilStar, cilChartLine } from '@coreui/icons'
import { carsAPI } from '../../lib/Api'

const ReviewReport = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [popularGarages, setPopularGarages] = useState([])
    const [stats, setStats] = useState({
        totalGarages: 0,
        avgRating: 0,
        totalReviews: 0,
        topRating: 0
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch popular garages data
            const garagesRes = await carsAPI.popularGarage()

            let garages = []
            if (garagesRes.success && garagesRes.responseObject) {
                garages = garagesRes.responseObject.results || garagesRes.responseObject.data || garagesRes.responseObject || []
            }

            if (Array.isArray(garages)) {
                setPopularGarages(garages)

                // Calculate statistics
                const totalGarages = garages.length
                const avgRating = garages.length > 0
                    ? garages.reduce((sum, g) => sum + (Number(g.avg_rating) || 0), 0) / garages.length
                    : 0
                const totalReviews = garages.reduce((sum, g) => sum + (Number(g.total_reviews) || 0), 0)
                const topRating = garages.length > 0
                    ? Math.max(...garages.map(g => Number(g.avg_rating) || 0))
                    : 0

                setStats({
                    totalGarages,
                    avgRating,
                    totalReviews,
                    topRating
                })
            }
        } catch (err) {
            console.error('Error loading review data:', err)
            setError(err.message || 'Failed to load review report')
        } finally {
            setLoading(false)
        }
    }

    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 0; i < fullStars; i++) {
            stars.push(<CIcon key={i} icon={cilStar} className="text-warning" />)
        }

        if (hasHalfStar && fullStars < 5) {
            stars.push(<CIcon key="half" icon={cilStar} className="text-warning" style={{ opacity: 0.5 }} />)
        }

        for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
            stars.push(<CIcon key={i} icon={cilStar} className="text-muted" />)
        }

        return stars
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
            <h2 className="mb-4">Báo cáo đánh giá</h2>

            {/* Statistics Cards */}
            <CRow className="mb-4">
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-primary">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{stats.totalGarages}</h4>
                                    <p className="mb-0">Tổng số nhà xe</p>
                                </div>
                                <CIcon icon={cilChartLine} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-success">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{stats.avgRating.toFixed(1)}</h4>
                                    <p className="mb-0">Đánh giá trung bình</p>
                                </div>
                                <CIcon icon={cilStar} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-info">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{stats.totalReviews}</h4>
                                    <p className="mb-0">Tổng đánh giá</p>
                                </div>
                                <CIcon icon={cilStar} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-warning">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{stats.topRating.toFixed(1)}</h4>
                                    <p className="mb-0">Đánh giá cao nhất</p>
                                </div>
                                <CIcon icon={cilStar} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Popular Garages */}
            {popularGarages.length > 0 && (
                <CCard>
                    <CCardHeader>
                        <h5>Top nhà xe được đánh giá cao</h5>
                    </CCardHeader>
                    <CCardBody>
                        <CTable hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>STT</CTableHeaderCell>
                                    <CTableHeaderCell>Nhà xe</CTableHeaderCell>
                                    <CTableHeaderCell>Số xe</CTableHeaderCell>
                                    <CTableHeaderCell>Đánh giá</CTableHeaderCell>
                                    <CTableHeaderCell>Số lượng đánh giá</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {popularGarages.map((garage, idx) => (
                                    <CTableRow key={garage.company_id}>
                                        <CTableDataCell>{idx + 1}</CTableDataCell>
                                        <CTableDataCell>
                                            <div className="d-flex align-items-center gap-2">
                                                {garage.image && (
                                                    <img
                                                        src={`${window.location.origin}${garage.image}`}
                                                        alt={garage.company_name}
                                                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                                    />
                                                )}
                                                <strong>{garage.company_name}</strong>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell><CBadge color="info">{garage.total_cars}</CBadge></CTableDataCell>
                                        <CTableDataCell>
                                            <div className="d-flex align-items-center gap-2">
                                                <span>{renderStars(Number(garage.avg_rating))}</span>
                                                <strong>({Number(garage.avg_rating).toFixed(1)})</strong>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell><CBadge color="success">{garage.total_reviews}</CBadge></CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            )}

            {popularGarages.length === 0 && !loading && (
                <CCard>
                    <CCardBody className="text-center py-4">
                        <p className="text-muted">Chưa có dữ liệu đánh giá</p>
                    </CCardBody>
                </CCard>
            )}
        </div>
    )
}

export default ReviewReport


