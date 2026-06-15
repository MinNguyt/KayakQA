import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CTableBody,
    CTableDataCell,
    CButton,
    CSpinner,
    CAlert,
    CPagination,
    CPaginationItem,
    CBadge,
    CFormInput,
    CFormSelect,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilPeople } from '@coreui/icons'
import { busCompanyAPI, carsAPI } from '../../lib/Api'
import BusManagementModal from './BusManagementModal'

const BusManagement = () => {
    const [cars, setCars] = useState([])
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' })
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [companyFilter, setCompanyFilter] = useState('')
    const [sortBy, setSortBy] = useState('id')
    const [order, setOrder] = useState('asc')
    const [statistics, setStatistics] = useState({
        totalCars: 0,
        totalCapacity: 0,
        activeCars: 0,
        avgCapacity: 0
    })

    const [modalVisible, setModalVisible] = useState(false)
    const [modalMode, setModalMode] = useState('create')
    const [editData, setEditData] = useState(null)

    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        loadCompanies()
    }, [])

    useEffect(() => {
        loadCars()
    }, [page, limit, search, companyFilter, sortBy, order])
    console.log("companies", companies);
    console.log("cars", cars);
    const loadCompanies = async () => {
        try {
            const res = await busCompanyAPI.getCompanies({ limit: 1000 })
            console.log("ddata", res.data);
            if (res.data || res.success) {
                setCompanies(res.data?.content || [])
            }
        } catch (e) {
            console.error(e)
        }
    }

    const loadCars = async () => {
        try {
            setLoading(true)
            const res = await carsAPI.getCars({ page, limit, search, sortBy, order, company_id: companyFilter || undefined })
            if (res && res.data && res.success) {
                const results = res.data.content || []
                const total = results.length;
                console.log("result", results, total);
                setCars(results)
                setTotalPages(Math.max(1, Math.ceil(total / limit)))

                // Calculate statistics from all cars (not just current page)
                const allCarsRes = await carsAPI.getCars({ page: 1, limit: 1000, search, sortBy, order, company_id: companyFilter || undefined })
                if (allCarsRes.success) {
                    const allCars = allCarsRes.responseObject?.results || allCarsRes.responseObject || []
                    const totalCars = allCars.length
                    const totalCapacity = allCars.reduce((sum, car) => sum + (Number(car.capacity) || 0), 0)
                    const avgCapacity = totalCars > 0 ? Math.round(totalCapacity / totalCars) : 0

                    setStatistics({
                        totalCars,
                        totalCapacity,
                        activeCars: totalCars,
                        avgCapacity
                    })
                }
            } else {
                setAlert({ show: true, message: res.message || 'Failed to load cars', type: 'danger' })
            }
        } catch (e) {
            setAlert({ show: true, message: e.message || 'Failed to load cars', type: 'danger' })
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setModalMode('create')
        setEditData(null)
        setModalVisible(true)
    }

    const handleEdit = (car) => {
        setModalMode('edit')
        setEditData(car)
        setModalVisible(true)
    }

    const handleDelete = (id) => {
        setDeleteId(id)
        setDeleteModalVisible(true)
    }

    const confirmDelete = async () => {
        try {
            await carsAPI.deleteCar(deleteId)
            setAlert({ show: true, message: 'Đã xóa xe thành công', type: 'success' })
            setDeleteModalVisible(false)
            setDeleteId(null)
            loadCars()
        } catch (e) {
            setAlert({ show: true, message: e.message || 'Xóa xe thất bại', type: 'danger' })
        }
    }

    const handleModalSuccess = () => {
        loadCars()
    }

    const resetFilters = () => {
        setSearch('')
        setCompanyFilter('')
        setPage(1)
    }

    const handleSort = (field) => {
        if (sortBy === field) {
            setOrder(order === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setOrder('asc')
        }
        setPage(1)
    }

    const companyName = (companyId) => {

        console.log(companyId);
        const c = companies.find(x => x.id === companyId)

        return c ? c.companyName || c.name : `Company ${companyId}`
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Quản lý xe</h2>
                    <p className="text-muted mb-0">Quản lý danh sách xe và thông tin liên quan</p>
                </div>
                <CButton color="primary" onClick={handleCreate} className="d-flex align-items-center">
                    <CIcon icon={cilPlus} className="me-2" />Thêm xe mới
                </CButton>
            </div>

            {alert.show && (
                <CAlert color={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: 'success' })} className="mb-4">{alert.message}</CAlert>
            )}

            {/* Statistics Cards */}
            <CRow className="mb-4">
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-primary">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{statistics.totalCars}</h4>
                                    <p className="mb-0">Tổng số xe</p>
                                </div>
                                <CIcon icon={cilPeople} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-success">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{statistics.totalCapacity}</h4>
                                    <p className="mb-0">Tổng sức chứa</p>
                                </div>
                                <CIcon icon={cilPeople} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-info">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{statistics.avgCapacity}</h4>
                                    <p className="mb-0">Sức chứa trung bình</p>
                                </div>
                                <CIcon icon={cilPeople} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-warning">
                        <CCardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">{statistics.activeCars}</h4>
                                    <p className="mb-0">Xe đang hoạt động</p>
                                </div>
                                <CIcon icon={cilPeople} size="2xl" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <CCard>
                <CCardHeader>
                    <div className="d-flex gap-2 align-items-center">
                        <CFormInput placeholder="Tìm kiếm theo tên, biển số" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} style={{ maxWidth: 260 }} />
                        <CFormSelect value={companyFilter} onChange={(e) => { setCompanyFilter(e.target.value); setPage(1) }} style={{ maxWidth: 220 }}>
                            <option value="">Tất cả nhà xe</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
                            ))}
                        </CFormSelect>
                        <CButton color="secondary" onClick={resetFilters}>Reset</CButton>
                        <CFormSelect value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={{ maxWidth: 100 }}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </CFormSelect>
                    </div>
                </CCardHeader>
                <CCardBody>
                    {loading ? (
                        <div className="text-center py-4">
                            <CSpinner color="primary" />
                            <p className="mt-2">Đang tải dữ liệu...</p>
                        </div>
                    ) : cars.length === 0 ? (
                        <div className="text-center py-4"><p className="text-muted">Không có dữ liệu xe</p></div>
                    ) : (
                        <>
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>#</CTableHeaderCell>
                                        <CTableHeaderCell onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Tên xe {sortBy === 'name' && <span className="ms-1">{order === 'asc' ? '↑' : '↓'}</span>}</CTableHeaderCell>
                                        <CTableHeaderCell>Nhà xe</CTableHeaderCell>
                                        <CTableHeaderCell onClick={() => handleSort('license_plate')} style={{ cursor: 'pointer' }}>Biển số {sortBy === 'license_plate' && <span className="ms-1">{order === 'asc' ? '↑' : '↓'}</span>}</CTableHeaderCell>
                                        <CTableHeaderCell onClick={() => handleSort('capacity')} style={{ cursor: 'pointer' }}>Sức chứa {sortBy === 'capacity' && <span className="ms-1">{order === 'asc' ? '↑' : '↓'}</span>}</CTableHeaderCell>
                                        <CTableHeaderCell>Thao tác</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {cars.map((car, idx) => (
                                        <CTableRow key={car.id}>
                                            <CTableDataCell>{(page - 1) * limit + idx + 1}</CTableDataCell>
                                            <CTableDataCell>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{ width: 48, height: 32, borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
                                                        <img src={`http://localhost:8080/files${car.featuredImage}`} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                    <strong>{car.name}</strong>
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell>{companyName(car.companyId || car.busCompany.id || 0)}</CTableDataCell>
                                            <CTableDataCell><CBadge color="info">{car.licensePlate}</CBadge></CTableDataCell>
                                            <CTableDataCell><CBadge color="warning">{car.capacity}</CBadge></CTableDataCell>
                                            <CTableDataCell>
                                                <div className="d-flex gap-1">
                                                    <CButton color="info" size="sm" onClick={() => handleEdit(car)} title="Chỉnh sửa"><CIcon icon={cilPencil} /></CButton>
                                                    <CButton color="danger" size="sm" onClick={() => handleDelete(car.id)} title="Xóa"><CIcon icon={cilTrash} /></CButton>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>

                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <CPagination>
                                        <CPaginationItem disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</CPaginationItem>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                            <CPaginationItem key={p} active={p === page} onClick={() => setPage(p)}>{p}</CPaginationItem>
                                        ))}
                                        <CPaginationItem disabled={page === totalPages} onClick={() => setPage(page + 1)}>Sau</CPaginationItem>
                                    </CPagination>
                                </div>
                            )}
                        </>
                    )}
                </CCardBody>
            </CCard>

            <BusManagementModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={handleModalSuccess}
                mode={modalMode}
                editData={editData}
                companies={companies}
            />

            <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)} color="danger">
                <CModalHeader closeButton>
                    <CModalTitle>Xác nhận xóa</CModalTitle>
                </CModalHeader>
                <CModalBody>Bạn có chắc chắn muốn xóa xe này? Hành động này không thể hoàn tác.</CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>Hủy</CButton>
                    <CButton color="danger" onClick={confirmDelete}>Xóa</CButton>
                </CModalFooter>
            </CModal>
        </div>
    )
}

export default BusManagement

