import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CTable,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CTableBody,
    CTableDataCell,
    CButton,
    CAlert,
    CSpinner,
    CFormSelect,
    CBadge,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilCog } from '@coreui/icons'
import { carsAPI, seatsAPI } from '../../lib/Api'
import SeatsModal from './SeatsModal'

const Seats = () => {
    const [buses, setBuses] = useState([])
    const [selectedBusId, setSelectedBusId] = useState('')
    const [seats, setSeats] = useState([])
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' })
    const [modalVisible, setModalVisible] = useState(false)

    const [deleteModalVisible, setDeleteModalVisible] = useState(false)

    useEffect(() => { loadBuses() }, [])
    useEffect(() => { if (selectedBusId) loadSeats(selectedBusId) }, [selectedBusId])

    const loadBuses = async () => {
        try {
            const res = await carsAPI.getCars({ limit: 1000 })
            if (res.success) setBuses(res.data.content || [])
        } catch (e) { console.error(e) }
    }

    const loadSeats = async (busId) => {
        try {
            setLoading(true)
            const res = await seatsAPI.getSeatsByCar(busId)
            if (res.success) setSeats(res.data || [])
            else setAlert({ show: true, message: res.message || 'Tải dữ liệu ghế thất bại', type: 'danger' })
        } catch (e) {
            setAlert({ show: true, message: e.message || 'Tải dữ liệu ghế thất bại', type: 'danger' })
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = () => {
        if (!selectedBusId) {
            setAlert({ show: true, message: 'Chọn xe để cấu hình ghế', type: 'warning' })
            return
        }
        setModalVisible(true)
    }

    const confirmDeleteSeats = async () => {
        try {
            await seatsAPI.deleteSeatsByCar(selectedBusId)
            setAlert({ show: true, message: 'Đã xóa toàn bộ ghế của xe', type: 'success' })
            setDeleteModalVisible(false)
            loadSeats(selectedBusId)
        } catch (e) {
            setAlert({ show: true, message: e.message || 'Xóa ghế thất bại', type: 'danger' })
        }
    }

    const seatTypeColor = (type) => {
        if (type === 'LUXURY') return 'primary'
        if (type === 'VIP') return 'success'
        return 'secondary'
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Quản lý chỗ ngồi</h2>
                    <p className="text-muted mb-0">Xem, cấu hình và xóa ghế theo xe</p>
                </div>
                <div className="d-flex gap-2">
                    <CFormSelect value={selectedBusId} onChange={(e) => setSelectedBusId(e.target.value)} style={{ minWidth: 240 }}>
                        <option value="">Chọn xe</option>
                        {buses.map(b => (
                            <option key={b.id} value={b.id}>{b.name} - {b.licensePlate}</option>
                        ))}
                    </CFormSelect>
                    <CButton color="primary" onClick={handleGenerate} disabled={!selectedBusId}><CIcon icon={cilCog} className="me-2" />Cấu hình ghế</CButton>
                    <CButton color="danger" variant="outline" onClick={() => setDeleteModalVisible(true)} disabled={!selectedBusId}><CIcon icon={cilTrash} className="me-2" />Xóa tất cả ghế</CButton>
                </div>
            </div>

            {alert.show && (
                <CAlert color={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: 'success' })} className="mb-4">{alert.message}</CAlert>
            )}

            <CCard>
                <CCardHeader>Danh sách ghế</CCardHeader>
                <CCardBody>
                    {loading ? (
                        <div className="text-center py-4"><CSpinner color="primary" /><p className="mt-2">Đang tải dữ liệu...</p></div>
                    ) : !selectedBusId ? (
                        <div className="text-center py-4"><p className="text-muted">Hãy chọn xe để xem danh sách ghế</p></div>
                    ) : seats.length === 0 ? (
                        <div className="text-center py-4"><p className="text-muted">Chưa có ghế cho xe này</p></div>
                    ) : (
                        <CTable hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>#</CTableHeaderCell>
                                    <CTableHeaderCell>Số ghế</CTableHeaderCell>
                                    <CTableHeaderCell>Loại ghế</CTableHeaderCell>
                                    <CTableHeaderCell>Giá</CTableHeaderCell>
                                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {seats.map((s, idx) => (
                                    <CTableRow key={`${s.vehicleId}-${s.seatNumber}`}>
                                        <CTableDataCell>{idx + 1}</CTableDataCell>
                                        <CTableDataCell>{s.seatNumber}</CTableDataCell>
                                        <CTableDataCell><CBadge color={seatTypeColor(s.seatType)}>{s.seatType}</CBadge></CTableDataCell>
                                        <CTableDataCell>{new Intl.NumberFormat('vi-VN').format(s.priceForTypeSeat)} đ</CTableDataCell>
                                        <CTableDataCell><CBadge color={s.status === 'AVAILABLE' ? 'success' : 'secondary'}>{s.status}</CBadge></CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    )}
                </CCardBody>
            </CCard>

            <SeatsModal visible={modalVisible} onClose={() => setModalVisible(false)} onSuccess={() => loadSeats(selectedBusId)} busId={selectedBusId} />

            <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)} color="danger">
                <CModalHeader closeButton>
                    <CModalTitle>Xác nhận xóa tất cả ghế</CModalTitle>
                </CModalHeader>
                <CModalBody>Bạn có chắc chắn muốn xóa toàn bộ ghế của xe này?</CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>Hủy</CButton>
                    <CButton color="danger" onClick={confirmDeleteSeats}>Xóa</CButton>
                </CModalFooter>
            </CModal>
        </div>
    )
}

export default Seats


