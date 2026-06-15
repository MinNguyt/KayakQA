import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import apiService from '../../../services/api.service';
import { API_ENDPOINTS } from '../../../services/base.api.url';
import { getImageUrl, createImageLoader } from '../../../utils';
import './PopularRoutes.css';

const PopularBusCompany = () => {
    const [popularBusCompanies, setPopularBusCompanies] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewsError, setReviewsError] = useState(null);

    const swiperRef = useRef(null);

    // Fetch popular routes from backend
    useEffect(() => {
        fetchPopularBusCompanies();

    }, []);
    console.log('pub', popularBusCompanies)
    const fetchPopularBusCompanies = async () => {
        try {

            const response = await apiService.getBusCompanies();
            console.log("pupBus", response);
            if (response.success) {
                setPopularBusCompanies(response.data.data.content || []);
            } else {
                setError('Failed to fetch popular routes');
            }
        } catch (err) {
            setError('Error fetching popular routes');
            console.error('Error fetching popular routes:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await apiService.getBusReviews();
            if (response.success) {
                setReviews(response.data.responseObject || []);
            } else {

            }
        } catch (err) {

            console.error('Error fetching reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    // Navigation functions
    const goNext = () => {
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slideNext();
        }
    };

    const goPrev = () => {
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slidePrev();
        }
    };

    // Custom navigation button component
    const NavigationButton = ({ direction, onClick, disabled }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95'
                }`}
            aria-label={`${direction === 'left' ? 'Previous' : 'Next'} slide`}
        >
            <a>{direction === 'left' ? '<' : '>'}</a>
        </button>
    );

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <>
            <section className="py-5 bg-gray-50">
                <div className="container mx-auto px-4">
                    {/* Section Header */}
                    <div className="text-left mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-orange-500 pl-4">
                            Nhà Xe Phổ Biến
                        </h2>
                    </div>

                    {/* Popular Routes Slider */}
                    <div className="relative">
                        {/* Custom Navigation Buttons */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 z-10 -ml-6">
                            <NavigationButton
                                direction="left"
                                onClick={goPrev}
                                disabled={false}
                            />
                        </div>

                        <div className="absolute top-1/2 -translate-y-1/2 right-0 z-10 -mr-6">
                            <NavigationButton
                                direction="right"
                                onClick={goNext}
                                disabled={false}
                            />
                        </div>

                        {/* Swiper Container */}
                        <Swiper
                            ref={swiperRef}
                            modules={[Navigation, Pagination]}
                            spaceBetween={24}
                            slidesPerView={1}
                            breakpoints={{
                                640: {
                                    slidesPerView: 2,
                                    spaceBetween: 20,
                                },
                                768: {
                                    slidesPerView: 3,
                                    spaceBetween: 24,
                                },
                                1024: {
                                    slidesPerView: 4,
                                    spaceBetween: 24,
                                },
                            }}
                            loop={true}
                            navigation={{
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            }}
                            pagination={{
                                clickable: true,
                                el: '.swiper-pagination',
                            }}
                            className="popular-routes-swiper"
                        >
                            {popularBusCompanies.map((busCompany, index) => (
                                <SwiperSlide key={busCompany.id || index}>
                                    <BusCompanyCard busCompany={busCompany} />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Swiper Pagination */}
                        <div className="swiper-pagination mt-8 flex justify-center"></div>
                    </div>
                </div>
            </section>


        </>
    );
};

// Bus Company Card Component - Premium Design
const BusCompanyCard = ({ busCompany }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/bus-company-detail/${busCompany.id}`);
    };

    // Truncate description for preview
    const truncateText = (text, maxLength = 60) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div
            className="cursor-pointer h-[100%] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2"
            onClick={handleCardClick}
            style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            }}
        >
            {/* Image Container with Overlay */}
            <div className="relative h-52 overflow-hidden">
                {/* Main Image */}
                <img
                    src={`http://localhost:8080/files${busCompany.image}`}
                    alt={busCompany.companyName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    {...createImageLoader()}
                />

                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0 opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                    style={{
                        background: 'linear-gradient(180deg, transparent 0%, transparent 40%, rgba(0,0,0,0.8) 100%)',
                    }}
                />

                {/* Active Status Badge */}
                {/* {busCompany.isActive === 1 && (
                    <div className="absolute top-3 right-3">
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm"
                            style={{
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%)',
                                color: 'white',
                            }}
                        >
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Đang hoạt động
                        </span>
                    </div>
                )} */}

                {/* Company Name on Image */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-1 group-hover:text-orange-300 transition-colors duration-300">
                        {busCompany.companyName}
                    </h3>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex flex-col justify-between items-left">
                {/* Description */}
                {busCompany.descriptions && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed h-[60px]">
                        {truncateText(busCompany.descriptions, 80)}
                    </p>
                )}

                {/* Info Row */}
                <div className="flex items-center justify-between">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-500">
                        <svg
                            className="w-4 h-4 text-orange-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        <span className="text-xs font-medium">{busCompany.address || 'Việt Nam'}</span>
                    </div>

                    {/* View Details Button */}
                    <div
                        className="flex items-center gap-1 text-orange-500 text-sm font-semibold group-hover:text-orange-600 transition-colors duration-300"
                    >
                        <span>Chi tiết</span>
                        <svg
                            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Decorative Bottom Border */}
                <div
                    className="mt-4 h-1 rounded-full overflow-hidden"
                    style={{ background: 'linear-gradient(90deg, #f97316 0%, #fb923c 50%, #fdba74 100%)' }}
                >
                    <div
                        className="h-full w-0 group-hover:w-full transition-all duration-700 ease-out"
                        style={{ background: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)' }}
                    />
                </div>
            </div>
        </div>
    );
};


export default PopularBusCompany;
