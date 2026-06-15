import React, { useState, useEffect } from 'react';
import {
    Search, Ticket, MapPin, Clock, User, Calendar, AlertCircle, CheckCircle,
    Bus, Building, List, XCircle, Loader2, ArrowRight, RefreshCw, LogIn,
    CreditCard, ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import Navigation from '../Navigation';
import Footer from '../components/Footer';
import apiService from '../../../services/api.service';

const CheckTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [enrichedTickets, setEnrichedTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [enrichingData, setEnrichingData] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [cancellingTicketId, setCancellingTicketId] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedTicketForCancel, setSelectedTicketForCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [expandedTickets, setExpandedTickets] = useState({});

    // Check authentication status and load user tickets on component mount
    useEffect(() => {
        checkAuthAndLoadTickets();
    }, []);

    const checkAuthAndLoadTickets = async () => {
        const token = apiService.getAuthToken();
        if (!token) {
            setIsAuthenticated(false);
            return;
        }
        setIsAuthenticated(true);
        await loadUserTickets();
    };

    const loadUserTickets = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await apiService.getCurrentUserTickets({ includeAuth: true });

            if (response.success) {
                const ticketsList = response.data.responseObject || [];
                setTickets(ticketsList);

                if (ticketsList.length > 0) {
                    await enrichTicketsWithData(ticketsList);
                } else {
                    setEnrichedTickets([]);
                }
            } else {
                if (response.status === 401) {
                    setIsAuthenticated(false);
                    setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                } else {
                    setError(response.error || 'Không thể tải vé của bạn');
                }
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi tải vé. Vui lòng thử lại.');
            console.error('Load tickets error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Enrich tickets with schedule, route, vehicle, and seat data
    const enrichTicketsWithData = async (ticketsList) => {
        setEnrichingData(true);

        try {
            const enrichedData = await Promise.all(
                ticketsList.map(async (ticket) => {
                    let enrichedTicket = { ...ticket };

                    try {
                        if (ticket.scheduleId) {
                            const scheduleResponse = await apiService.getScheduleById(ticket.scheduleId);
                            if (scheduleResponse.success && scheduleResponse.data?.data) {
                                const schedule = scheduleResponse.data.data;
                                enrichedTicket.schedule = schedule;
                                enrichedTicket.departureTime = schedule.departureTime;
                                enrichedTicket.arrivalTime = schedule.arrivalTime;

                                if (schedule.routeId) {
                                    const routeResponse = await apiService.getRoute(schedule.routeId);
                                    if (routeResponse.success && routeResponse.data?.data) {
                                        const route = routeResponse.data.data;
                                        enrichedTicket.route = route;
                                        enrichedTicket.departureStation = route.departureStation;
                                        enrichedTicket.arrivalStation = route.arrivalStation;
                                    }
                                }

                                if (schedule.busId) {
                                    const vehicleResponse = await apiService.getVehicleById(schedule.busId);
                                    if (vehicleResponse.success && vehicleResponse.data?.data) {
                                        const vehicle = vehicleResponse.data.data;
                                        enrichedTicket.vehicle = vehicle;
                                        enrichedTicket.busName = vehicle.name;
                                        enrichedTicket.licensePlate = vehicle.licensePlate;
                                        enrichedTicket.companyName = vehicle.companyName;

                                        if (ticket.seatId) {
                                            const seatsResponse = await apiService.getSeatsByVehicleId(schedule.busId);
                                            if (seatsResponse.success && seatsResponse.data?.responseObject) {
                                                const seats = seatsResponse.data.responseObject;
                                                const seat = seats.find(s => s.id === ticket.seatId);
                                                if (seat) {
                                                    enrichedTicket.seat = seat;
                                                    enrichedTicket.seatNumber = seat.seatNumber;
                                                    enrichedTicket.seatType = seat.seatType;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } catch (enrichError) {
                        console.error(`Error enriching ticket ${ticket.id}:`, enrichError);
                    }

                    return enrichedTicket;
                })
            );

            setEnrichedTickets(enrichedData);
        } catch (err) {
            console.error('Error enriching tickets:', err);
            setEnrichedTickets(ticketsList);
        } finally {
            setEnrichingData(false);
        }
    };

    const handleRefresh = () => {
        loadUserTickets();
    };

    const handleCancelClick = (ticket) => {
        setSelectedTicketForCancel(ticket);
        setCancelReason('');
        setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        if (!selectedTicketForCancel) return;

        setCancellingTicketId(selectedTicketForCancel.id);
        setError('');

        try {
            const response = await apiService.cancelTicket(
                selectedTicketForCancel.id,
                cancelReason || 'Khách hàng yêu cầu hủy vé'
            );

            if (response.success) {
                setSuccess(`Vé #${selectedTicketForCancel.id} đã được hủy thành công!`);
                setShowCancelModal(false);
                setSelectedTicketForCancel(null);
                setCancelReason('');
                await loadUserTickets();
            } else {
                setError(response.error || 'Không thể hủy vé. Vui lòng thử lại.');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi hủy vé. Vui lòng thử lại.');
            console.error('Cancel ticket error:', err);
        } finally {
            setCancellingTicketId(null);
        }
    };

    const toggleTicketExpand = (ticketId) => {
        setExpandedTickets(prev => ({
            ...prev,
            [ticketId]: !prev[ticketId]
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '--:--';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '--:--';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'BOOKED':
                return {
                    color: 'bg-emerald-500',
                    bgLight: 'bg-emerald-50',
                    textColor: 'text-emerald-700',
                    borderColor: 'border-emerald-200',
                    label: 'Đã xác nhận',
                    icon: CheckCircle
                };
            case 'CANCELLED':
                return {
                    color: 'bg-red-500',
                    bgLight: 'bg-red-50',
                    textColor: 'text-red-700',
                    borderColor: 'border-red-200',
                    label: 'Đã hủy',
                    icon: XCircle
                };
            case 'PENDING':
                return {
                    color: 'bg-amber-500',
                    bgLight: 'bg-amber-50',
                    textColor: 'text-amber-700',
                    borderColor: 'border-amber-200',
                    label: 'Chờ thanh toán',
                    icon: Clock
                };
            default:
                return {
                    color: 'bg-gray-500',
                    bgLight: 'bg-gray-50',
                    textColor: 'text-gray-700',
                    borderColor: 'border-gray-200',
                    label: status,
                    icon: AlertCircle
                };
        }
    };

    const getSeatTypeLabel = (seatType) => {
        switch (seatType) {
            case 'VIP': return 'VIP';
            case 'STANDARD': return 'Thường';
            case 'ECONOMY': return 'Tiết kiệm';
            default: return seatType || 'N/A';
        }
    };

    const filterCounts = {
        ALL: enrichedTickets.length,
        BOOKED: enrichedTickets.filter(t => t.status === 'BOOKED').length,
        PENDING: enrichedTickets.filter(t => t.status === 'PENDING').length,
        CANCELLED: enrichedTickets.filter(t => t.status === 'CANCELLED').length
    };

    const filteredTickets = activeFilter === 'ALL'
        ? enrichedTickets
        : enrichedTickets.filter(t => t.status === activeFilter);

    // Ticket Card Component
    const TicketCard = ({ ticket }) => {
        const statusConfig = getStatusConfig(ticket.status);
        const StatusIcon = statusConfig.icon;
        const isExpanded = expandedTickets[ticket.id];

        return (
            <div className={`relative overflow-hidden rounded-2xl border-2 ${statusConfig.borderColor} bg-white shadow-lg hover:shadow-xl transition-all duration-300`}>
                {/* Status Ribbon */}
                <div className={`absolute top-0 right-0 ${statusConfig.color} text-white px-4 py-1 text-xs font-bold rounded-bl-xl`}>
                    {statusConfig.label}
                </div>

                {/* Ticket Header - Compact View */}
                <div className="p-5">
                    {/* Route Summary */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 flex-1">
                            {/* Departure */}
                            <div className="text-center min-w-[100px]">
                                <p className="text-2xl font-bold text-gray-900">{formatTime(ticket.departureTime)}</p>
                                <p className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">
                                    {ticket.departureStation?.name || 'Đang tải...'}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(ticket.departureTime)}</p>
                            </div>

                            {/* Arrow & Duration */}
                            <div className="flex-1 flex flex-col items-center px-2">
                                <div className="w-full flex items-center">
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-sky-400 to-sky-600"></div>
                                    <Bus className="w-6 h-6 text-sky-600 mx-2" />
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-sky-600 to-emerald-500"></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {ticket.route?.distance_km ? `${ticket.route.distance_km} km` : ''}
                                </p>
                            </div>

                            {/* Arrival */}
                            <div className="text-center min-w-[100px]">
                                <p className="text-2xl font-bold text-gray-900">{formatTime(ticket.arrivalTime)}</p>
                                <p className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">
                                    {ticket.arrivalStation?.name || 'Đang tải...'}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(ticket.arrivalTime)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info Bar */}
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl mb-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-sky-600" />
                                <span className="text-sm font-medium text-gray-700">Mã vé: <span className="font-bold text-sky-600">#{ticket.id}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    Ghế: <span className="font-bold">{ticket.seatNumber || ticket.seatId}</span>
                                    {ticket.seatType && <span className="ml-1 text-xs text-gray-500">({getSeatTypeLabel(ticket.seatType)})</span>}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-emerald-600">
                                {ticket.totalPrice?.toLocaleString('vi-VN') || '0'} ₫
                            </p>
                        </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                        onClick={() => toggleTicketExpand(ticket.id)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-sky-600 transition-colors"
                    >
                        {isExpanded ? (
                            <>Thu gọn <ChevronUp className="w-4 h-4" /></>
                        ) : (
                            <>Chi tiết <ChevronDown className="w-4 h-4" /></>
                        )}
                    </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-dashed border-gray-200 p-5 bg-gray-50/50">
                        {/* Bus & Company Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                                <Bus className="w-5 h-5 text-sky-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Thông tin xe</p>
                                    <p className="font-semibold text-gray-900">{ticket.busName || 'Đang tải...'}</p>
                                    <p className="text-sm text-gray-600">Biển số: {ticket.licensePlate || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                                <Building className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Nhà xe</p>
                                    <p className="font-semibold text-gray-900">{ticket.companyName || 'Đang tải...'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Station Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-start gap-3 p-3 bg-sky-50 rounded-xl border border-sky-100">
                                <MapPin className="w-5 h-5 text-sky-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-sky-600 uppercase tracking-wide font-medium">Điểm đón</p>
                                    <p className="font-semibold text-gray-900">{ticket.departureStation?.name || 'Đang tải...'}</p>
                                    <p className="text-sm text-gray-600">{ticket.departureStation?.location || ticket.departureStation?.city || ''}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-emerald-600 uppercase tracking-wide font-medium">Điểm đến</p>
                                    <p className="font-semibold text-gray-900">{ticket.arrivalStation?.name || 'Đang tải...'}</p>
                                    <p className="text-sm text-gray-600">{ticket.arrivalStation?.location || ticket.arrivalStation?.city || ''}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        {ticket.payment && (
                            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 mb-4">
                                <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Thanh toán</p>
                                    <p className="font-semibold text-green-600">{ticket.payment.gateway}</p>
                                    <p className="text-sm text-gray-600">
                                        {ticket.totalPrice?.toLocaleString('vi-VN')} ₫ - {ticket.payment.status}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Cancel Reason */}
                        {ticket.status === 'CANCELLED' && ticket.cancelReason && (
                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100 mb-4">
                                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Lý do hủy</p>
                                    <p className="text-sm text-red-700">{ticket.cancelReason}</p>
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                            <span>Đặt lúc: {formatTime(ticket.createdAt)} - {formatDate(ticket.createdAt)}</span>
                            {ticket.updatedAt !== ticket.createdAt && (
                                <span>Cập nhật: {formatTime(ticket.updatedAt)} - {formatDate(ticket.updatedAt)}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {ticket.status === 'BOOKED' && (
                    <div className="border-t border-gray-100 p-4 flex justify-end">
                        <button
                            onClick={() => handleCancelClick(ticket)}
                            disabled={cancellingTicketId === ticket.id}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {cancellingTicketId === ticket.id ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Đang hủy...</>
                            ) : (
                                <><XCircle className="w-4 h-4" /> Hủy vé</>
                            )}
                        </button>
                    </div>
                )}

                {ticket.status === 'PENDING' && (
                    <div className="border-t border-amber-100 p-4 bg-amber-50/50">
                        <div className="flex items-center gap-2 text-amber-700">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-medium">Vui lòng hoàn tất thanh toán để xác nhận vé</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-sky-50/30 to-gray-100">
            <Navigation />

            <div className="container mx-auto px-4 py-8">
                {/* Hero Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl shadow-lg shadow-sky-200 mb-4">
                        <Ticket className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-sky-800 to-gray-900 bg-clip-text text-transparent mb-3">
                        Vé Xe Của Tôi
                    </h1>
                    <p className="text-gray-600 max-w-lg mx-auto">
                        Quản lý và theo dõi tất cả các vé xe đã đặt của bạn
                    </p>
                </div>

                {/* Not Authenticated State */}
                {!isAuthenticated && (
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <LogIn className="w-10 h-10 text-sky-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Đăng nhập để xem vé</h2>
                            <p className="text-gray-600 mb-6">
                                Bạn cần đăng nhập vào tài khoản để xem và quản lý các vé đã đặt
                            </p>
                            <a
                                href="/login"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 shadow-lg shadow-sky-200 transition-all"
                            >
                                <LogIn className="w-5 h-5" />
                                Đăng nhập ngay
                            </a>
                        </div>
                    </div>
                )}

                {/* Authenticated Content */}
                {isAuthenticated && (
                    <>
                        {/* Alert Messages */}
                        {error && (
                            <div className="max-w-4xl mx-auto mb-6">
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="max-w-4xl mx-auto mb-6">
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-medium">{success}</span>
                                </div>
                            </div>
                        )}

                        {/* Filter Tabs & Refresh */}
                        <div className="max-w-4xl mx-auto mb-6">
                            <div className="bg-white rounded-2xl shadow-md p-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Filter Tabs */}
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                                    {[
                                        { key: 'ALL', label: 'Tất cả', color: 'sky' },
                                        { key: 'BOOKED', label: 'Đã xác nhận', color: 'emerald' },
                                        { key: 'PENDING', label: 'Chờ thanh toán', color: 'amber' },
                                        { key: 'CANCELLED', label: 'Đã hủy', color: 'red' }
                                    ].map(filter => (
                                        <button
                                            key={filter.key}
                                            onClick={() => setActiveFilter(filter.key)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter.key
                                                ? `bg-white shadow text-${filter.color}-600`
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            {filter.label}
                                            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${activeFilter === filter.key
                                                ? `bg-${filter.color}-100 text-${filter.color}-600`
                                                : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {filterCounts[filter.key]}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Refresh Button */}
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading || enrichingData}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-sky-50 text-sky-600 rounded-xl font-medium hover:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <RefreshCw className={`w-4 h-4 ${(loading || enrichingData) ? 'animate-spin' : ''}`} />
                                    {loading || enrichingData ? 'Đang tải...' : 'Làm mới'}
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {(loading || enrichingData) && enrichedTickets.length === 0 && (
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                                    <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium">
                                        {enrichingData ? 'Đang tải thông tin chi tiết...' : 'Đang tải danh sách vé...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !enrichingData && filteredTickets.length === 0 && (
                            <div className="max-w-md mx-auto">
                                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Ticket className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {activeFilter === 'ALL' ? 'Chưa có vé nào' : `Không có vé ${getStatusConfig(activeFilter).label.toLowerCase()}`}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {activeFilter === 'ALL'
                                            ? 'Bạn chưa đặt vé nào. Hãy đặt vé ngay để bắt đầu hành trình!'
                                            : 'Thử chọn bộ lọc khác để xem các vé của bạn'}
                                    </p>
                                    {activeFilter === 'ALL' && (
                                        <a
                                            href="/"
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 shadow-lg shadow-sky-200 transition-all"
                                        >
                                            <Search className="w-5 h-5" />
                                            Tìm chuyến xe
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Ticket List */}
                        {!loading && filteredTickets.length > 0 && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                {filteredTickets.map(ticket => (
                                    <TicketCard key={ticket.id} ticket={ticket} />
                                ))}
                            </div>
                        )}

                        {/* Help Section */}
                        <div className="max-w-4xl mx-auto mt-12">
                            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-sky-600" />
                                    Thông tin hỗ trợ
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                    <div className="space-y-2">
                                        <p>• Vé trạng thái <span className="font-medium text-emerald-600">"Đã xác nhận"</span> sẵn sàng sử dụng</p>
                                        <p>• Vé <span className="font-medium text-amber-600">"Chờ thanh toán"</span> cần hoàn tất thanh toán</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p>• Bạn có thể hủy vé đã xác nhận nếu cần</p>
                                        <p>• Hotline hỗ trợ: <span className="font-bold text-sky-600">1900 0152</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <XCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Xác nhận hủy vé</h3>
                                    <p className="text-red-100">Vé #{selectedTicketForCancel?.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                Bạn có chắc chắn muốn hủy vé này? Hành động này không thể hoàn tác.
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lý do hủy <span className="text-gray-400">(tùy chọn)</span>
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Nhập lý do hủy vé..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={handleCancelConfirm}
                                    disabled={cancellingTicketId !== null}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {cancellingTicketId !== null ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
                                    ) : (
                                        'Xác nhận hủy'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CheckTicket;
