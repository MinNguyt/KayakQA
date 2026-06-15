import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../../../services/api.service';
import Navigation from '../Navigation';
import Footer from '../components/Footer';
import { getImageUrl } from '../../../utils';
import SeatListModal from '../Bus_list/components/SeatListModal';
import { useNavigate } from 'react-router-dom';
const CarDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSeatModal, setShowSeatModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                setLoading(true);
                const response = await ApiService.getCarById(id);

                if (response.success) {
                    setCar(response.data.responseObject);

                    // Fetch company details if company_id exists
                    if (response.data.responseObject.company_id) {
                        const companyResponse = await ApiService.getBusCompany(response.data.responseObject.company_id);
                        if (companyResponse.success) {
                            setCompany(companyResponse.data.responseObject);
                        }
                    }
                } else {
                    setError('Không thể tải thông tin xe');
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải dữ liệu');
                console.error('Error fetching car details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCarDetails();
        }
    }, [id]);

    const handleOpenSeatModal = () => {
        // Create a mock schedule object for the seat modal
        // In a real app, you might want to fetch actual schedule data
        // const mockSchedule = {
        //     id: `${car?.id}`,
        //     bus_id: car?.id,
        //     departure_time: '08:00',
        //     arrival_time: '12:00',
        //     price: 150000,
        //     route: 'Hà Nội - Hải Phòng'
        // };
        // setSelectedSchedule(mockSchedule);
        // setShowSeatModal(true);

        navigate(`/bus-list?bus_id=${car?.id}`);
    };

    const handleCloseSeatModal = () => {
        setShowSeatModal(false);
        setSelectedSchedule(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1295db] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin xe...</p>
                </div>
            </div>
        );
    }

    if (error || !car) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error || 'Không tìm thấy thông tin xe'}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-6 py-2 bg-[#1295db] text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Car Header */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    {/* Featured Image */}
                    {car.featured_image && (
                        <div className="h-64 md:h-80 w-full">
                            <img
                                src={getImageUrl(car.featured_image)}
                                alt={car.name}
                                className="w-full h-full object-contain rounded-t-xl"
                                onError={(e) => {
                                    e.target.src = '/image/bus-placeholder.png';
                                }}
                            />
                        </div>
                    )}

                    {/* Car Basic Info */}
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.name}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                        {car.license_plate}
                                    </span>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                        {car.capacity} chỗ ngồi
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
                                {company && (
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Nhà xe</p>
                                        <p className="text-lg font-semibold text-gray-900">{company.company_name}</p>
                                    </div>
                                )}
                                <button
                                    onClick={handleOpenSeatModal}
                                    className="px-6 py-3 bg-[#1295db] text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
                                >
                                    Xem lịch trình
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        {car.description && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h3>
                                <p className="text-gray-700 leading-relaxed">{car.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Markdown Content */}
                {car.markdown_html && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông số chi tiết</h2>
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: car.markdown_html }}
                            style={{
                                '--tw-prose-headings': '#1f2937',
                                '--tw-prose-body': '#374151',
                                '--tw-prose-links': '#1295db',
                                '--tw-prose-bold': '#1f2937',
                                '--tw-prose-counters': '#6b7280',
                                '--tw-prose-bullets': '#d1d5db',
                                '--tw-prose-hr': '#e5e7eb',
                                '--tw-prose-quotes': '#1f2937',
                                '--tw-prose-quote-borders': '#e5e7eb',
                                '--tw-prose-captions': '#6b7280',
                                '--tw-prose-code': '#1f2937',
                                '--tw-prose-pre-code': '#e5e7eb',
                                '--tw-prose-pre-bg': '#1f2937',
                                '--tw-prose-th-borders': '#d1d5db',
                                '--tw-prose-td-borders': '#e5e7eb'
                            }}
                        />
                    </div>
                )}


            </div>

            <Footer />

            {/* Seat Selection Modal */}
            {/* <SeatListModal
                open={showSeatModal}
                onClose={handleCloseSeatModal}
                schedule={selectedSchedule}
            /> */}
        </div>
    );
};

export default CarDetail;

