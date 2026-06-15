import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import apiService from '../../../services/api.service';
import { API_ENDPOINTS } from '../../../services/base.api.url';
import { getImageUrl, createImageLoader } from '../../../utils';
import './PopularRoutes.css';
import { useNavigate } from "react-router-dom";

// Navigation arrow images from Figma
const leftArrowIcon = "http://localhost:3845/assets/cc82f17c638e096533f28cc5091917c57ac4f120.svg";
const rightArrowIcon = "http://localhost:3845/assets/2c2f251fc8b01acabda3394a557552503403619d.svg";

const PopularRoutes = () => {
    const [popularRoutes, setPopularRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const swiperRef = useRef(null);

    // Fetch popular routes from backend
    useEffect(() => {
        fetchPopularRoutes();
    }, []);
    console.log("popularroute", popularRoutes)
    const fetchPopularRoutes = async () => {
        try {

            const response = await apiService.getRoutes();
            console.log(response);
            if (response.success) {
                setPopularRoutes(response.data.data.results || []);
            } else {
                setError('Failed to fetch popular routes');
            }
        } catch (err) {
            setError('Error fetching popular routes');
            console.error('Error fetching popular routes:', err);
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
        <section className="py-5 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-left mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-orange-500 pl-4">
                        Tuyến Đường Phổ Biến
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
                        {popularRoutes.map((route, index) => (
                            <SwiperSlide key={route.id || index}>
                                <RouteCard route={route} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Swiper Pagination */}
                    <div className="swiper-pagination mt-8 flex justify-center"></div>
                </div>
            </div>
        </section>
    );
};

// Route Card Component
const RouteCard = ({ route }) => {
    const navigate = useNavigate();
    // Use fallback values for safety
    const {
        from = route.departure_name || 'Điểm đi',
        to = route.arrival_name || 'Điểm đến',
        duration = route.estimated_duration_hours ? `${Number.parseInt(route.estimated_duration_hours)} giờ` : '2 giờ',
        distance = route.distance_km ? `${Number.parseInt(route.distance_km)} km` : '100 km'
    } = route;

    const handleCardClick = () => {
        const params = new URLSearchParams({
            departure: route.arrival_station_id,
            destination: route.departure_station_id,
        });
        navigate(`/bus-list?${params.toString()}`);
    };

    return (
        <div
            className="cursor-pointer rounded-2xl bg-gradient-to-br from-blue-50 to-orange-50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
            onClick={handleCardClick}
        >
            {/* Gradient Placeholder */}
            <div className="relative h-32 md:h-36 flex items-center justify-center bg-gradient-to-tr from-orange-200 via-gray-100 to-blue-200">
                <span className="inline-block text-4xl md:text-6xl -mt-2 select-none">🚌</span>
                {/* Decorative diagonal divider */}
                <svg className="absolute left-0 bottom-0 w-full h-10" viewBox="0 0 100 10" preserveAspectRatio="none"><polygon fill="#fff" points="0,10 100,0 100,10" /></svg>
            </div>

            {/* Route Details */}
            <div className="p-5 flex flex-col gap-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 whitespace-nowrap">{from} <span className="text-orange-500">→</span> {to}</h3>
                <div className="flex justify-between items-center text-sm md:text-base text-gray-700">
                    <div className="flex items-center gap-1"><span role="img" aria-label="Thời gian">⏱</span><span>{duration}</span></div>
                    <div className="flex items-center gap-1"><span role="img" aria-label="Khoảng cách">🛣️</span><span>{distance}</span></div>
                </div>
            </div>
        </div>
    );
};

export default PopularRoutes;
