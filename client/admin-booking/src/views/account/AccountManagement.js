import React, { useState, useEffect } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CButton,
    CForm,
    CFormInput,
    CFormLabel,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CSpinner,
    CAlert,
    CPagination,
    CPaginationItem,
    CInputGroup,
    CInputGroupText,
    CFormSelect,
    CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus, cilSearch, cilReload } from '@coreui/icons';
import { userAPI } from '../../lib/Api';
import Swal from 'sweetalert2';

const AccountManagement = () => {
    // State management
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [limit] = useState(10);

    // Search and filter state
    const [searchEmail, setSearchEmail] = useState('');
    const [sortBy, setSortBy] = useState('id:asc');

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        age: ''
    });
    const [formErrors, setFormErrors] = useState({});

    console.log("users", users);

    // Load users data
    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: currentPage,
                limit: limit,
                email: searchEmail,
                sortBy: sortBy
            };

            const response = await userAPI.getUsers(params);

            if (response.success) {
                setUsers(response.responseObject.results || []);
                setTotalPages(response.responseObject.totalPages || 1);
                setTotalUsers(response.responseObject.total || 0);
            } else {
                setError(response.message || 'Không thể tải danh sách người dùng');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Load users on component mount and when dependencies change
    useEffect(() => {
        loadUsers();
    }, [currentPage, searchEmail, sortBy]);

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        loadUsers();
    };

    // Handle reset search
    const handleResetSearch = () => {
        setSearchEmail('');
        setSortBy('id:asc');
        setCurrentPage(1);
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle create user
    const handleCreateUser = async () => {
        // Validate form
        const errors = {};
        if (!formData.username.trim()) errors.username = 'Tên là bắt buộc';
        if (!formData.email.trim()) errors.email = 'Email là bắt buộc';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email không hợp lệ';
        if (formData.age && (isNaN(formData.age) || formData.age < 0)) errors.age = 'Tuổi phải là số dương';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setLoading(true);
        try {
            const userData = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                ...(formData.age && { age: parseInt(formData.age) })
            };

            const response = await userAPI.createUser(userData);

            if (response.user) {
                setSuccess('Tạo người dùng thành công!');
                setShowCreateModal(false);
                resetForm();
                loadUsers();

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Người dùng đã được tạo thành công.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                setError(response.message || 'Không thể tạo người dùng');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tạo người dùng');
        } finally {
            setLoading(false);
        }
    };

    // Handle edit user
    const handleEditUser = async () => {
        // Validate form
        const errors = {};
        if (!formData.username.trim()) errors.username = 'Tên là bắt buộc';
        if (!formData.email.trim()) errors.email = 'Email là bắt buộc';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email không hợp lệ';
        if (formData.age && (isNaN(formData.age) || formData.age < 0)) errors.age = 'Tuổi phải là số dương';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setLoading(true);
        try {
            const userData = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                ...(formData.age && { age: parseInt(formData.age) })
            };

            const response = await userAPI.updateUser(editingUser.id, userData);

            if (response.user) {
                setSuccess('Cập nhật người dùng thành công!');
                setShowEditModal(false);
                setEditingUser(null);
                resetForm();
                loadUsers();

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Thông tin người dùng đã được cập nhật.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                setError(response.message || 'Không thể cập nhật người dùng');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi cập nhật người dùng');
        } finally {
            setLoading(false);
        }
    };

    // Handle delete user
    const handleDeleteUser = async (user) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa',
            text: `Bạn có chắc chắn muốn xóa người dùng "${user.username}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const response = await userAPI.deleteUser(user.id);

                if (response.success) {
                    setSuccess('Xóa người dùng thành công!');
                    loadUsers();

                    Swal.fire({
                        icon: 'success',
                        title: 'Đã xóa!',
                        text: 'Người dùng đã được xóa thành công.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    setError(response.message || 'Không thể xóa người dùng');
                }
            } catch (err) {
                setError(err.message || 'Có lỗi xảy ra khi xóa người dùng');
            } finally {
                setLoading(false);
            }
        }
    };

    // Open edit modal
    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username || '',
            email: user.email || '',
            age: user.age || ''
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            age: ''
        });
        setFormErrors({});
    };

    // Open create modal
    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    // Close modals
    const closeModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingUser(null);
        resetForm();
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Clear messages
    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    return (
        <div className="container-fluid">
            <CRow>
                <CCol>
                    <CCard>
                        <CCardHeader>
                            <CRow className="align-items-center">
                                <CCol>
                                    <h4 className="mb-0">Quản lý tài khoản người dùng</h4>
                                    <p className="text-muted mb-0">Quản lý và theo dõi thông tin người dùng hệ thống</p>
                                </CCol>
                                <CCol xs="auto">
                                    <CButton
                                        color="primary"
                                        onClick={openCreateModal}
                                        className="me-2"
                                    >
                                        <CIcon icon={cilPlus} className="me-1" />
                                        Thêm người dùng
                                    </CButton>
                                    <CButton
                                        color="secondary"
                                        variant="outline"
                                        onClick={loadUsers}
                                        disabled={loading}
                                    >
                                        <CIcon icon={cilReload} className="me-1" />
                                        Làm mới
                                    </CButton>
                                </CCol>
                            </CRow>
                        </CCardHeader>
                        <CCardBody>
                            {/* Messages */}
                            {error && (
                                <CAlert color="danger" dismissible onClose={clearMessages}>
                                    {error}
                                </CAlert>
                            )}
                            {success && (
                                <CAlert color="success" dismissible onClose={clearMessages}>
                                    {success}
                                </CAlert>
                            )}

                            {/* Search and Filter */}
                            <CRow className="mb-3">
                                <CCol md={4}>
                                    <CInputGroup>
                                        <CInputGroupText>
                                            <CIcon icon={cilSearch} />
                                        </CInputGroupText>
                                        <CFormInput
                                            placeholder="Tìm kiếm theo email..."
                                            value={searchEmail}
                                            onChange={(e) => setSearchEmail(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </CInputGroup>
                                </CCol>
                                <CCol md={3}>
                                    <CFormSelect
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="id:asc">ID tăng dần</option>
                                        <option value="id:desc">ID giảm dần</option>
                                        <option value="email:asc">Email A-Z</option>
                                        <option value="email:desc">Email Z-A</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={2}>
                                    <CButton
                                        color="primary"
                                        onClick={handleSearch}
                                        className="w-100"
                                    >
                                        Tìm kiếm
                                    </CButton>
                                </CCol>
                                <CCol md={2}>
                                    <CButton
                                        color="secondary"
                                        variant="outline"
                                        onClick={handleResetSearch}
                                        className="w-100"
                                    >
                                        Đặt lại
                                    </CButton>
                                </CCol>
                            </CRow>

                            {/* Statistics */}
                            <CRow className="mb-3">
                                <CCol>
                                    <CBadge color="info" className="fs-6">
                                        Tổng số người dùng: {totalUsers}
                                    </CBadge>
                                </CCol>
                            </CRow>

                            {/* Users Table */}
                            {loading ? (
                                <div className="text-center py-4">
                                    <CSpinner />
                                    <p className="mt-2">Đang tải dữ liệu...</p>
                                </div>
                            ) : (
                                <>
                                    <CTable responsive striped hover>
                                        <CTableHead>
                                            <CTableRow>
                                                <CTableHeaderCell>ID</CTableHeaderCell>
                                                <CTableHeaderCell>Tên</CTableHeaderCell>
                                                <CTableHeaderCell>Email</CTableHeaderCell>
                                                <CTableHeaderCell>Tuổi</CTableHeaderCell>
                                                <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                                                <CTableHeaderCell>Cập nhật cuối</CTableHeaderCell>
                                                <CTableHeaderCell>Thao tác</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {users.length === 0 ? (
                                                <CTableRow>
                                                    <CTableDataCell colSpan="7" className="text-center py-4">
                                                        Không có dữ liệu người dùng
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ) : (
                                                users.map((user) => (
                                                    <CTableRow key={user.id}>
                                                        <CTableDataCell>{user.id}</CTableDataCell>
                                                        <CTableDataCell>{user.username}</CTableDataCell>
                                                        <CTableDataCell>{user.email}</CTableDataCell>
                                                        <CTableDataCell>{user.age || 'N/A'}</CTableDataCell>
                                                        <CTableDataCell>{formatDate(user.createdAt)}</CTableDataCell>
                                                        <CTableDataCell>{formatDate(user.updatedAt)}</CTableDataCell>
                                                        <CTableDataCell>
                                                            <CButton
                                                                color="warning"
                                                                variant="outline"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() => openEditModal(user)}
                                                            >
                                                                <CIcon icon={cilPencil} />
                                                            </CButton>
                                                            <CButton
                                                                color="danger"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteUser(user)}
                                                            >
                                                                <CIcon icon={cilTrash} />
                                                            </CButton>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                ))
                                            )}
                                        </CTableBody>
                                    </CTable>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <CPagination className="justify-content-center">
                                            <CPaginationItem
                                                disabled={currentPage === 1}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            >
                                                Trước
                                            </CPaginationItem>

                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <CPaginationItem
                                                    key={page}
                                                    active={page === currentPage}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </CPaginationItem>
                                            ))}

                                            <CPaginationItem
                                                disabled={currentPage === totalPages}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            >
                                                Sau
                                            </CPaginationItem>
                                        </CPagination>
                                    )}
                                </>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Create User Modal */}
            <CModal visible={showCreateModal} onClose={closeModals} size="lg">
                <CModalHeader>
                    <CModalTitle>Thêm người dùng mới</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CRow>
                            <CCol md={6}>
                                <CFormLabel>Tên *</CFormLabel>
                                <CFormInput
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    isInvalid={!!formErrors.username}
                                />
                                {formErrors.username && (
                                    <div className="invalid-feedback d-block">{formErrors.username}</div>
                                )}
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel>Email *</CFormLabel>
                                <CFormInput
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    isInvalid={!!formErrors.email}
                                />
                                {formErrors.email && (
                                    <div className="invalid-feedback d-block">{formErrors.email}</div>
                                )}
                            </CCol>
                        </CRow>
                        <CRow className="mt-3">
                            <CCol md={6}>
                                <CFormLabel>Tuổi</CFormLabel>
                                <CFormInput
                                    type="number"
                                    min="0"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    isInvalid={!!formErrors.age}
                                />
                                {formErrors.age && (
                                    <div className="invalid-feedback d-block">{formErrors.age}</div>
                                )}
                            </CCol>
                        </CRow>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={closeModals}>
                        Hủy
                    </CButton>
                    <CButton color="primary" onClick={handleCreateUser} disabled={loading}>
                        {loading ? <CSpinner size="sm" /> : 'Tạo người dùng'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Edit User Modal */}
            <CModal visible={showEditModal} onClose={closeModals} size="lg">
                <CModalHeader>
                    <CModalTitle>Chỉnh sửa thông tin người dùng</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CRow>
                            <CCol md={6}>
                                <CFormLabel>Tên *</CFormLabel>
                                <CFormInput
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    isInvalid={!!formErrors.username}
                                />
                                {formErrors.username && (
                                    <div className="invalid-feedback d-block">{formErrors.username}</div>
                                )}
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel>Email *</CFormLabel>
                                <CFormInput
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    isInvalid={!!formErrors.email}
                                />
                                {formErrors.email && (
                                    <div className="invalid-feedback d-block">{formErrors.email}</div>
                                )}
                            </CCol>
                        </CRow>
                        <CRow className="mt-3">
                            <CCol md={6}>
                                <CFormLabel>Tuổi</CFormLabel>
                                <CFormInput
                                    type="number"
                                    min="0"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    isInvalid={!!formErrors.age}
                                />
                                {formErrors.age && (
                                    <div className="invalid-feedback d-block">{formErrors.age}</div>
                                )}
                            </CCol>
                        </CRow>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={closeModals}>
                        Hủy
                    </CButton>
                    <CButton color="primary" onClick={handleEditUser} disabled={loading}>
                        {loading ? <CSpinner size="sm" /> : 'Cập nhật'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default AccountManagement;


