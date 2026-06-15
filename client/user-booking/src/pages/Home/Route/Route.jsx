import React, { useState, useEffect } from 'react';
import Navigation from '../Navigation';
import Footer from '../components/Footer';
import ApiService from '../../../services/api.service';
import { useNavigate } from "react-router-dom";

const Route = () => {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        departureStation: '',
        arrivalStation: '',
        sortBy: 'distance_km',
        order: 'asc'
    });
    const [searchTerm, setSearchTerm] = useState('');
    // Load data from APIs
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load data based on filters
    useEffect(() => {
        if (stations.length > 0) {
            loadRoutes();
        }
    }, [filters, stations]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load stations first
            await loadStations();

        } catch (err) {
            console.error('Error loading initial data:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const loadStations = async () => {
        try {
            const response = await ApiService.getStations({ limit: 1000 });

            if (response.success && response.data) {
                // Handle different possible response structures
                const stationsData = response.data.data.results || response.data.responseObject || response.data;
                setStations(Array.isArray(stationsData) ? stationsData : []);
            } else {
                console.error('Failed to load stations:', response.error);
                setStations([]);
            }
        } catch (error) {
            console.error('Error loading stations:', error);
            setStations([]);
        }
    };

    const loadRoutes = async () => {
        try {
            setLoading(true);

            const params = {
                page: 1,
                limit: 100, // Load more routes for frontend display
                // sortBy: filters.sortBy,
                order: filters.order
            };

            // Add filter parameters if they exist
            if (filters.departureStation) {
                params.departure_station_id = filters.departureStation;
            }
            if (filters.arrivalStation) {
                params.arrival_station_id = filters.arrivalStation;
            }

            const response = await ApiService.getRoutes(params);

            if (response.success && response.data) {
                // Handle different possible response structures
                const responseData = response.data.responseObject || response.data.data || response.data;
                const routesData = responseData.results || responseData;

                if (Array.isArray(routesData)) {
                    console.log(routesData ? routesData : 'routesData');
                    // Enrich routes with station names and mock bus companies
                    const enrichedRoutes = routesData.map(route => ({
                        ...route,
                        departure_name: getStationName(route.departure_station_id),
                        arrival_name: getStationName(route.arrival_station_id),
                        departure_city: getStationCity(route.departure_station_id),
                        arrival_city: getStationCity(route.arrival_station_id),
                        // Add mock price and bus companies since they're not in the API yet
                        price: calculateEstimatedPrice(route.distance_km),
                        busCompanies: generateMockBusCompanies()
                    }));

                    setRoutes(enrichedRoutes);
                } else {
                    setRoutes([]);
                }
            } else {
                console.error('Failed to load routes:', response.error);
                setRoutes([]);
            }
        } catch (error) {
            console.error('Error loading routes:', error);
            setRoutes([]);
        } finally {
            setLoading(false);
        }
    };

    const getStationName = (stationId) => {
        const station = stations.find(s => s.id === stationId);
        return station ? station.name : `Station ${stationId}`;
    };

    const getStationCity = (stationId) => {
        const station = stations.find(s => s.id === stationId);
        return station ? (station.city || station.province || 'Unknown') : 'Unknown';
    };

    const calculateEstimatedPrice = (distance) => {
        // Simple price calculation based on distance (can be adjusted)
        const basePrice = 50000; // 50k VND base price
        const pricePerKm = 500; // 500 VND per km
        return basePrice + (distance * pricePerKm);
    };

    const generateMockBusCompanies = () => {
        const allCompanies = [
            // 'Phương Trang', 'Thành Bưởi', 'Hải Âu', 'Sinh Café', 'Thuận Tiến',
            // 'Mai Linh', 'Côco', 'Hùng Cường', 'Camel Travel', 'Queen Café',
            // 'Hương Giang', 'Hoàng Long', 'Sao Việt', 'Hoa Mai', 'Quốc Đạt'
        ];

        // Randomly select 2-4 companies
        const numberOfCompanies = Math.floor(Math.random() * 3) + 2;
        const shuffled = allCompanies.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numberOfCompanies);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Filter routes based on search term (since API filtering is already applied for station filters)
    const filteredRoutes = routes.filter(route => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            (route.departure_name && route.departure_name.toLowerCase().includes(searchLower)) ||
            (route.arrival_name && route.arrival_name.toLowerCase().includes(searchLower)) ||
            (route.departure_city && route.departure_city.toLowerCase().includes(searchLower)) ||
            (route.arrival_city && route.arrival_city.toLowerCase().includes(searchLower))
        );
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDuration = (hours) => {
        const wholeHours = Math.floor(hours);
        const minutes = Math.round((hours - wholeHours) * 60);
        return minutes > 0 ? `${wholeHours}h ${minutes}p` : `${wholeHours}h`;
    };

    const getPopularityLevel = (companies) => {
        if (companies.length >= 4) return { text: 'Rất phổ biến', color: 'bg-green-500' };
        if (companies.length >= 2) return { text: 'Phổ biến', color: 'bg-blue-500' };
        return { text: 'Ít phổ biến', color: 'bg-gray-500' };
    };

    const handleBookNow = (route) => {
        const params = new URLSearchParams({
            departure: route.arrival_station_id,
            destination: route.departure_station_id,
        });
        navigate(`/bus-list?${params.toString()}`);
    };

    console.log(routes ? routes : 'routes');

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-sky-600 to-sky-700 text-white py-16">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Tuyến Đường Xe Khách
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-sky-100">
                            Khám phá các tuyến đường phổ biến trên toàn quốc
                        </p>
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tuyến đường..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-6 py-4 text-lg text-gray-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-300"
                                />
                                <button className="absolute right-2 top-2 bottom-2 px-6 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-white py-12 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-sky-600">{routes.length}</div>
                            <div className="text-gray-600">Tuyến đường</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-sky-600">{stations.length}</div>
                            <div className="text-gray-600">Bến xe</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-sky-600">200+</div>
                            <div className="text-gray-600">Nhà xe</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-sky-600">1M+</div>
                            <div className="text-gray-600">Lượt đặt vé</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white py-8 border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4">
                            <select
                                value={filters.departureStation}
                                onChange={(e) => handleFilterChange('departureStation', e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="">Điểm khởi hành</option>
                                {stations.map(station => (
                                    <option key={station.id} value={station.id}>
                                        {station.name} - {station.city || station.province || 'Việt Nam'}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.arrivalStation}
                                onChange={(e) => handleFilterChange('arrivalStation', e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="">Điểm đến</option>
                                {stations.filter(s => s.id !== parseInt(filters.departureStation)).map(station => (
                                    <option key={station.id} value={station.id}>
                                        {station.name} - {station.city || station.province || 'Việt Nam'}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="distance_km">Khoảng cách</option>
                                <option value="estimated_duration_hours">Thời gian</option>
                                <option value="price">Giá vé</option>
                            </select>

                            <select
                                value={filters.order}
                                onChange={(e) => handleFilterChange('order', e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="asc">Tăng dần</option>
                                <option value="desc">Giảm dần</option>
                            </select>
                        </div>

                        <div className="text-gray-600">
                            Tìm thấy {filteredRoutes.length} tuyến đường
                        </div>
                    </div>
                </div>
            </div>

            {/* Routes List */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {error ? (
                    <div className="text-center py-20">
                        <div className="text-red-400 text-6xl mb-4">⚠️</div>
                        <h3 className="text-xl font-semibold text-red-600 mb-2">
                            Có lỗi xảy ra
                        </h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={loadInitialData}
                            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                        <span className="ml-4 text-gray-600">Đang tải dữ liệu...</span>
                    </div>
                ) : filteredRoutes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-gray-400 text-6xl mb-4"></div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Không tìm thấy tuyến đường nào
                        </h3>
                        <p className="text-gray-500">
                            Vui lòng thử lại với các tiêu chí tìm kiếm khác
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredRoutes.map((route) => {
                            const popularity = getPopularityLevel(route.busCompanies);
                            return (
                                <div key={route.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            {/* Route Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-sky-600 rounded-full"></div>
                                                        <span className="font-semibold text-lg text-gray-800">
                                                            {route.departureStation.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-lg text-gray-800">
                                                            {route.arrivalStation.name}
                                                        </span>
                                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Khoảng cách:</span>
                                                        <div className="font-semibold text-sky-600">{route.distance_km} km</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Thời gian:</span>
                                                        <div className="font-semibold text-sky-600">{formatDuration(route.estimated_duration_hours)}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Giá từ:</span>
                                                        <div className="font-semibold text-green-600">{formatPrice(route.price)}</div>
                                                    </div>

                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="lg:ml-6">
                                                <button
                                                    className="w-full lg:w-auto px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-4 focus:ring-sky-300"
                                                    onClick={() => handleBookNow(route)}
                                                >
                                                    Đặt vé ngay
                                                </button>
                                            </div>
                                        </div>

                                        {/* Bus Companies */}
                                        {/* <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-gray-600 font-medium">Nhà xe hoạt động:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {route.busCompanies.map((company, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                                                    >
                                                        {company}
                                                    </span>
                                                ))}
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Additional Features Section */}
            <div className="bg-gradient-to-r from-sky-50 to-sky-100 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                        Tại sao chọn chúng tôi?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-sky-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Đặt vé dễ dàng</h3>
                            <p className="text-gray-600">Đặt vé online nhanh chóng chỉ với vài thao tác đơn giản</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-sky-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Đúng giờ</h3>
                            <p className="text-gray-600">Hệ thống theo dõi lịch trình xe để đảm bảo đúng giờ</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-sky-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Hỗ trợ 24/7</h3>
                            <p className="text-gray-600">Đội ngũ hỗ trợ khách hàng hoạt động 24/7</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Route;
