import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../../../services/api.service';
import Navigation from '../Navigation';
import Footer from '../components/Footer';
import { getImageUrl } from '../../../utils';

const BusCompanyDetail = () => {
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carsLoading, setCarsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [carsError, setCarsError] = useState(null);

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                setLoading(true);
                const response = await ApiService.getBusCompany(id);

                if (response.success) {
                    setCompany(response.data.responseObject);
                } else {
                    setError('Không thể tải thông tin nhà xe');
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải dữ liệu');
                console.error('Error fetching company details:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchCompanyCars = async () => {
            try {
                setCarsLoading(true);
                const response = await ApiService.getCarsByCompanyId(id);

                if (response.success) {
                    setCars(response.data.responseObject.results || []);
                } else {
                    setCarsError('Không thể tải danh sách xe');
                }
            } catch (err) {
                setCarsError('Có lỗi xảy ra khi tải danh sách xe');
                console.error('Error fetching company cars:', err);
            } finally {
                setCarsLoading(false);
            }
        };

        if (id) {
            fetchCompanyDetails();
            fetchCompanyCars();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1295db] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin nhà xe...</p>
                </div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error || 'Không tìm thấy thông tin nhà xe'}</p>
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
                {/* Company Header */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    {/* Featured Image */}
                    {company.featured_image && (
                        <div className="h-64 md:h-80 w-full">
                            <img
                                src={getImageUrl(company.featured_image)}
                                alt={company.company_name}
                                className="w-full h-full object-contain rounded-t-xl"
                                onError={(e) => {
                                    e.target.src = '/image/bus-placeholder.png';
                                }}
                            />
                        </div>
                    )}

                    {/* Company Basic Info */}
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.company_name}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                        Nhà xe uy tín
                                    </span>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                        {cars.length} xe
                                    </span>
                                </div>
                            </div>

                            {/* Company Logo */}
                            {company.image && (
                                <div className="mt-4 md:mt-0">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Logo</p>
                                        <img
                                            src={getImageUrl(company.image)}
                                            alt={`Logo ${company.company_name}`}
                                            className="w-16 h-16 object-contain rounded-lg"
                                            onError={(e) => {
                                                e.target.src = '/image/bus-placeholder.png';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {company.descriptions && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h3>
                                <p className="text-gray-700 leading-relaxed">{company.descriptions}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Markdown Content */}
                {company.markdown_html && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin chi tiết</h2>
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: company.markdown_html }}
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

                {/* Company Cars */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Danh sách xe</h2>

                    {carsLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1295db] mx-auto"></div>
                            <p className="mt-2 text-gray-600">Đang tải danh sách xe...</p>
                        </div>
                    ) : carsError ? (
                        <div className="text-center py-8">
                            <p className="text-red-600">{carsError}</p>
                        </div>
                    ) : cars.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Nhà xe này chưa có xe nào</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cars.map((car) => (
                                <div key={car.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-4">
                                        {car.featured_image && (
                                            <img
                                                src={getImageUrl(car.featured_image)}
                                                alt={car.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.src = '/image/bus-placeholder.png';
                                                }}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{car.name}</h3>
                                            <p className="text-sm text-gray-600">{car.license_plate}</p>
                                            <p className="text-sm text-blue-600">{car.capacity} chỗ ngồi</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Quay lại
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BusCompanyDetail;
