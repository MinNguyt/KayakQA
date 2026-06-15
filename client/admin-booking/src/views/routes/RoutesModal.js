import React, { useState, useEffect } from 'react';
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
    CSpinner,
    CAlert,
    CRow,
    CCol
} from '@coreui/react';
import { routesAPI } from '../../lib/Api';

const RoutesModal = ({
    visible,
    onClose,
    onSuccess,
    editData = null,
    mode = 'create', // 'create' or 'edit'
    stations = []
}) => {
    const [formData, setFormData] = useState({
        departure_station_id: '',
        arrival_station_id: '',
        distance_km: '',
        estimated_duration_hours: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

    // Reset form when modal opens/closes or editData changes
    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && editData) {
                setFormData({
                    departure_station_id: editData.departure_station_id?.toString() || '',
                    arrival_station_id: editData.arrival_station_id?.toString() || '',
                    distance_km: editData.distance_km?.toString() || '',
                    estimated_duration_hours: editData.estimated_duration_hours?.toString() || ''
                });
            } else {
                setFormData({
                    departure_station_id: '',
                    arrival_station_id: '',
                    distance_km: '',
                    estimated_duration_hours: ''
                });
            }
            setErrors({});
            setAlert({ show: false, message: '', type: 'success' });
        }
    }, [visible, editData, mode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate departure station
        if (!formData.departure_station_id) {
            newErrors.departure_station_id = 'Departure station is required';
        }

        // Validate arrival station
        if (!formData.arrival_station_id) {
            newErrors.arrival_station_id = 'Arrival station is required';
        }

        // Check if departure and arrival stations are the same
        if (formData.departure_station_id && formData.arrival_station_id &&
            formData.departure_station_id === formData.arrival_station_id) {
            newErrors.arrival_station_id = 'Arrival station must be different from departure station';
        }

        // Validate distance
        if (!formData.distance_km) {
            newErrors.distance_km = 'Distance is required';
        } else if (isNaN(formData.distance_km) || parseFloat(formData.distance_km) <= 0) {
            newErrors.distance_km = 'Distance must be a positive number';
        }

        // Validate duration
        if (!formData.estimated_duration_hours) {
            newErrors.estimated_duration_hours = 'Estimated duration is required';
        } else if (isNaN(formData.estimated_duration_hours) || parseFloat(formData.estimated_duration_hours) <= 0) {
            newErrors.estimated_duration_hours = 'Duration must be a positive number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setAlert({ show: false, message: '', type: 'success' });

        try {
            const data = {
                departure_station_id: parseInt(formData.departure_station_id),
                arrival_station_id: parseInt(formData.arrival_station_id),
                distance_km: parseFloat(formData.distance_km),
                estimated_duration_hours: parseFloat(formData.estimated_duration_hours)
            };

            const submitData = new FormData();
            submitData.append("departure_station_id", data.departure_station_id);
            submitData.append("arrival_station_id", data.arrival_station_id);
            submitData.append("distance_km", data.distance_km);
            submitData.append("estimated_duration_hours", data.estimated_duration_hours);

            let response;
            if (mode === 'edit') {
                response = await routesAPI.updateRoute(editData.id, submitData);
            } else {
                response = await routesAPI.createRoute(submitData);
            }

            setAlert({
                show: true,
                message: mode === 'edit' ? 'Route updated successfully!' : 'Route created successfully!',
                type: 'success'
            });

            // Close modal after a short delay to show success message
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);

        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'An error occurred. Please try again.',
                type: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const getStationName = (stationId) => {
        const station = stations.find(s => s.id === parseInt(stationId));
        return station ? station.name : '';
    };

    const availableArrivalStations = stations.filter(station =>
        station.id !== parseInt(formData.departure_station_id)
    );

    const availableDepartureStations = stations.filter(station =>
        station.id !== parseInt(formData.arrival_station_id)
    );

    return (
        <CModal
            visible={visible}
            onClose={handleClose}
            size="lg"
            backdrop="static"
            keyboard={false}
        >
            <CModalHeader closeButton={!loading}>
                <CModalTitle>
                    {mode === 'edit' ? 'Chỉnh sửa tuyến đường' : 'Thêm tuyến đường mới'}
                </CModalTitle>
            </CModalHeader>

            <CModalBody>
                {alert.show && (
                    <CAlert
                        color={alert.type}
                        dismissible
                        onClose={() => setAlert({ show: false, message: '', type: 'success' })}
                    >
                        {alert.message}
                    </CAlert>
                )}

                <CForm>
                    <CRow>
                        <CCol md={6}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="departure_station_id">Trạm khởi hành *</CFormLabel>
                                <CFormSelect
                                    id="departure_station_id"
                                    name="departure_station_id"
                                    value={formData.departure_station_id}
                                    onChange={handleInputChange}
                                    invalid={!!errors.departure_station_id}
                                    disabled={loading}
                                >
                                    <option value="">Chọn trạm khởi hành</option>
                                    {availableDepartureStations.map(station => (
                                        <option key={station.id} value={station.id}>
                                            {station.name}
                                        </option>
                                    ))}
                                </CFormSelect>
                                {errors.departure_station_id && (
                                    <CFormFeedback invalid>{errors.departure_station_id}</CFormFeedback>
                                )}
                            </div>
                        </CCol>

                        <CCol md={6}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="arrival_station_id">Trạm đến *</CFormLabel>
                                <CFormSelect
                                    id="arrival_station_id"
                                    name="arrival_station_id"
                                    value={formData.arrival_station_id}
                                    onChange={handleInputChange}
                                    invalid={!!errors.arrival_station_id}
                                    disabled={loading}
                                >
                                    <option value="">Chọn trạm đến</option>
                                    {availableArrivalStations.map(station => (
                                        <option key={station.id} value={station.id}>
                                            {station.name}
                                        </option>
                                    ))}
                                </CFormSelect>
                                {errors.arrival_station_id && (
                                    <CFormFeedback invalid>{errors.arrival_station_id}</CFormFeedback>
                                )}
                            </div>
                        </CCol>
                    </CRow>

                    <CRow>
                        <CCol md={6}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="distance_km">Khoảng cách (km) *</CFormLabel>
                                <CFormInput
                                    id="distance_km"
                                    name="distance_km"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={formData.distance_km}
                                    onChange={handleInputChange}
                                    placeholder="Nhập khoảng cách (VD: 150.5)"
                                    invalid={!!errors.distance_km}
                                    disabled={loading}
                                />
                                {errors.distance_km && (
                                    <CFormFeedback invalid>{errors.distance_km}</CFormFeedback>
                                )}
                            </div>
                        </CCol>

                        <CCol md={6}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="estimated_duration_hours">Thời gian dự kiến (giờ) *</CFormLabel>
                                <CFormInput
                                    id="estimated_duration_hours"
                                    name="estimated_duration_hours"
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={formData.estimated_duration_hours}
                                    onChange={handleInputChange}
                                    placeholder="Nhập thời gian (VD: 3.5)"
                                    invalid={!!errors.estimated_duration_hours}
                                    disabled={loading}
                                />
                                {errors.estimated_duration_hours && (
                                    <CFormFeedback invalid>{errors.estimated_duration_hours}</CFormFeedback>
                                )}
                            </div>
                        </CCol>
                    </CRow>

                    {/* Route Preview */}
                    {formData.departure_station_id && formData.arrival_station_id && (
                        <div className="mb-3 p-3 bg-light rounded">
                            <h6 className="mb-2">Xem trước tuyến đường:</h6>
                            <p className="mb-1">
                                <strong>Từ:</strong> {getStationName(formData.departure_station_id)}
                                <strong className="ms-3">Đến:</strong> {getStationName(formData.arrival_station_id)}
                            </p>
                            {formData.distance_km && (
                                <p className="mb-1">
                                    <strong>Khoảng cách:</strong> {formData.distance_km} km
                                </p>
                            )}
                            {formData.estimated_duration_hours && (
                                <p className="mb-0">
                                    <strong>Thời gian dự kiến:</strong> {formData.estimated_duration_hours} giờ
                                </p>
                            )}
                        </div>
                    )}
                </CForm>
            </CModalBody>

            <CModalFooter>
                <CButton
                    color="secondary"
                    onClick={handleClose}
                    disabled={loading}
                >
                    Hủy
                </CButton>
                <CButton
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <CSpinner size="sm" className="me-2" />
                            {mode === 'edit' ? 'Đang cập nhật...' : 'Đang tạo...'}
                        </>
                    ) : (
                        mode === 'edit' ? 'Cập nhật tuyến đường' : 'Tạo tuyến đường'
                    )}
                </CButton>
            </CModalFooter>
        </CModal>
    );
};

export default RoutesModal;
