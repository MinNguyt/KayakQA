import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api.service.js';
import { getImageUrl } from '../../../utils';
import { Bus, MapPin, Sparkles, Search, Calendar, Send } from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect.jsx';
import '../../../components/CustomSelect.css';

const HomeBanner = () => {
    const navigate = useNavigate();

    // --- Vehicle Mode State ---
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [stations, setStations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(false);
    const [stationError, setStationError] = useState('');

    // --- Tab State ---
    const [activeTab, setActiveTab] = useState('bus');

    // --- AI Mode (Chatbot) State ---
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const chatEndRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatLoading]);

    // Add welcome message when switching to AI tab
    useEffect(() => {
        if (activeTab === 'ai' && messages.length === 0) {
            setMessages([{
                role: 'bot',
                text: 'Xin chào! 👋 Tôi là trợ lý AI đặt xe. Hãy cho tôi biết bạn muốn đi đâu, từ đâu, và ngày nào nhé!'
            }]);
        }
    }, [activeTab, messages.length]);

    // Check auth status
    useEffect(() => {
        const user = api.getUserData();
        const token = api.getAuthToken();
        if (user && token) {
            setUserData(user);
        } else {
            setUserData(null);
        }
    }, []);

    // Fetch stations
    useEffect(() => {
        const fetchStations = async () => {
            setLoadingStations(true);
            setStationError('');
            try {
                const res = await api.getStations({ includeAuth: false, suppressUnauthorizedRedirect: true });
                if (res.success) {
                    const payload = res.data.data;
                    const list = payload?.results || payload?.data || payload || [];
                    setStations(Array.isArray(list) ? list : []);
                } else {
                    setStationError(res.error || 'Không thể tải danh sách bến xe');
                }
            } catch (e) {
                setStationError(e.message || 'Không thể tải danh sách bến xe');
            } finally {
                setLoadingStations(false);
            }
        };
        fetchStations();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        window.location.href = `/bus-list?departure=${departure}&destination=${destination}&departureDate=${departureDate}`;
    };

    const tabs = [
        { id: 'bus', label: 'Xe khách', icon: <Bus className="w-5 h-5" /> },
        { id: 'ai', label: 'AI Mode', icon: <Sparkles className="w-5 h-5" /> },
    ];

    const stationOptions = useMemo(() =>
        stations.map(s => ({
            value: s.id,
            label: s.location,
            icon: <MapPin size={16} />,
        })),
        [stations]
    );

    // --- Chatbot Logic ---

    // CarCard for displaying schedule results from chatbot
    const CarCard = ({ schedule }) => {
        const handleCardClick = () => {
            navigate(`/bus-list?departure=${schedule.departureStationId}&destination=${schedule.arrivalStationId}&departureDate=${schedule.departureTime}`);
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
                className="cursor-pointer bg-orange-50 border border-orange-200 rounded-xl p-3 mb-2 hover:shadow-md transition-all duration-200 hover:border-orange-400"
            >
                <div className="flex items-start gap-3">
                    <div className="w-14 h-14 flex-shrink-0 mt-0.5">
                        <img
                            src={`http://localhost:8080/files${schedule.featureImage}`}
                            alt={schedule.vehicleName || 'Bus Image'}
                            className="w-full h-full object-cover rounded-lg"

                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        {schedule.vehicleName && (
                            <h4 className="font-semibold text-gray-900 truncate text-sm">
                                {schedule.vehicleName}
                            </h4>
                        )}
                        {schedule.companyName && (
                            <p className="text-xs text-orange-600 font-medium mt-0.5">
                                {schedule.companyName}
                            </p>
                        )}
                        <div className="mt-1.5 space-y-0.5">
                            <p className="text-xs text-gray-600">
                                {schedule.departureStation} → {schedule.arrivalStation}
                            </p>
                            <p className="text-xs text-gray-600">
                                {formatTime(schedule.departureTime)}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                                {/* <span className="text-xs text-gray-500">
                                        🪑 Ghế trống: {schedule.availableSeats ?? 0}/{schedule.totalSeats ?? 0}
                                    </span> */}
                                {schedule.distanceKm && (
                                    <span className="text-xs text-gray-400">
                                        📏 {schedule.distanceKm} km
                                    </span>
                                )}
                            </div>
                            {schedule.licensePlate && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Biển số: {schedule.licensePlate}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const sendMessage = async () => {
        if (!chatInput.trim()) return;
        const userMsg = { role: 'user', text: chatInput };
        setMessages((m) => [...m, userMsg]);
        setChatInput('');
        setChatLoading(true);

        try {
            const res = await api.sendChatbotMessage(userMsg.text, userData?.id);
            setChatLoading(false);

            if (res.success && res.data) {
                // res.data = ApiResponse { success, message, data: ChatResponseDTO }
                const responseData = res.data.data; // ChatResponseDTO: { intent, reply, data, collected, missing }

                // Check if the response contains schedule data
                const schedules = responseData.data; // schedule list (array) or null
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
                setMessages((m) => [...m, {
                    role: 'bot',
                    text: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
                    hasSchedules: false
                }]);
            }
        } catch (error) {
            setChatLoading(false);
            setMessages((m) => [...m, {
                role: 'bot',
                text: 'Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau.',
                hasSchedules: false
            }]);
        }
    };

    return (
        <div className=
            {
                activeTab === "bus" ? "w-full mb-[20%] h-[500px] bg-[#f5f7fa] py-12 px-4 flex flex-col items-center gap-8 justify-start"
                    : "w-full mb-[20%] h-[700px] bg-[#f5f7fa] py-12 px-4 flex flex-col items-center gap-8 justify-start"
            }
        >
            <div

                className={activeTab === "bus" ? "bg-white rounded-3xl shadow-xl w-full max-w-7xl flex flex-col lg:flex-row min-h-[500px]"
                    : "bg-white rounded-3xl shadow-xl w-full max-w-7xl flex flex-col lg:flex-row min-h-[700px]"
                }>
                {/* Left Content */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-10 leading-tight">
                        Tìm kiếm chuyến xe <br className="hidden lg:block" />an toàn, tiện lợi.
                    </h1>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center gap-2 p-2 min-w-[70px] transition-colors rounded-lg
                                    ${activeTab === tab.id
                                        ? 'text-orange-600 bg-orange-50'
                                        : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <div className={`p-3 rounded-xl shadow-sm border ${activeTab === tab.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-200'}`}>
                                    {React.cloneElement(tab.icon, { className: 'w-5 h-5' })}
                                </div>
                                <span className="text-xs font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* === VEHICLE MODE === */}
                    {activeTab === 'bus' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <span className="cursor-pointer hover:underline">Loại chuyến: Một chiều </span>
                            </div>

                            <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-lg border border-gray-200 overflow-visible">
                                {/* Departure */}
                                <div className="flex-1 bg-gray-100 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 hover:bg-gray-200 transition-colors relative group" style={{ zIndex: 30 }}>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">ĐIỂM ĐI</label>
                                    <CustomSelect
                                        value={departure}
                                        onChange={(val) => setDeparture(val)}
                                        options={stationOptions}
                                        placeholder="Chọn điểm đi"
                                        icon={<MapPin size={18} />}
                                        disabled={loadingStations}
                                        variant="minimal"
                                        searchable={true}
                                    />
                                </div>

                                {/* Destination */}
                                <div className="flex-1 bg-gray-100 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 hover:bg-gray-200 transition-colors relative group" style={{ zIndex: 29 }}>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">ĐIỂM ĐẾN</label>
                                    <CustomSelect
                                        value={destination}
                                        onChange={(val) => setDestination(val)}
                                        options={stationOptions}
                                        placeholder="Chọn điểm đến"
                                        icon={<MapPin size={18} />}
                                        disabled={loadingStations}
                                        variant="minimal"
                                        searchable={true}
                                    />
                                </div>

                                {/* Date */}
                                <div className="w-full lg:w-64 bg-white p-4 hover:bg-gray-50 transition-colors relative" style={{ zIndex: 28 }}>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">NGÀY ĐI</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={departureDate}
                                            onChange={(e) => setDepartureDate(e.target.value)}
                                            className="w-full bg-transparent font-semibold text-gray-800 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Search Button */}
                                <button
                                    onClick={handleSearch}
                                    className="bg-orange-600 hover:bg-orange-700 text-white p-4 lg:w-20 w-full flex items-center justify-center transition-colors rounded-r-2xl"
                                >
                                    <Search className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* === AI MODE (Chatbox) === */}
                    {activeTab === 'ai' && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <Sparkles className="w-4 h-4 text-orange-500" />
                                <span>Hỏi AI để tìm chuyến xe nhanh nhất</span>
                            </div>

                            {/* Chat Container — matches vehicle mode card style */}
                            <div className="flex flex-col bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: '350px' }}>
                                {/* Messages Area */}
                                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
                                    {messages.map((m, idx) => (
                                        <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${m.role === 'user'
                                                ? 'bg-orange-500 text-white rounded-br-md'
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                                                }`}>
                                                <p className="text-sm leading-relaxed whitespace-pre-line">{m.text}</p>

                                                {/* Schedule cards */}
                                                {m.role === 'bot' && m.hasSchedules && m.schedules && (
                                                    <div className="mt-3 space-y-2">
                                                        {m.schedules.map((schedule, sIdx) => (
                                                            <CarCard key={sIdx} schedule={schedule} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Loading indicator */}
                                    {chatLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">AI đang xử lý...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 border-t border-gray-200 bg-white">
                                    <div className="flex gap-2 items-center">
                                        <input
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !chatLoading) sendMessage(); }}
                                            placeholder="VD: Tôi muốn đi từ Hà Nội đến Sài Gòn ngày mai..."
                                            disabled={chatLoading}
                                            className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={chatLoading || !chatInput.trim()}
                                            className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md disabled:shadow-none"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Image - Masonry Grid */}
                <div className="hidden lg:flex relative w-[45%] overflow-visible">
                    <div className="absolute top-[5%] -right-8 flex gap-3">
                        {/* Column 1 */}
                        <div className="flex flex-col gap-3 mt-12">
                            <img
                                src="/asets/images/home-banner-2.png"
                                className="w-[140px] h-[100px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                            <img
                                src="/asets/images/banner-img-1.png"
                                className="w-[140px] h-[180px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-3 mt-4">
                            <img
                                src="/asets/images/home-banner-3.png"
                                className="w-[140px] h-[160px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                            <img
                                src="/asets/images/home-banner-4.png"
                                className="w-[140px] h-[120px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                            <img
                                src="/asets/images/home-banner-5.png"
                                className="w-[140px] h-[100px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                        </div>

                        {/* Column 3 */}
                        <div className="flex flex-col gap-3">
                            <img
                                src="/asets/images/home-banner-6.png"
                                className="w-[100px] h-[80px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                            <img
                                src="/asets/images/home-banner-2.png"
                                className="w-[100px] h-[140px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                            <img
                                src="/asets/images/banner-img-1.png"
                                className="w-[100px] h-[100px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                        </div>
                    </div>
                </div>
            </div>


            {/* Info Cards Section */}
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Save when compare */}
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Tiết kiệm nhiều hơn</h3>
                        <p className="text-gray-500 text-sm mt-1">Nhiều ưu đãi, nhiều lựa chọn, một lần tìm kiếm.</p>
                    </div>
                </div>

                {/* Card 3: Ratings */}
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Khách hàng tin dùng</h3>
                        <p className="text-gray-500 text-sm mt-1">1M+ đánh giá trên ứng dụng</p>
                    </div>
                </div>

                {/* Card 2: Searches */}
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">

                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">41,000,000+</h3>
                        <p className="text-gray-500 text-sm mt-1">lượt tìm kiếm trong tuần này</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomeBanner;
