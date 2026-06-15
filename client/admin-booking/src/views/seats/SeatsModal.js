import React, { useEffect, useState } from 'react'
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton,
    CForm,
    CFormLabel,
    CFormInput,
    CFormSelect,
    CFormFeedback,
    CAlert,
    CSpinner,
    CRow,
    CCol
} from '@coreui/react'
import { seatsAPI, carsAPI } from '../../lib/Api'

// Seat types should align with backend SeatTypeEnum
const SEAT_TYPES = [
    { value: 'LUXURY', label: 'Luxury' },
    { value: 'VIP', label: 'VIP' },
    { value: 'STANDARD', label: 'Standard' }
]

const SeatsModal = ({ visible, onClose, onSuccess, busId }) => {
    const [capacity, setCapacity] = useState(null)
    const [configs, setConfigs] = useState([
        { seatType: 'LUXURY', quantity: '', price: '' },
        { seatType: 'VIP', quantity: '', price: '' },
        { seatType: 'STANDARD', quantity: '', price: '' }
    ])
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' })

    useEffect(() => {
        const fetchCar = async () => {
            if (!visible || !busId) return
            try {
                const res = await carsAPI.getCar(busId)
                if (res.success) setCapacity(res.data.capacity ?? null)
            } catch (_) { }
        }
        fetchCar()
        if (visible) {
            setAlert({ show: false, message: '', type: 'success' })
            setErrors({})
        }
    }, [visible, busId])

    const setConfig = (index, field, value) => {
        setConfigs(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
        if (errors[`${index}.${field}`]) setErrors(prev => ({ ...prev, [`${index}.${field}`]: '' }))
    }

    const validate = () => {
        const newErrors = {}
        let total = 0
        configs.forEach((c, idx) => {
            if (!c.quantity) newErrors[`${idx}.quantity`] = 'Nhập số lượng'
            else if (isNaN(c.quantity) || parseInt(c.quantity) < 0) newErrors[`${idx}.quantity`] = 'Số lượng không hợp lệ'
            else total += parseInt(c.quantity)

            if (!c.price) newErrors[`${idx}.price`] = 'Nhập giá'
            else if (isNaN(c.price) || parseInt(c.price) < 0) newErrors[`${idx}.price`] = 'Giá không hợp lệ'
        })
        if (capacity != null && total !== capacity) newErrors.capacity = `Tổng số ghế (${total}) phải bằng sức chứa (${capacity})`
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setLoading(true)
        setAlert({ show: false, message: '', type: 'success' })
        try {
            const payload = {
                seatConfig: configs.map(c => ({ seatType: c.seatType, quantity: parseInt(c.quantity), price: parseInt(c.price) }))
            }
            await seatsAPI.generateSeatsByCar(busId, payload)
            setAlert({ show: true, message: 'Đã tạo cấu hình ghế cho xe', type: 'success' })
            setTimeout(() => { onSuccess(); onClose() }, 1200)
        } catch (e) {
            setAlert({ show: true, message: e.message || 'Tạo ghế thất bại', type: 'danger' })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => { if (!loading) onClose() }

    return (
        <CModal visible={visible} onClose={handleClose} size="lg" backdrop="static" keyboard={false}>
            <CModalHeader closeButton={!loading}>
                <CModalTitle>Cấu hình ghế cho xe</CModalTitle>
            </CModalHeader>
            <CModalBody>
                {alert.show && (
                    <CAlert color={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: 'success' })}>{alert.message}</CAlert>
                )}
                {capacity != null && (
                    <div className="mb-3"><strong>Sức chứa:</strong> {capacity} ghế</div>
                )}
                {errors.capacity && (
                    <CAlert color="warning" className="mb-3">{errors.capacity}</CAlert>
                )}
                <CForm>
                    {configs.map((cfg, idx) => (
                        <CRow key={idx} className="mb-3">
                            <CCol md={4}>
                                <CFormLabel>Loại ghế</CFormLabel>
                                <CFormSelect value={cfg.seatType} onChange={(e) => setConfig(idx, 'seatType', e.target.value)} disabled={loading}>
                                    {SEAT_TYPES.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                                </CFormSelect>
                            </CCol>
                            <CCol md={4}>
                                <CFormLabel>Số lượng</CFormLabel>
                                <CFormInput type="number" min="0" value={cfg.quantity} onChange={(e) => setConfig(idx, 'quantity', e.target.value)} invalid={!!errors[`${idx}.quantity`]} disabled={loading} />
                                {errors[`${idx}.quantity`] && (<CFormFeedback invalid>{errors[`${idx}.quantity`]}</CFormFeedback>)}
                            </CCol>
                            <CCol md={4}>
                                <CFormLabel>Giá</CFormLabel>
                                <CFormInput type="number" min="0" value={cfg.price} onChange={(e) => setConfig(idx, 'price', e.target.value)} invalid={!!errors[`${idx}.price`]} disabled={loading} />
                                {errors[`${idx}.price`] && (<CFormFeedback invalid>{errors[`${idx}.price`]}</CFormFeedback>)}
                            </CCol>
                        </CRow>
                    ))}
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={handleClose} disabled={loading}>Hủy</CButton>
                <CButton color="primary" onClick={handleSubmit} disabled={loading}>{loading ? (<><CSpinner size="sm" className="me-2" />Đang tạo...</>) : 'Tạo cấu hình'}</CButton>
            </CModalFooter>
        </CModal>
    )
}

export default SeatsModal


