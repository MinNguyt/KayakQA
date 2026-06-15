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
    CCardBody,
    CRow,
    CCol
} from '@coreui/react';
import { busCompanyAPI } from '../../lib/Api';
import MarkdownIt from 'markdown-it';
import MDEditor from '@uiw/react-md-editor';

const BusCompanyModal = ({
    visible,
    onClose,
    onSuccess,
    editData = null,
    mode = 'create' // 'create' or 'edit'
}) => {
    const md = new MarkdownIt();
    const [formData, setFormData] = useState({
        company_name: '',
        descriptions: '',
        image: null,
        markdown_content: ''
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

    // Reset form when modal opens/closes or editData changes
    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && editData) {
                // editData uses camelCase from backend
                setFormData({
                    company_name: editData.companyName || '',
                    descriptions: editData.descriptions || '',
                    image: null,
                    markdown_content: editData.markdownContent || ''
                });
                setPreviewImage(editData.image ? editData.image : null);
            } else {
                setFormData({
                    company_name: '',
                    descriptions: '',
                    image: null,
                    markdown_content: ''
                });
                setPreviewImage(null);
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
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    image: 'Please select a valid image file'
                }));
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    image: 'Image size should be less than 5MB'
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);

            // Clear error
            if (errors.image) {
                setErrors(prev => ({
                    ...prev,
                    image: ''
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.company_name.trim()) {
            newErrors.company_name = 'Company name is required';
        }

        if (formData.company_name.trim().length < 2) {
            newErrors.company_name = 'Company name must be at least 2 characters';
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
            // Create the data object matching the backend DTO (using camelCase)
            const dataObject = {
                companyName: formData.company_name.trim(),
                descriptions: formData.descriptions.trim(),
                markdownContent: formData.markdown_content || '',
                markdownHtml: formData.markdown_content ? md.render(formData.markdown_content) : ''
            };

            const submitData = new FormData();
            // Append data as JSON blob
            submitData.append('data', new Blob([JSON.stringify(dataObject)], { type: 'application/json' }));

            if (formData.image) {
                submitData.append('image', formData.image);
            }

            let response;
            if (mode === 'edit') {
                response = await busCompanyAPI.updateCompany(editData.id, submitData);
            } else {
                response = await busCompanyAPI.createCompany(submitData);
            }

            setAlert({
                show: true,
                message: mode === 'edit' ? 'Bus company updated successfully!' : 'Bus company created successfully!',
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
                    {mode === 'edit' ? 'Edit Bus Company' : 'Add New Bus Company'}
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
                        <CFormLabel htmlFor="company_name">Company Name *</CFormLabel>
                        <CFormInput
                            id="company_name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            placeholder="Enter company name"
                            invalid={!!errors.company_name}
                            disabled={loading}
                        />
                        {errors.company_name && (
                            <CFormFeedback invalid>{errors.company_name}</CFormFeedback>
                        )}
                    </div>

                    <div className="mb-3">
                        <CFormLabel htmlFor="descriptions">Description</CFormLabel>
                        <CFormTextarea
                            id="descriptions"
                            name="descriptions"
                            value={formData.descriptions}
                            onChange={handleInputChange}
                            placeholder="Enter company description"
                            rows={3}
                            disabled={loading}
                        />
                    </div>

                    {/* Markdown Editor Section */}
                    <div className="mb-3">
                        <CFormLabel htmlFor="markdown_content">Detailed Content (Markdown)</CFormLabel>
                        <CRow>
                            <CCol md={12}>
                                <MDEditor
                                    id="markdown_content"
                                    name="markdown_content"
                                    value={formData.markdown_content}
                                    onChange={(value) => handleInputChange({ target: { name: 'markdown_content', value } })}
                                    disabled={loading}
                                />
                            </CCol>
                        </CRow>
                    </div>

                    <div className="mb-3">
                        <CFormLabel htmlFor="image">Company Logo</CFormLabel>
                        <CFormInput
                            id="image"
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
                        mode === 'edit' ? 'Update Company' : 'Create Company'
                    )}
                </CButton>
            </CModalFooter>
        </CModal>
    );
};

export default BusCompanyModal;


