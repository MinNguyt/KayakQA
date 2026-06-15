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

const PupularStation = () => {
    const [popularStations, setPopularStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const swiperRef = useRef(null);

    // Fetch popular routes from backend
    useEffect(() => {
        fetchPopularStations();
    }, []);

    const fetchPopularStations = async () => {
        try {

            const response = await apiService.getPopularStations();
            console.log(response);
            if (response.success) {
                setPopularStations(response.data.responseObject);
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
            <section className="py-16 bg-gray-50">
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
                            {popularStations.map((station, index) => (
                                <SwiperSlide key={station.id || index}>
                                    <StationCard station={station} />
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

// Route Card Component
const StationCard = ({ station }) => {
    return (
        <div className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Route Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={getImageUrl(`${station.image}`)}
                    alt={`${station.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    {...createImageLoader()}
                />
            </div>

            {/* Route Details */}
            <div className="p-4">
                <h3 className="text-md font-bold text-gray-900 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    {station.name}
                </h3>
            </div>
        </div>
    );
};



export default PupularStation;
