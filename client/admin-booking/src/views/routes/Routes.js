import React, { useState, useEffect } from 'react';
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
    CFormSelect,
    CSpinner,
    CAlert,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CPagination,
    CPaginationItem,
    CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilLocationPin, cilSpeedometer } from '@coreui/icons';
import { routesAPI, stationAPI } from '../../lib/Api';
import RoutesModal from './RoutesModal';

const Routes = () => {
    // State management
    const [routes, setRoutes] = useState([]);
    const [stations, setStations] = useState([]);
    const [statistics, setStatistics] = useState({
        totalRoutes: 0,
        avgDistance: 0,
        avgDuration: 0,
        recentRoutes: 0
    });
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editData, setEditData] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

    // Pagination and filtering
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [departureStationFilter, setDepartureStationFilter] = useState('');
    const [arrivalStationFilter, setArrivalStationFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // Load data on component mount
    useEffect(() => {
        loadData();
        loadStations();
    }, [currentPage, pageSize, departureStationFilter, arrivalStationFilter, sortBy, sortOrder]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await routesAPI.getRoutes({
                page: currentPage,
                limit: pageSize,
                departure_station_id: departureStationFilter || undefined,
                arrival_station_id: arrivalStationFilter || undefined,
                sortBy,
                order: sortOrder
            });

            if (response.success || response.routes) {
                const routesData = response.routes || response.responseObject?.results || [];
                setRoutes(routesData);

                // Calculate total pages
                const total = response.rotal || response.responseObject?.total || 0;
                setTotalPages(Math.ceil(total / pageSize));

                // Load all routes for statistics
                const allRoutesResponse = await routesAPI.getRoutes({
                    page: 1,
                    limit: 1000,
                    departure_station_id: departureStationFilter || undefined,
                    arrival_station_id: arrivalStationFilter || undefined,
                    sortBy,
                    order: sortOrder
                });

                if (allRoutesResponse.success) {
                    const allRoutes = allRoutesResponse.responseObject?.results || [];
                    calculateStatistics(allRoutes, allRoutesResponse.responseObject?.total || allRoutes.length);
                } else {
                    calculateStatistics(routesData, total);
                }
            } else {
                setAlert({
                    show: true,
                    message: response.message || 'Failed to load routes',
                    type: 'danger'
                });
            }
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'An error occurred while loading data',
                type: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadStations = async () => {
        try {
            const response = await stationAPI.getStations({ limit: 1000 });

            if (response.success || response.stations) {
                setStations(response.stations || response.responseObject || []);
            }
        } catch (error) {
            console.error('Failed to load stations:', error);
        }
    };

    const calculateStatistics = (routesData, total) => {
        const avgDistance = routesData.length > 0
            ? routesData.reduce((sum, route) => sum + (+route.distance_km || 0), 0) / routesData.length
            : 0;

        const avgDuration = routesData.length > 0
            ? routesData.reduce((sum, route) => sum + (+route.estimated_duration_hours || 0), 0) / routesData.length
            : 0;

        const recentRoutes = routesData.filter(route => {
            const createdDate = new Date(route.created_at);
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return createdDate > oneMonthAgo;
        }).length;

        setStatistics({
            totalRoutes: total,
            avgDistance: Math.round(avgDistance * 10) / 10,
            avgDuration: Math.round(avgDuration * 10) / 10,
            recentRoutes
        });
    };

    const handleCreate = () => {
        setModalMode('create');
        setEditData(null);
        setModalVisible(true);
    };

    const handleEdit = (route) => {
        setModalMode('edit');
        setEditData(route);
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await routesAPI.deleteRoute(deleteId);
            setAlert({
                show: true,
                message: 'Route deleted successfully!',
                type: 'success'
            });
            setDeleteModalVisible(false);
            setDeleteId(null);
            loadData();
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to delete route',
                type: 'danger'
            });
        }
    };

    const handleModalSuccess = () => {
        loadData();
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStationName = (stationId) => {
        const station = stations.find(s => s.id === stationId);
        return station ? station.name : `Station ${stationId}`;
    };

    const resetFilters = () => {
        setDepartureStationFilter('');
        setArrivalStationFilter('');
        setCurrentPage(1);
    };

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Quản lý tuyến đường</h2>
                    <p className="text-muted mb-0">Quản lý thông tin và hoạt động của các tuyến đường</p>
                </div>
                <CButton
                    color="primary"
                    onClick={handleCreate}
                    className="d-flex align-items-center"
                >
                    <CIcon icon={cilPlus} className="me-2" />
                    Thêm tuyến đường mới
                </CButton>
            </div>

            {/* Alert */}
            {alert.show && (
                <CAlert
                    color={alert.type}
                    dismissible
                    onClose={() => setAlert({ show: false, message: '', type: 'success' })}
                    className="mb-4"
                >
                    {alert.message}
                </CAlert>
            )}

            {/* Statistics Cards */}
            <CRow className="mb-4">
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-primary">
                        <CCardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h4 className="mb-0">{statistics.totalRoutes}</h4>
                                    <p className="mb-0">Tổng số tuyến</p>
                                </div>
                                <div className="align-self-center">
                                    <CIcon icon={cilLocationPin} size="2xl" />
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-success">
                        <CCardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h4 className="mb-0">{statistics.avgDistance || 0} km</h4>
                                    <p className="mb-0">Khoảng cách TB</p>
                                </div>
                                <div className="align-self-center">
                                    <CIcon icon={cilSpeedometer} size="2xl" />
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-info">
                        <CCardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h4 className="mb-0">{statistics.avgDuration || 0}h</h4>
                                    <p className="mb-0">Thời gian TB</p>
                                </div>
                                <div className="align-self-center">
                                    <CIcon icon={cilSpeedometer} size="2xl" />
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-warning">
                        <CCardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h4 className="mb-0">{statistics.recentRoutes}</h4>
                                    <p className="mb-0">Tuyến mới (1 tháng)</p>
                                </div>
                                <div className="align-self-center">
                                    <CIcon icon={cilLocationPin} size="2xl" />
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Main Content */}
            <CCard>
                <CCardHeader>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Danh sách tuyến đường</h5>
                        <div className="d-flex gap-2">
                            <CFormSelect
                                value={departureStationFilter}
                                onChange={(e) => {
                                    setDepartureStationFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={{ width: '180px' }}
                            >
                                <option value="">Trạm khởi hành</option>
                                {stations.map(station => (
                                    <option key={station.id} value={station.id}>
                                        {station.name}
                                    </option>
                                ))}
                            </CFormSelect>

                            <CFormSelect
                                value={arrivalStationFilter}
                                onChange={(e) => {
                                    setArrivalStationFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={{ width: '180px' }}
                            >
                                <option value="">Trạm đến</option>
                                {stations.map(station => (
                                    <option key={station.id} value={station.id}>
                                        {station.name}
                                    </option>
                                ))}
                            </CFormSelect>

                            <CButton
                                color="secondary"
                                onClick={resetFilters}
                                title="Reset bộ lọc"
                            >
                                Reset
                            </CButton>

                            <CFormSelect
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                style={{ width: '100px' }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </CFormSelect>
                        </div>
                    </div>
                </CCardHeader>
                <CCardBody>
                    {loading ? (
                        <div className="text-center py-4">
                            <CSpinner color="primary" />
                            <p className="mt-2">Đang tải dữ liệu...</p>
                        </div>
                    ) : routes.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">Không có dữ liệu tuyến đường nào</p>
                        </div>
                    ) : (
                        <>
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>#</CTableHeaderCell>
                                        <CTableHeaderCell>Trạm khởi hành</CTableHeaderCell>
                                        <CTableHeaderCell>Trạm đến</CTableHeaderCell>
                                        <CTableHeaderCell
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSort('distance_km')}
                                        >
                                            Khoảng cách (km)
                                            {sortBy === 'distance_km' && (
                                                <span className="ms-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </CTableHeaderCell>
                                        <CTableHeaderCell
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSort('estimated_duration_hours')}
                                        >
                                            Thời gian (giờ)
                                            {sortBy === 'estimated_duration_hours' && (
                                                <span className="ms-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </CTableHeaderCell>
                                        <CTableHeaderCell
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSort('created_at')}
                                        >
                                            Ngày tạo
                                            {sortBy === 'created_at' && (
                                                <span className="ms-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </CTableHeaderCell>
                                        <CTableHeaderCell>Thao tác</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {routes.map((route, index) => (
                                        <CTableRow key={route.id}>
                                            <CTableDataCell>
                                                {(currentPage - 1) * pageSize + index + 1}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <strong>{route.departureStation ? route.departureStation.name : getStationName(route.departure_station_id)}</strong>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <strong>{route.arrivalStation ? route.arrivalStation.name : getStationName(route.arrival_station_id)}</strong>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color="info">{route.distance_km} km</CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color="warning">{route.estimated_duration_hours}h</CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {formatDate(route.createdAt || route.created_at)}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <div className="d-flex gap-1">
                                                    <CButton
                                                        color="info"
                                                        size="sm"
                                                        onClick={() => handleEdit(route)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <CIcon icon={cilPencil} />
                                                    </CButton>
                                                    <CButton
                                                        color="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(route.id)}
                                                        title="Xóa"
                                                    >
                                                        <CIcon icon={cilTrash} />
                                                    </CButton>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <CPagination>
                                        <CPaginationItem
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                        >
                                            Trước
                                        </CPaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <CPaginationItem
                                                key={page}
                                                active={page === currentPage}
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </CPaginationItem>
                                        ))}

                                        <CPaginationItem
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                        >
                                            Sau
                                        </CPaginationItem>
                                    </CPagination>
                                </div>
                            )}
                        </>
                    )}
                </CCardBody>
            </CCard>

            {/* Create/Edit Modal */}
            <RoutesModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={handleModalSuccess}
                editData={editData}
                mode={modalMode}
                stations={stations}
            />

            {/* Delete Confirmation Modal */}
            <CModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                color="danger"
            >
                <CModalHeader closeButton>
                    <CModalTitle>Xác nhận xóa</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    Bạn có chắc chắn muốn xóa tuyến đường này không? Hành động này không thể hoàn tác.
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
                        Hủy
                    </CButton>
                    <CButton color="danger" onClick={confirmDelete}>
                        Xóa
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default Routes;
