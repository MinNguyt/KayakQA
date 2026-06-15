import React, { useEffect, useState } from 'react';
import api from '../../../../services/api.service.js';
import { API_ENDPOINTS } from '../../../../services/base.api.url.js';

export default function PaymentModal({ open, onClose, ticket, schedule, selectedSeats }) {
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const [isPolling, setIsPolling] = useState(true);
    const [error, setError] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    // Calculate total amount
    const totalAmount = ticket?.totalPrice || ticket?.total_price || 2000;
    const bank = 'MBBank';
    const accountNumber = '0383984836';
    const content = `DH${ticket?.id || 'NEW'}`;

    // Generate QR code URL
    const qrCodeUrl = `https://qr.sepay.vn/img?bank=${bank}&acc=${accountNumber}&template=compact&amount=${2000}&des=${content}`;

    // Banking information
    const bankingInfo = {
        bank: 'MBBank',
        accountNumber: '0383984836',
        accountName: 'CONG TY TNHH DAT XE KHACH',
        amount: totalAmount,
        content: `DH${ticket?.id || 'NEW'}`
    };

    // Polling function to check payment status
    const pollPaymentStatus = async (ticketId) => {
        if (!ticketId) return;

        try {
            const response = await api.get(
                API_ENDPOINTS.CHECK_PAYMENT_STATUS.replace(':ticketId', ticketId),
                { includeAuth: true }
            );
            console.log("pooling response", response)
            if (response.success && response.data) {
                // The status is directly returned as responseObject in the ApiResponse
                // TicketController returns ApiResponse<TicketStatus>, so data.responseObject is the status
                const status = response.data.responseObject || response.data;
                setPaymentStatus(status);

                if (String(status) === 'BOOKED') {
                    setIsPolling(false);
                    // Show success message
                    setTimeout(() => {
                        alert('Thanh toán thành công! Vé đã được xác nhận.');
                        onClose?.();
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            setError('Lỗi kiểm tra trạng thái thanh toán');
        }
    };

    // Start polling when ticket is created
    useEffect(() => {
        if (ticket?.id && isPolling) {
            const interval = setInterval(() => {
                pollPaymentStatus(ticket.id);
            }, 5000); // Poll every 5 seconds

            return () => clearInterval(interval);
        }
    }, [ticket?.id, isPolling]);



    // Handle copy to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Đã sao chép vào clipboard!');
        }).catch(() => {
            alert('Không thể sao chép');
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[1000] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
                {/* Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <div className="text-slate-900 font-semibold text-lg">Thanh toán vé xe</div>
                        <div className="text-slate-500 text-sm">
                            Tổng tiền: {totalAmount.toLocaleString('vi-VN')}₫
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-9 px-3 rounded-md border border-slate-300 hover:bg-slate-50 transition"
                    >
                        Đóng
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                            {error}
                        </div>
                    )}

                    {!ticket ? (
                        // Booking step
                        <></>
                    ) : (
                        // Payment step
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left side - QR Code */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Quét mã QR để thanh toán
                                </h3>

                                <div className="bg-white p-4 rounded-lg border-2 border-slate-200 text-center">
                                    <img
                                        src={qrCodeUrl}
                                        alt="QR Code"
                                        className="mx-auto mb-4 max-w-full h-auto"
                                    />
                                    <p className="text-sm text-slate-600">
                                        Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                                    </p>
                                </div>

                                {/* Payment Status */}
                                <div className="p-4 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-slate-900">Trạng thái thanh toán:</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                            paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {paymentStatus === 'SUCCESS' ? 'Thành công' :
                                                paymentStatus === 'FAILED' ? 'Thất bại' : 'Đang chờ'}
                                        </span>
                                    </div>
                                    {isPolling && (
                                        <div className="mt-2 text-sm text-slate-600">
                                            Đang kiểm tra trạng thái thanh toán...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right side - Banking Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Thông tin chuyển khoản
                                </h3>

                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Ngân hàng:</span>
                                                <span className="font-medium">{bankingInfo.bank}</span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Số tài khoản:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{bankingInfo.accountNumber}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(bankingInfo.accountNumber)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Sao chép
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Tên tài khoản:</span>
                                                <span className="font-medium text-right">{bankingInfo.accountName}</span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Số tiền:</span>
                                                <span className="font-medium text-green-600">
                                                    {bankingInfo.amount.toLocaleString('vi-VN')}₫
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Nội dung:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{bankingInfo.content}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(bankingInfo.content)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Sao chép
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn thanh toán:</h4>
                                        <ol className="text-sm text-blue-800 space-y-1">
                                            <li>1. Mở ứng dụng ngân hàng trên điện thoại</li>
                                            <li>2. Chọn chức năng "Chuyển khoản"</li>
                                            <li>3. Quét mã QR hoặc nhập thông tin thủ công</li>
                                            <li>4. Kiểm tra thông tin và xác nhận</li>
                                            <li>5. Hoàn tất giao dịch</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white/90 backdrop-blur px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                        Mã vé: {ticket?.id ? `#${ticket.id}` : 'Chưa tạo'}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="h-10 px-4 rounded-md border border-slate-300 hover:bg-slate-50 transition"
                        >
                            Hủy
                        </button>
                        {paymentStatus === 'SUCCESS' && (
                            <button
                                onClick={onClose}
                                className="h-10 px-4 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                            >
                                Hoàn thành
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
