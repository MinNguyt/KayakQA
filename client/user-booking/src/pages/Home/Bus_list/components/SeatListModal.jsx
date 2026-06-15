import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../../services/api.service.js';
import { API_ENDPOINTS } from '../../../../services/base.api.url.js';
import PaymentModal from './PaymentModal.jsx';

export default function SeatListModal({ open, onClose, schedule }) {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedSeatId, setSelectedSeatId] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [createdTicket, setCreatedTicket] = useState(null);

    // Support both naming conventions
    const busId = useMemo(() => schedule?.busId || schedule?.bus_id, [schedule]);

    useEffect(() => {
        if (!open || !busId) return;
        const fetchSeats = async () => {
            setLoading(true);
            setError('');
            try {
                // Endpoint SEAT_DETAILS is now /seats/vehicle/:id
                const res = await api.get(API_ENDPOINTS.SEAT_DETAILS.replace(':id', busId), { includeAuth: false, suppressUnauthorizedRedirect: true });
                if (res.success) {
                    const payload = res.data;
                    const list = payload?.responseObject || payload?.data || payload || [];
                    setSeats(Array.isArray(list) ? list : []);
                } else {
                    setError(res.error || 'Không thể tải danh sách ghế');
                }
            } catch (e) {
                setError(e.message || 'Không thể tải danh sách ghế');
            } finally {
                setLoading(false);
            }
        };
        fetchSeats();
    }, [open, busId]);

    const toggleSeat = (seat) => {
        if (seat.status && String(seat.status).toUpperCase() !== 'AVAILABLE') return;
        setSelectedSeatId(prev => prev === seat.id ? null : seat.id);
    };

    const selectedSeat = selectedSeatId ? seats.find(seat => seat.id === selectedSeatId) : null;

    const handleBook = async () => {
        if (!selectedSeatId) { setError('Vui lòng chọn một ghế'); return; }
        setLoading(true);
        setError('');
        try {
            const bookingData = {
                schedule_id: schedule.id,
                seat_id: selectedSeatId,
                price: selectedSeat?.priceForTypeSeat || 0, // Add price as required by TicketCreateDTO
                payment_method: 'ONLINE' // Kept for reference or future use
            };
            const response = await api.post(API_ENDPOINTS.BOOK_TICKET, bookingData, { includeAuth: true });
            if (response.success && response.data) {
                // Assuming response.data is ApiResponse<Ticket>
                setCreatedTicket(response.data.responseObject || response.data);
                setShowPaymentModal(true);
            } else {
                setError(response.message || 'Đặt vé thất bại');
            }
        } catch (error) {
            setError(error.message || 'Đặt vé thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleClosePaymentModal = () => { setShowPaymentModal(false); setCreatedTicket(null); onClose?.(); };

    // Calculate stats
    const availableCount = seats.filter(s => !s.status || String(s.status).toUpperCase() === 'AVAILABLE').length;

    if (!open) return null;

    const styles = {
        overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Segoe UI', sans-serif" },
        modal: { width: '100%', maxWidth: '900px', maxHeight: '90vh', background: '#fff', borderRadius: '24px', boxShadow: '0 25px 80px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
        header: { background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', padding: '28px 32px', color: '#fff' },
        headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
        headerTitle: { fontSize: '24px', fontWeight: '700', marginBottom: '4px' },
        headerSubtitle: { fontSize: '14px', opacity: 0.85 },
        closeBtn: { width: '40px', height: '40px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
        tripInfo: { display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '16px' },
        tripInfoItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
        tripInfoIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
        content: { flex: 1, overflow: 'auto', padding: '28px 32px', background: '#f8fafc' },
        legend: { display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap' },
        legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' },
        legendDot: { width: '20px', height: '20px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' },
        busLayout: { background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: '500px', margin: '0 auto' },
        busHeader: { display: 'flex', justifyContent: 'center', marginBottom: '20px', padding: '12px', background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', borderRadius: '12px' },
        driverArea: { textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: '600' },
        seatsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', maxWidth: '320px', margin: '0 auto' },
        seatBtn: { aspectRatio: '1', borderRadius: '12px', border: '2px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', position: 'relative' },
        seatAvailable: { background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)', borderColor: '#86efac', color: '#166534' },
        seatSelected: { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderColor: '#1d4ed8', color: '#fff', boxShadow: '0 4px 14px rgba(59,130,246,0.4)', transform: 'scale(1.05)' },
        seatBooked: { background: '#f1f5f9', borderColor: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' },
        seatNumber: { fontSize: '14px', fontWeight: '700' },
        seatPrice: { fontSize: '10px', marginTop: '2px', opacity: 0.8 },
        seatType: { position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#f59e0b', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
        footer: { padding: '20px 32px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
        selectionInfo: { flex: 1 },
        selectionLabel: { fontSize: '13px', color: '#64748b', marginBottom: '4px' },
        selectionValue: { fontSize: '18px', fontWeight: '700', color: '#0f172a' },
        priceInfo: { textAlign: 'right' },
        priceLabel: { fontSize: '13px', color: '#64748b' },
        priceValue: { fontSize: '28px', fontWeight: '700', color: '#0f172a' },
        actions: { display: 'flex', gap: '12px' },
        cancelBtn: { padding: '14px 24px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
        confirmBtn: { padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.35)', opacity: selectedSeatId ? 1 : 0.6 },
        errorBox: { margin: '0 0 20px', padding: '14px 20px', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' },
        loadingState: { textAlign: 'center', padding: '60px 20px', color: '#64748b' },
        emptyState: { textAlign: 'center', padding: '60px 20px' },
    };

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerTop}>
                        <div>
                            <h2 style={styles.headerTitle}>Chọn ghế ngồi</h2>
                            <p style={styles.headerSubtitle}>Xe {schedule?.bus_name || `#${busId}`} • Chuyến #{schedule?.id}</p>
                        </div>
                        <button style={styles.closeBtn} onClick={onClose}>✕</button>
                    </div>
                    <div style={styles.tripInfo}>
                        <div style={styles.tripInfoItem}>
                            <div style={styles.tripInfoIcon}>🕐</div>
                            <span>{schedule?.departureTime ? new Date(schedule.departureTime).toLocaleString('vi-VN') : 'N/A'}</span>
                        </div>
                        <div style={styles.tripInfoItem}>
                            <div style={styles.tripInfoIcon}>💺</div>
                            <span>{availableCount} ghế trống / {seats.length} ghế</span>
                        </div>
                        <div style={styles.tripInfoItem}>
                            <div style={styles.tripInfoIcon}>🛣️</div>
                            <span>Tuyến #{schedule?.routeId || schedule?.route_id}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {error && <div style={styles.errorBox}><span>⚠️</span>{error}</div>}

                    {loading ? (
                        <div style={styles.loadingState}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
                            <p>Đang tải sơ đồ ghế...</p>
                        </div>
                    ) : seats.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Không có ghế nào</h3>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>Chuyến xe này chưa có thông tin ghế</p>
                        </div>
                    ) : (
                        <>
                            {/* Legend */}
                            <div style={styles.legend}>
                                <div style={styles.legendItem}>
                                    <div style={{ ...styles.legendDot, ...styles.seatAvailable }}>✓</div>
                                    <span>Còn trống</span>
                                </div>
                                <div style={styles.legendItem}>
                                    <div style={{ ...styles.legendDot, ...styles.seatSelected }}>✓</div>
                                    <span>Đang chọn</span>
                                </div>
                                <div style={styles.legendItem}>
                                    <div style={{ ...styles.legendDot, ...styles.seatBooked }}>✕</div>
                                    <span>Đã đặt</span>
                                </div>
                            </div>

                            {/* Bus Layout */}
                            <div style={styles.busLayout}>
                                <div style={styles.busHeader}>
                                    <div style={styles.driverArea}> Đầu xe - Vị trí tài xế</div>
                                </div>
                                <div style={styles.seatsGrid}>
                                    {seats.map((seat) => {
                                        const available = !seat.status || String(seat.status).toUpperCase() === 'AVAILABLE';
                                        const selected = selectedSeatId === seat.id;
                                        const seatStyle = selected ? styles.seatSelected : (available ? styles.seatAvailable : styles.seatBooked);
                                        return (
                                            <button
                                                key={seat.id}
                                                onClick={() => toggleSeat(seat)}
                                                disabled={!available}
                                                style={{ ...styles.seatBtn, ...seatStyle }}
                                                title={available ? `Ghế ${seat.seatNumber || seat.id} - ${seat.priceForTypeSeat ? Number(seat.priceForTypeSeat).toLocaleString('vi-VN') + '₫' : 'Liên hệ'}` : 'Ghế đã được đặt'}
                                            >
                                                {seat.seatType && <span style={styles.seatType}>{seat.seatType.charAt(0)}</span>}
                                                <span style={styles.seatNumber}>{seat.seatNumber || seat.code || seat.id}</span>
                                                <span style={styles.seatPrice}>{seat.priceForTypeSeat ? (Number(seat.priceForTypeSeat) / 1000) + 'k' : '-'}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <div style={styles.selectionInfo}>
                        <div style={styles.selectionLabel}>Ghế đã chọn</div>
                        <div style={styles.selectionValue}>
                            {selectedSeat ? `Ghế ${selectedSeat.seat_number || selectedSeat.code || selectedSeat.id}` : 'Chưa chọn ghế nào'}
                        </div>
                    </div>
                    <div style={styles.priceInfo}>
                        <div style={styles.priceLabel}>Tổng tiền</div>
                        <div style={styles.priceValue}>
                            {selectedSeat?.priceForTypeSeat ? Number(selectedSeat.priceForTypeSeat).toLocaleString('vi-VN') + '₫' : '0₫'}
                        </div>
                    </div>
                    <div style={styles.actions}>
                        <button style={styles.cancelBtn} onClick={onClose}>Hủy</button>
                        <button style={styles.confirmBtn} onClick={handleBook} disabled={!selectedSeatId || loading}>
                            {loading ? '⏳ Đang xử lý...' : '🎫 Đặt vé ngay'}
                        </button>
                    </div>
                </div>
            </div>

            <PaymentModal open={showPaymentModal} onClose={handleClosePaymentModal} ticket={createdTicket} schedule={schedule} selectedSeats={selectedSeat ? [selectedSeat] : []} />
        </div>
    );
}
