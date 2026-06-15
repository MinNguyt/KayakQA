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
    CFormTextarea,
    CFormFeedback,
    CSpinner,
    CAlert,
    CImage,
    CCard,
    CCardBody
} from '@coreui/react';
import { stationAPI } from '../../lib/Api';

const StationModal = ({
    visible,
    onClose,
    onSuccess,
    editData = null,
    mode = 'create' // 'create' or 'edit'
}) => {
    const [formData, setFormData] = useState({
        name: '',
        descriptions: '',
        location: '',
        image: null,
        wallpaper: null
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [previewWallpaper, setPreviewWallpaper] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

    // Reset form when modal opens/closes or editData changes
    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && editData) {
                setFormData({
                    name: editData.name || '',
                    descriptions: editData.descriptions || '',
                    location: editData.location || '',
                    image: null,
                    wallpaper: null
                });
                setPreviewImage(editData.image ? editData.image : null);
                setPreviewWallpaper(editData.wallpaper ? editData.wallpaper : null);
            } else {
                setFormData({
                    name: '',
                    descriptions: '',
                    location: '',
                    image: null,
                    wallpaper: null
                });
                setPreviewImage(null);
                setPreviewWallpaper(null);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const fieldName = e.target.name;

        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    [fieldName]: 'Please select a valid image file'
                }));
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    [fieldName]: 'Image size should be less than 5MB'
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                [fieldName]: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                if (fieldName === 'image') {
                    setPreviewImage(e.target.result);
                } else if (fieldName === 'wallpaper') {
                    setPreviewWallpaper(e.target.result);
                }
            };
            reader.readAsDataURL(file);

            // Clear error
            if (errors[fieldName]) {
                setErrors(prev => ({
                    ...prev,
                    [fieldName]: ''
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Station name is required';
        }

        if (formData.name.trim().length < 2) {
            newErrors.name = 'Station name must be at least 2 characters';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }

        if (formData.location.trim().length < 5) {
            newErrors.location = 'Location must be at least 5 characters';
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
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('descriptions', formData.descriptions.trim());
            submitData.append('location', formData.location.trim());

            if (formData.image) {
                submitData.append('image', formData.image);
            }

            if (formData.wallpaper) {
                submitData.append('wallpaper', formData.wallpaper);
            }

            let response;
            if (mode === 'edit') {
                response = await stationAPI.updateStation(editData.id, submitData);
            } else {
                response = await stationAPI.createStation(submitData);
            }

            setAlert({
                show: true,
                message: mode === 'edit' ? 'Station updated successfully!' : 'Station created successfully!',
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
                    {mode === 'edit' ? 'Edit Station' : 'Add New Station'}
                </CModalTitle>
            </CModalHeader>

            <CModalBody>
                {alert.show && (
                    <CAlert color={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: 'success' })}>
                        {alert.message}
                    </CAlert>
                )}

                <CForm>
                    <div className="mb-3">
                        <CFormLabel htmlFor="name">Station Name *</CFormLabel>
                        <CFormInput
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter station name"
                            invalid={!!errors.name}
                            disabled={loading}
                        />
                        {errors.name && (
                            <CFormFeedback invalid>{errors.name}</CFormFeedback>
                        )}
                    </div>

                    <div className="mb-3">
                        <CFormLabel htmlFor="location">Location *</CFormLabel>
                        <CFormInput
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Enter station location"
                            invalid={!!errors.location}
                            disabled={loading}
                        />
                        {errors.location && (
                            <CFormFeedback invalid>{errors.location}</CFormFeedback>
                        )}
                    </div>

                    <div className="mb-3">
                        <CFormLabel htmlFor="descriptions">Description</CFormLabel>
                        <CFormTextarea
                            id="descriptions"
                            name="descriptions"
                            value={formData.descriptions}
                            onChange={handleInputChange}
                            placeholder="Enter station description"
                            rows={3}
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-3">
                        <CFormLabel htmlFor="image">Station Image</CFormLabel>
                        <CFormInput
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            invalid={!!errors.image}
                            disabled={loading}
                        />
                        {errors.image && (
                            <CFormFeedback invalid>{errors.image}</CFormFeedback>
                        )}
                        <div className="form-text">
                            Supported formats: JPG, PNG, GIF. Max size: 5MB
                        </div>
                    </div>

                    {previewImage && (
                        <div className="mb-3">
                            <CFormLabel>Image Preview</CFormLabel>
                            <CCard>
                                <CCardBody className="p-2">
                                    <CImage
                                        src={previewImage}
                                        alt="Preview"
                                        width={200}
                                        height={150}
                                        className="img-thumbnail"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </CCardBody>
                            </CCard>
                        </div>
                    )}

                    <div className="mb-3">
                        <CFormLabel htmlFor="wallpaper">Station Wallpaper</CFormLabel>
                        <CFormInput
                            id="wallpaper"
                            name="wallpaper"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            invalid={!!errors.wallpaper}
                            disabled={loading}
                        />
                        {errors.wallpaper && (
                            <CFormFeedback invalid>{errors.wallpaper}</CFormFeedback>
                        )}
                        <div className="form-text">
                            Supported formats: JPG, PNG, GIF. Max size: 5MB
                        </div>
                    </div>

                    {previewWallpaper && (
                        <div className="mb-3">
                            <CFormLabel>Wallpaper Preview</CFormLabel>
                            <CCard>
                                <CCardBody className="p-2">
                                    <CImage
                                        src={previewWallpaper}
                                        alt="Wallpaper Preview"
                                        width={200}
                                        height={150}
                                        className="img-thumbnail"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </CCardBody>
                            </CCard>
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
                    Cancel
                </CButton>
                <CButton
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <CSpinner size="sm" className="me-2" />
                            {mode === 'edit' ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        mode === 'edit' ? 'Update Station' : 'Create Station'
                    )}
                </CButton>
            </CModalFooter>
        </CModal>
    );
};

export default StationModal;
