import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../services/api.service.js';
import { getImageUrl } from '../../../utils';

export default function ChatBot() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);

    // Add welcome message when chat opens
    useEffect(() => {
        if (open && messages.length === 0) {
            setMessages([{
                role: 'bot',
                text: 'Xin chào! Tôi là trợ lý đặt xe. Tôi có thể giúp bạn đặt vé xe, xem thông tin hỗ trợ. Bạn cần hỗ trợ gì?'
            }]);
        }
        const checkAuthStatus = () => {
            const user = apiService.getUserData();
            const token = apiService.getAuthToken();

            if (user && token) {
                setUserData(user);
            } else {
                setUserData(null);
            }

        };

        checkAuthStatus();
    }, [open, messages.length]);

    // CarCard component for displaying car information
    const CarCard = ({ schedule }) => {
        const handleCardClick = () => {
            if (schedule.departureStation && schedule.arrivalStation) {
                navigate(`/bus-list?departure=${schedule.departureStation}&destination=${schedule.arrivalStation}&departureDate=${schedule.departureTime}`);
            }
        };

        const formatTime = (dateString) => {
            if (!dateString) return 'N/A';
            try {
                const date = new Date(dateString);
                return date.toLocaleString('vi-VN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            } catch (error) {
                return 'N/A';
            }
        };

        return (
            <div
                onClick={handleCardClick}
                className="cursor-pointer bg-white border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-md transition-all duration-200 hover:border-sky-300"
            >
                <div className="flex items-start gap-3">
                    <div className="w-16 h-16 flex-shrink-0">
                        <img
                            src={getImageUrl(schedule.featureImage)}
                            alt={schedule.vehicleName || 'Bus Image'}
                            className="w-full h-full object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                                e.target.src = '/image/placeholder-bus.png';
                            }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-900 truncate">
                                {schedule.vehicleName || 'Tên xe không có'}
                            </h4>
                        </div>

                        {schedule.companyName && (
                            <p className="text-xs text-sky-600 font-medium mt-0.5">
                                {schedule.companyName}
                            </p>
                        )}

                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                                <span>📍</span> {schedule.departureStation} → {schedule.arrivalStation}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                                <span>🕒</span> {formatTime(schedule.departureTime)}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <span className="text-xs text-gray-500 font-medium">
                                    🪑 Ghế: {schedule.availableSeats ?? 0}/{schedule.totalSeats ?? 0}
                                </span>
                                {schedule.distanceKm && (
                                    <span className="text-xs text-gray-400">
                                        📏 {schedule.distanceKm} km
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const send = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input };
        setMessages((m) => [...m, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await apiService.sendChatbotMessage(userMsg.text, userData?.id);
            setLoading(false);

            if (res.success && res.data) {
                // res.data is the ApiResponse object: { success, message, data: ChatResponseDTO }
                const responseData = res.data.data;

                // Check if the response contains schedule data (responseData.data is the schedules list)
                const schedules = responseData.data;
                if (Array.isArray(schedules) && schedules.length > 0) {
                    const botMsg = {
                        role: 'bot',
                        text: responseData.reply || 'Tôi đã tìm thấy các chuyến xe phù hợp:',
                        schedules: schedules,
                        hasSchedules: true
                    };
                    setMessages((m) => [...m, botMsg]);
                } else {
                    const botMsg = {
                        role: 'bot',
                        text: responseData.reply || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.',
                        hasSchedules: false
                    };
                    setMessages((m) => [...m, botMsg]);
                }
            } else {
                const botMsg = {
                    role: 'bot',
                    text: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
                    hasSchedules: false
                };
                setMessages((m) => [...m, botMsg]);
            }
        } catch (error) {
            setLoading(false);
            const botMsg = {
                role: 'bot',
                text: 'Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau.',
                hasSchedules: false
            };
            setMessages((m) => [...m, botMsg]);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-5 right-5 z-50 bg-sky-600 hover:bg-sky-700 text-white border-none rounded-full px-4 py-3 cursor-pointer shadow-lg transition-all duration-200 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {open ? 'Đóng Chat' : 'Chat Hỗ Trợ'}
            </button>

            {open && (
                <div className="fixed bottom-20 right-5 w-[35%] h-[60vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
                    <div className="px-4 py-3 bg-sky-600 text-white font-semibold flex items-center justify-between">
                        <span>Trợ lý đặt xe</span>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block max-w-[80%] px-3 py-2 rounded-lg ${m.role === 'user'
                                    ? 'bg-sky-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{m.text}</p>

                                    {/* Render car cards if message has schedules */}
                                    {m.role === 'bot' && m.hasSchedules && m.schedules && (
                                        <div className="mt-3 space-y-2">
                                            {m.schedules.map((schedule, scheduleIdx) => (
                                                <CarCard key={scheduleIdx} schedule={schedule} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="text-left mb-3">
                                <div className="inline-block bg-white border border-gray-200 rounded-lg rounded-bl-sm px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500">Đang xử lý...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !loading) send(); }}
                                placeholder="Nhập câu hỏi..."
                                disabled={loading}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <button
                                onClick={send}
                                disabled={loading || !input.trim()}
                                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
