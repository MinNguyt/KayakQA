import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service.js';

export default function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    console.log('userData', userData)
    // Check authentication status on component mount
    useEffect(() => {
        const checkAuthStatus = () => {
            const user = apiService.getUserData();
            const token = apiService.getAuthToken();

            if (user && token) {
                setUserData(user);
            } else {
                setUserData(null);
            }
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            await apiService.logout();
            await apiService.clearAuthData();
            setUserData(null);
            setIsMobileMenuOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
            // Clear local data even if API call fails
            apiService.clearAuthData();
            setUserData(null);
            setIsMobileMenuOpen(false);
            navigate('/');
        }
    };

    return (
        <div className="w-full bg-white/0 shadow-[1px_1px_10px_0px_rgba(0,0,0,0.15)] inline-flex flex-col justify-start items-start">


            {/* Main Navigation */}
            <div className="w-full h-14 px-4 lg:px-44 inline-flex justify-between items-center gap-4 lg:gap-[5%]">
                {/* Logo */}
                {/* Hamburger Menu Button for Desktop */}
                <div class="flex items-center justify-center">
                    <button
                        onClick={toggleMobileMenu}
                        className="hidden lg:flex flex-col justify-center items-center w-10 h-10 rounded-md hover:bg-sky-50 transition-colors"
                        aria-label="Toggle navigation menu"
                    >
                        <div className={`w-6 h-0.5 bg-sky-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                        <div className={`w-6 h-0.5 bg-sky-600 my-1.5 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                        <div className={`w-6 h-0.5 bg-sky-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                    </button>
                    <img
                        onClick={() => navigate('/')}
                        className="w-20 h-12 lg:w-24 lg:h-14 relative cursor-pointer" src="/asets/images/logoxin.png" alt="logo" />


                </div>


                {/* Desktop Auth Buttons */}
                <div className="hidden lg:flex items-center gap-3">
                    {!isLoading && (
                        userData ? (
                            <div className="flex items-center gap-3 relative group">
                                <div className="flex items-center gap-2 cursor-pointer py-2">
                                    <span className="text-sky-600 text-sm font-medium">
                                        Xin chào, {userData.username || userData.email || 'User'}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down text-sky-600" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                                    </svg>
                                </div>

                                {/* Dropdown Menu */}
                                <div className="absolute top-full right-0 w-64 bg-white shadow-lg rounded-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-sky-50">
                                        <p className="text-sm font-bold text-gray-800 truncate">{userData.username || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{userData.role}</p>
                                    </div>
                                    <div className="p-2">
                                        <div className="px-3 py-2 hover:bg-gray-50 rounded-md transition-colors">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-sm font-medium text-gray-700">{userData.email || 'Chưa cập nhật'}</p>
                                        </div>
                                        {userData.age > 0 && (
                                            <div className="px-3 py-2 hover:bg-gray-50 rounded-md transition-colors">
                                                <p className="text-xs text-gray-500">Tuổi</p>
                                                <p className="text-sm font-medium text-gray-700">{userData.age}</p>
                                            </div>
                                        )}
                                        <div className="h-px bg-gray-100 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                                                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
                                            </svg>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-[150px] px-4 py-2 text-sky-600 text-sm font-medium border border-sky-600 rounded-md hover:bg-sky-50 transition-colors"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-[150px] px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-md hover:bg-sky-700 transition-colors"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        )
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden flex flex-col justify-center items-center w-8 h-8"
                    aria-label="Toggle mobile menu"
                >
                    <div className={`w-6 h-0.5 bg-sky-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                    <div className={`w-6 h-0.5 bg-sky-600 my-1 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                    <div className={`w-6 h-0.5 bg-sky-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                </button>
            </div>

            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleMobileMenu}
            ></div>

            {/* Side Navigation Panel */}
            <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Side Nav Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 ">
                    <div className="flex items-center gap-3">
                        <img className="w-16 h-10" src="/asets/images/logoxin.png" alt="logo" />
                        <span className="text-white text-lg font-bold">Menu</span>
                    </div>
                    <button
                        onClick={toggleMobileMenu}
                        className="text-white hover:bg-sky-700 rounded-full p-2 transition-colors"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="overflow-y-auto h-[calc(100%-80px)]">
                    <nav className="p-4 space-y-2">
                        {/* TRANG CHỦ */}
                        <div
                            onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${location.pathname === '/' ? 'bg-sky-600 text-white shadow-md' : 'text-gray-700 hover:bg-sky-50'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z" />
                            </svg>
                            <span className="font-bold text-sm uppercase tracking-tight">Trang chủ</span>
                        </div>

                        {/* GIỚI THIỆU */}
                        <div
                            onClick={() => { navigate('/about'); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${location.pathname === '/about' ? 'bg-sky-600 text-white shadow-md' : 'text-gray-700 hover:bg-sky-50'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                            </svg>
                            <span className="font-bold text-sm uppercase tracking-tight">Giới Thiệu</span>
                        </div>

                        {/* THÔNG TIN NHÀ XE */}
                        <div
                            onClick={() => { navigate('/bus-company'); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${location.pathname === '/bus-company' ? 'bg-sky-600 text-white shadow-md' : 'text-gray-700 hover:bg-sky-50'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a2.5 2.5 0 0 1-2.5 2.5H9.366a1 1 0 0 1-.866.5h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 .866.5H11.5A1.5 1.5 0 0 0 13 12h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5z" />
                            </svg>
                            <span className="font-bold text-sm uppercase tracking-tight">Thông tin nhà xe</span>
                        </div>

                        {/* BẾN XE */}
                        <div
                            onClick={() => { navigate('/station'); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${location.pathname === '/station' ? 'bg-sky-600 text-white shadow-md' : 'text-gray-700 hover:bg-sky-50'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z" />
                            </svg>
                            <span className="font-bold text-sm uppercase tracking-tight">Bến xe</span>
                        </div>

                        {/* TUYẾN ĐƯỜNG */}
                        <div
                            onClick={() => { navigate('/route'); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${location.pathname === '/route' ? 'bg-sky-600 text-white shadow-md' : 'text-gray-700 hover:bg-sky-50'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.502.502 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103zM10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98 4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z" />
                            </svg>
                            <span className="font-bold text-sm uppercase tracking-tight">Tuyến Đường</span>
                        </div>

                        {/* KIỂM TRA VÉ */}
                        <div
                            onClick={() => { navigate('/check-ticket'); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${location.pathname === '/check-ticket' ? 'bg-sky-600 text-white shadow-md' : 'text-gray-700 hover:bg-sky-50'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                                <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                            </svg>
                            <span className="font-bold text-sm uppercase tracking-tight">Kiểm Tra Vé</span>
                        </div>
                    </nav>

                    {/* Mobile Auth Buttons */}
                    <div className=" ml-3 mr-3 border-t border-gray-200 pt-3 mt-3">
                        {!isLoading && (
                            userData ? (
                                <div className="space-y-2 ">
                                    <div className="px-3 py-2 text-sky-600 text-sm font-medium">
                                        Xin chào, {userData.username || userData.email || 'User'}
                                    </div>
                                    <button
                                        onClick={() => { handleLogout(); }}
                                        className=" px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                                        className="w-full px-3 py-2 text-sky-600 text-sm font-medium border border-sky-600 rounded-md hover:bg-sky-50 transition-colors"
                                    >
                                        Đăng nhập
                                    </button>
                                    <button
                                        onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                                        className="w-full px-3 py-2 bg-sky-600 text-white text-sm font-medium rounded-md hover:bg-sky-700 transition-colors"
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                            )
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}