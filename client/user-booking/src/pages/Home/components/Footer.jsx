import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Column 1: About & News */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-lg font-bold mb-4 border-b-2 border-orange-500 inline-block pb-1">Tin tức nổi bật</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Xe Limousine – Đẳng cấp thương gia</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Review bến xe Vũng Tàu & Lịch trình</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Top 31 nhà xe limousine đi Đà Lạt</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4 border-b-2 border-orange-500 inline-block pb-1">Về Chúng Tôi</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Giới Thiệu Kayak</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Tin tức & Sự kiện</a></li>
              </ul>
            </div>
          </div>

          {/* Column 2: Popular Routes */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-bold mb-4 border-b-2 border-orange-500 inline-block pb-1">Tuyến đường phổ biến</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200 block">Sài Gòn - Đà Lạt</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200 block">Sài Gòn - Nha Trang</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200 block">Sài Gòn - Vũng Tàu</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200 block">Hà Nội - Sapa</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200 block">Hà Nội - Hạ Long</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200 block">Đà Nẵng - Huế</a></li>
            </ul>
          </div>

          {/* Column 3: Bus Stations & Partners */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-bold mb-4 border-b-2 border-orange-500 inline-block pb-1">Đối tác & Bến xe</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Bến xe Miền Đông</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Bến xe Mỹ Đình</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Nhà xe Phương Trang</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Nhà xe Thành Bưởi</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Nhà xe Kumho Samco</a></li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-bold mb-4 border-b-2 border-orange-500 inline-block pb-1">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors duration-200">Hướng dẫn đặt vé</a></li>
            </ul>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-sm font-semibold text-white mb-2">Tổng đài đặt vé:</p>
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <p className="text-orange-500 text-xl font-bold">1900 6067</p>
                <p className="text-xs text-gray-500 mt-1">Hỗ trợ 24/7</p>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-semibold text-white mb-3">Chứng nhận</h4>
              <div className="flex gap-2">
                <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-xs text-black font-bold">Visa</div>
                <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-xs text-black font-bold">MC</div>
                <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-xs text-black font-bold">JCB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; 2026 Kayak Transport Services. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-facebook-f"></i> Facebook</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-twitter"></i> Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><i className="fab fa-instagram"></i> Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
