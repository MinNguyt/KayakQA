import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../../lib/Api';
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
    CFormInput,
    CFormSelect,
    CSpinner,
    CAlert,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CBadge,
    CPagination
} from '@coreui/react';

const TicketManagement = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // Fetch tickets
    const fetchTickets = async (page = 1, search = '', status = '') => {
        setLoading(true);
        setError('');
        try {
            const response = await ticketAPI.getTickets({
                page,
                limit: 10,
                search,
                status
            });

            if (response.success) {
                // Handle both old and new response formats
                console.log("response", response)
                if (response.responseObject) {
                    // New paginated format
                    setTickets(response.responseObject.tickets || []);
                    setTotalPages(Math.ceil(response.total / response.limit));
                }
            } else {
                setError(response.message || 'Không thể tải danh sách vé');
            }
        } catch (error) {
            setError(error.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Load tickets on component mount
    useEffect(() => {
        fetchTickets(currentPage, searchTerm, statusFilter);
    }, [currentPage]);

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        fetchTickets(1, searchTerm, statusFilter);
    };

    // Handle status filter change
    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
        fetchTickets(1, searchTerm, status);
    };

    // Handle cancel ticket
    const handleCancelTicket = async () => {
        if (!selectedTicket || !cancelReason.trim()) {
            setError('Vui lòng nhập lý do hủy vé');
            return;
        }

        setCancelling(true);
        try {
            const response = await ticketAPI.adminCancelTicket(selectedTicket.id, cancelReason);
            if (response.success) {
                setSuccess('Hủy vé thành công');
                setShowCancelModal(false);
                setCancelReason('');
                setSelectedTicket(null);
                fetchTickets(currentPage, searchTerm, statusFilter);
            } else {
                setError(response.message || 'Hủy vé thất bại');
            }
        } catch (error) {
            setError(error.message || 'Lỗi khi hủy vé');
        } finally {
            setCancelling(false);
        }
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'BOOKED':
            case 'confirmed':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'CANCELED':
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    // Get payment status badge color
    const getPaymentStatusBadgeColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'BOOKED':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'CANCELED':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return '0₫';
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    };

    return (
        <div className="container-fluid">
            <CRow>
                <CCol>
                    <CCard>
                        <CCardHeader>
                            <h4 className="mb-0">Quản lý vé xe</h4>
                        </CCardHeader>
                        <CCardBody>
                            {/* Search and Filter */}
                            <CRow className="mb-3">
                                <CCol md={4}>
                                    <CFormInput
                                        type="text"
                                        placeholder="Tìm kiếm theo mã vé, Số tiền,..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </CCol>
                                <CCol md={3}>
                                    <CFormSelect
                                        value={statusFilter}
                                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="PENDING">Đang chờ</option>
                                        <option value="BOOKED">Đã đặt</option>
                                        <option value="CANCELED">Đã hủy</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={2}>
                                    <CButton color="primary" onClick={handleSearch}>
                                        Tìm kiếm
                                    </CButton>
                                </CCol>
                                <CCol md={3} className="text-end">
                                    <CButton color="success" onClick={() => fetchTickets(currentPage, searchTerm, statusFilter)}>
                                        Làm mới
                                    </CButton>
                                </CCol>
                            </CRow>

                            {/* Alerts */}
                            {error && (
                                <CAlert color="danger" dismissible onClose={() => setError('')}>
                                    {error}
                                </CAlert>
                            )}
                            {success && (
                                <CAlert color="success" dismissible onClose={() => setSuccess('')}>
                                    {success}
                                </CAlert>
                            )}

                            {/* Tickets Table */}
                            {loading ? (
                                <div className="text-center py-4">
                                    <CSpinner />
                                    <p className="mt-2">Đang tải dữ liệu...</p>
                                </div>
                            ) : (
                                <>
                                    <CTable striped hover responsive>
                                        <CTableHead>
                                            <CTableRow>
                                                <CTableHeaderCell>Mã vé</CTableHeaderCell>
                                                <CTableHeaderCell>Lịch trình</CTableHeaderCell>
                                                <CTableHeaderCell>Xe</CTableHeaderCell>
                                                <CTableHeaderCell>Số tiền</CTableHeaderCell>
                                                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                                                {/* <CTableHeaderCell>Thanh toán</CTableHeaderCell> */}
                                                <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                                                <CTableHeaderCell>Thao tác</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {tickets.length === 0 ? (
                                                <CTableRow>
                                                    <CTableDataCell colSpan="8" className="text-center py-4">
                                                        Không có dữ liệu
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ) : (
                                                tickets.map((ticket) => (
                                                    <CTableRow key={ticket.id}>
                                                        <CTableDataCell>
                                                            <strong>#{ticket.id}</strong>
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            #{ticket.schedule_id}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            {ticket.car_name}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            {formatCurrency(ticket.total_price)}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            <CBadge color={getStatusBadgeColor(ticket.status)}>
                                                                {ticket.status || 'PENDING'}
                                                            </CBadge>
                                                        </CTableDataCell>
                                                        {/* <CTableDataCell>
                                                            <CBadge color={getPaymentStatusBadgeColor(ticket.status)}>
                                                                {ticket.status || 'PENDING'}
                                                            </CBadge>
                                                        </CTableDataCell> */}
                                                        <CTableDataCell>
                                                            {formatDate(ticket.created_at)}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            <CButton
                                                                color="danger"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedTicket(ticket);
                                                                    setShowCancelModal(true);
                                                                }}
                                                                disabled={ticket.status === 'CANCELED'}
                                                            >
                                                                Hủy vé
                                                            </CButton>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                ))
                                            )}
                                        </CTableBody>
                                    </CTable>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="d-flex justify-content-center mt-3">
                                            <CPagination
                                                activePage={currentPage}
                                                pages={totalPages}
                                                onActivePageChange={setCurrentPage}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Cancel Ticket Modal */}
            <CModal visible={showCancelModal} onClose={() => setShowCancelModal(false)}>
                <CModalHeader>
                    <CModalTitle>Hủy vé #{selectedTicket?.id}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <div className="mb-3">
                        <label className="form-label">Lý do hủy vé:</label>
                        <CFormInput
                            type="text"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Nhập lý do hủy vé..."
                        />
                    </div>
                    <div className="alert alert-warning">
                        <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Vé sẽ được hủy và ghế sẽ được giải phóng.
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowCancelModal(false)}>
                        Hủy
                    </CButton>
                    <CButton
                        color="danger"
                        onClick={handleCancelTicket}
                        disabled={cancelling || !cancelReason.trim()}
                    >
                        {cancelling ? <CSpinner size="sm" /> : 'Xác nhận hủy'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default TicketManagement;


