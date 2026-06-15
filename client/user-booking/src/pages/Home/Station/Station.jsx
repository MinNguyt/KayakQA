import React, { useState, useEffect } from 'react';
import ApiService from '../../../services/api.service';
import Navigation from '../Navigation';
import Footer from '../components/Footer';
import { getImageUrl } from '../../../utils';
const StationCard = ({ station }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden w-full max-w-[260px] mx-auto">
            {/* Company Image */}
            <div className="h-[170px] w-full relative">
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1295db]"></div>
                    </div>
                )}
                <img
                    src={imageError ? '/image/placeholder-bus.png' : getImageUrl(station.image)}
                    alt={station.name}
                    className="w-full h-full object-cover rounded-t-xl"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    crossOrigin="anonymous"
                />
            </div>

            {/* Company Info */}
            <div className="p-4 space-y-2">
                {/* Company Name */}
                <h3 className="text-lg font-bold text-black leading-6 truncate">
                    {station.name}
                </h3>

                {/* Company Address/Description */}
                <div className="flex gap-1 items-start">
                    <div className="text-[#3d54a5] text-sm mt-0.5 flex-shrink-0">
                    </div>
                    <p className="text-[#333333] text-xs leading-4 flex-1">
                        {station.descriptions || 'Thông tin liên hệ sẽ được cập nhật sớm'}
                    </p>
                </div>
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
            pages.push('...');
        }

        // Show pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (!pages.includes(i)) {
                pages.push(i);
            }
        }

        if (currentPage < totalPages - 2) {
            pages.push('...');
        }

        // Always show last page if more than 1 page
        if (totalPages > 1 && !pages.includes(totalPages)) {
            pages.push(totalPages);
        }

        return pages.map((page, index) => {
            if (page === '...') {
                return (
                    <div key={`dots-${index}`} className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-black">
                        <span className="text-sm font-bold text-black">…</span>
                    </div>
                );
            }

            const isActive = page === currentPage;
            return (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-bold ${isActive
                        ? 'bg-[#1295db] border-[#1295db] text-white'
                        : 'border-black text-black hover:bg-gray-100'
                        }`}
                >
                    {page}
                </button>
            );
        });
    };

    return (
        <div className="flex gap-2 items-center justify-center mt-6">
            {renderPageNumbers()}
            {currentPage < totalPages && (
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-black hover:bg-gray-100"
                >
                    <span className="text-black">›</span>
                </button>
            )}
        </div>
    );
};

const Station = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const companiesPerPage = 8; // 4x2 grid as shown in design

    const fetchBusCompanies = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const params = {
                page: page,
                limit: companiesPerPage,
                sortBy: 'name',
                order: 'asc'
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await ApiService.getStations(params);
            console.log(response);
            if (response.success) {
                setCompanies(response.data.data.results || []);
                // Calculate total pages based on response (you might need to adjust this based on your API response structure)
                const total = response.data.totalCount || response.data.responseObject?.length || 0;
                setTotalPages(Math.ceil(total / companiesPerPage));
            } else {
                setError('Không thể tải danh sách Bến xe');
                setCompanies([]);
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi tải dữ liệu');
            setCompanies([]);
            console.error('Error fetching bus companies:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusCompanies(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchBusCompanies(1, searchTerm);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1295db] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải danh sách Bến xe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <Navigation />
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-left mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-orange-500 pl-4">
                        Bến xe phổ biến
                    </h2>
                </div>
                {error ? (
                    <div className="text-center py-12">
                        <p className="text-red-600 text-lg">{error}</p>
                        <button
                            onClick={() => fetchBusCompanies(currentPage, searchTerm)}
                            className="mt-4 px-6 py-2 bg-[#1295db] text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">Không tìm thấy Bến xe nào</p>
                    </div>
                ) : (
                    <>
                        {/* Bus Companies Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {companies.map((station) => (
                                <StationCard key={station.id} station={station} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Footer Description */}
            <Footer />
        </div>
    );
};

export default Station;
