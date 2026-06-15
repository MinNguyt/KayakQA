import React, { useEffect, useRef, useState } from 'react'
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
import { carsAPI } from '../../lib/Api'
import MarkdownIt from 'markdown-it'
import MDEditor from '@uiw/react-md-editor'

const BusManagementModal = ({ visible, onClose, onSuccess, mode = 'create', editData = null, companies = [] }) => {
    const md = new MarkdownIt()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        license_plate: '',
        capacity: '',
        company_id: '',
        markdown_content: ''
    })
    const [errors, setErrors] = useState({})
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' })
    console.log("companies", companies);
    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && editData) {
                setFormData({
                    name: editData.name || '',
                    description: editData.description || '',
                    license_plate: editData.license_plate || '',
                    capacity: (editData.capacity ?? '').toString(),
                    company_id: (editData.company_id ?? '').toString(),
                    markdown_content: editData.markdown_content || ''
                })
            } else {
                setFormData({ name: '', description: '', license_plate: '', capacity: '', company_id: '', markdown_content: '' })
            }
            setImageFile(null)
            setImagePreview(editData?.featured_image ? `${window.location.origin}${editData.featured_image}` : '')
            setErrors({})
            setAlert({ show: false, message: '', type: 'success' })
        }
    }, [visible, mode, editData])

    const handleChange = (e) => {
        const { name, value } = e.target
        console.log(name, value)
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.name) newErrors.name = 'Tên xe là bắt buộc'
        if (!formData.license_plate) newErrors.license_plate = 'Biển số là bắt buộc'
        if (!formData.capacity) newErrors.capacity = 'Sức chứa là bắt buộc'
        else if (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) newErrors.capacity = 'Sức chứa phải là số dương'
        if (!formData.company_id) newErrors.company_id = 'Nhà xe là bắt buộc'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    console.log("img", imageFile);

    const handleSubmit = async () => {
        if (!validate()) return
        setLoading(true)
        setAlert({ show: false, message: '', type: 'success' })
        try {


            let data = new FormData();
            data.append("name", formData.name);
            data.append("featuredImage", imageFile);
            data.append("licensePlate", formData.license_plate);
            data.append("capacity", formData.capacity);
            data.append("company_id", formData.company_id);
            data.append("description", formData.description);
            data.append("markdownContent", formData.markdown_content);
            data.append("markdownHtml", formData.markdown_content ? md.render(formData.markdown_content) : undefined);

            let carId = editData?.id
            if (mode === 'edit') {
                await carsAPI.updateCar(editData.id, data)
            } else {
                const res = await carsAPI.createCar(data)
                // backend returns { car, message }
                carId = res?.car?.id || res?.responseObject?.id
            }

            if (imageFile && carId) {
                await carsAPI.uploadFeaturedImage(carId, imageFile)
            }
            setAlert({ show: true, message: mode === 'edit' ? 'Cập nhật xe thành công' : 'Tạo xe thành công', type: 'success' })
            setTimeout(() => { onSuccess(); onClose() }, 1200)
        } catch (e) {
            setAlert({ show: true, message: e.message || 'Thao tác thất bại', type: 'danger' })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => { if (!loading) onClose() }

    return (
        <CModal visible={visible} onClose={handleClose} size="lg" backdrop="static" keyboard={false}>
            <CModalHeader closeButton={!loading}>
                <CModalTitle>{mode === 'edit' ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</CModalTitle>
            </CModalHeader>
            <CModalBody>
                {alert.show && (
                    <CAlert color={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: 'success' })}>{alert.message}</CAlert>
                )}
                <CForm>
                    <CRow>
                        <CCol md={6}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="name">Tên xe *</CFormLabel>
                                <CFormInput id="name" name="name" value={formData.name} onChange={handleChange} invalid={!!errors.name} disabled={loading} />
                                {errors.name && (<CFormFeedback invalid>{errors.name}</CFormFeedback>)}
                            </div>
                        </CCol>
                        <CCol md={6}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="license_plate">Biển số *</CFormLabel>
                                <CFormInput id="license_plate" name="license_plate" value={formData.license_plate} onChange={handleChange} invalid={!!errors.license_plate} disabled={loading} />
                                {errors.license_plate && (<CFormFeedback invalid>{errors.license_plate}</CFormFeedback>)}
                            </div>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol md={6}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="capacity">Sức chứa *</CFormLabel>
                                <CFormInput id="capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleChange} invalid={!!errors.capacity} disabled={loading} />
                                {errors.capacity && (<CFormFeedback invalid>{errors.capacity}</CFormFeedback>)}
                            </div>
                        </CCol>
                        <CCol md={6}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="company_id">Nhà xe *</CFormLabel>
                                <CFormSelect id="company_id" name="company_id" value={formData.company_id} onChange={handleChange} invalid={!!errors.company_id} disabled={loading}>
                                    <option value="">Chọn nhà xe</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                                    ))}
                                </CFormSelect>
                                {errors.company_id && (<CFormFeedback invalid>{errors.company_id}</CFormFeedback>)}
                            </div>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol md={6}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="featured_image">Ảnh đại diện</CFormLabel>
                                <CFormInput
                                    type="file"
                                    id="featured_image"
                                    name="featured_image"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    disabled={loading}
                                />
                            </div>
                        </CCol>
                        <CCol md={6}>
                            {!!imagePreview && (
                                <div className="mb-3">
                                    <CFormLabel>Preview</CFormLabel>
                                    <div style={{ width: 160, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #eee' }}>
                                        <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </div>
                            )}
                        </CCol>
                    </CRow>
                    <div className="mb-3">
                        <CFormLabel htmlFor="description">Mô tả</CFormLabel>
                        <CFormInput id="description" name="description" value={formData.description} onChange={handleChange} disabled={loading} />
                    </div>

                    {/* Markdown Editor Section */}
                    <div className="mb-3">
                        <CFormLabel htmlFor="markdown_content">Nội dung chi tiết (Markdown)</CFormLabel>
                        <CRow>
                            <CCol md={12}>
                                <MDEditor
                                    id="markdown_content"
                                    name="markdown_content"
                                    value={formData.markdown_content}
                                    onChange={(value) => handleChange({ target: { name: 'markdown_content', value } })}
                                    disabled={loading}
                                />
                            </CCol>
                        </CRow>
                    </div>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={handleClose} disabled={loading}>Hủy</CButton>
                <CButton color="primary" onClick={handleSubmit} disabled={loading}>{loading ? (<><CSpinner size="sm" className="me-2" />{mode === 'edit' ? 'Đang cập nhật...' : 'Đang tạo...'}</>) : (mode === 'edit' ? 'Cập nhật xe' : 'Tạo xe')}</CButton>
            </CModalFooter>
        </CModal>
    )
}

export default BusManagementModal


