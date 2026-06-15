import Footer from '../components/Footer.jsx';
import Navigation from '../Navigation.jsx';

const About = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            {/* Hero Banner Section - Desktop Layout */}
            {/* <section className="bg-gradient-to-r from-blue-50 to-cyan-100 h-[640px] relative overflow-hidden">
                <div className="absolute inset-0 bg-right bg-no-repeat bg-contain opacity-20"></div>
                <div className="relative z-10 h-full flex items-center">
                    <div className="max-w-6xl mx-auto px-4 md:px-[170px] w-full">
                        <div className="flex flex-row gap-8 w-[100%]">
                            <div className="text-left">
                                <h1 className="text-4xl md:text-6xl lg:text-[80px] font-bold text-orange-500 leading-[92px] mb-0">
                                    Tiện lợi,
                                </h1>
                                <h1 className="text-4xl md:text-6xl lg:text-[80px] font-bold text-orange-500 leading-[92px] mb-0">
                                    tận tâm,
                                </h1>
                                <h1 className="text-4xl md:text-6xl lg:text-[80px] font-bold text-blue-500 leading-[92px]">
                                    an toàn.
                                </h1>
                            </div>


                        </div>
                    </div>
                </div>
            </section> */}

            {/* Company Introduction Section */}
            <section className="py-16 px-4 md:px-[170px]">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl lg:text-[36px] font-bold text-gray-800 leading-[48px] mb-4">
                            Hệ thống đặt vé xe toàn quốc{' '}
                            <span className="text-orange-500">Kayak.com</span>
                        </h2>
                        <div className="text-base md:text-lg lg:text-[20px] text-gray-600 leading-[32px] space-y-2">
                            <p>
                                Trong thời đại số hóa ngày nay, việc sử dụng công nghệ thông tin để giải quyết nhu cầu của cuộc sống trở nên
                            </p>
                            <p>
                                quen thuộc. Khi bạn cần tìm một trang web đáng tin cậy để đặt vé xe, VivuToday.com sẽ là người bạn đáng tin
                            </p>
                            <p>
                                để giúp bạn di chuyển một cách an toàn và tiện lợi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Desktop 3-column Layout */}
            <section className="py-16 px-4 md:px-[170px]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Safety Feature */}
                        <div className="bg-blue-500 text-white p-6 rounded-2xl border-4 border-blue-500 h-[371px] flex flex-col justify-between">
                            <div className="text-sm md:text-base lg:text-[20px] leading-[32px] space-y-2">
                                <p>
                                    Chúng tôi <span className="font-bold">cam kết đảm bảo</span>
                                </p>
                                <p>cho bạn môi trường đáng tin</p>
                                <p>cậy để đặt vé xe. Với việc</p>
                                <p>kiểm tra độ tin cậy và sự hợp</p>
                                <p>
                                    tác với các đối tác uy tín, chúng tôi đảm bảo mỗi
                                    chuyến đi của bạn diễn ra{' '}
                                    <span className="font-bold">an toàn và suôn sẻ</span>
                                </p>
                            </div>
                            <h3 className="text-xl md:text-2xl lg:text-[24px] font-bold leading-[38.4px]">An Toàn Được Đảm Bảo</h3>
                        </div>

                        {/* Support Feature */}
                        <div className="bg-cyan-500 text-white p-6 rounded-2xl border-4 border-cyan-500 h-[371px] flex flex-col justify-between">
                            <div className="text-sm md:text-base lg:text-[21px] leading-[35.2px] space-y-2">
                                <p>Với đội ngũ tư vấn viên</p>
                                <p>
                                    chuyên nghiệp luôn sẵn sàng{' '}
                                    <span className="font-bold">hỗ trợ 24/7</span>, chúng tôi sẽ giúp
                                    bạn mọi lúc bạn cần. Điều này đảm bảo bạn luôn có{' '}
                                    <span className="font-bold">một người bạn đồng hành đáng tin</span> trong mỗi hành trình.
                                </p>
                            </div>
                            <h3 className="text-xl md:text-2xl lg:text-[24px] font-bold leading-[38.4px]">Hỗ Trợ Tận Tâm</h3>
                        </div>

                        {/* Choice Feature */}
                        <div className="bg-white p-6 rounded-2xl border-4 border-orange-500 h-[371px] flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-orange-500">
                                    <div className="text-2xl md:text-3xl lg:text-[37px] font-bold leading-[64px]">1500+</div>
                                    <div className="text-lg md:text-xl lg:text-[22px] leading-[35.2px]">nhà xe</div>
                                </div>
                                <div className="flex items-center gap-2 text-orange-500">
                                    <div className="text-2xl md:text-3xl lg:text-[37px] font-bold leading-[64px]">5000+</div>
                                    <div className="text-lg md:text-xl lg:text-[22px] leading-[35.2px]">lịch trình</div>
                                </div>
                                <div className="text-gray-600 text-base md:text-lg lg:text-[22px] leading-[35.2px] space-y-1">
                                    <p>Chúng tôi cung cấp nhiều sự</p>
                                    <p>lựa chọn để đáp ứng mọi nhu</p>
                                    <p>cầu của khách hàng.</p>
                                </div>
                            </div>
                            <h3 className="text-xl md:text-2xl lg:text-[24px] font-bold text-blue-500 leading-[38.4px]">Đa Dạng Sự Lựa Chọn</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-16 px-4 md:px-[170px]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl lg:text-[36px] font-bold text-gray-800 leading-[48px]">
                            Lý do bạn nên đặt vé tại{' '}
                            <span className="text-orange-500">Kayak.com</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                        {/* Left Column */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg md:text-xl lg:text-[18px] font-bold text-orange-500 mb-4 leading-[32px]">
                                    Tìm Kiếm Thông Tin Một Cách Dễ Dàng
                                </h3>
                                <p className="text-base md:text-lg lg:text-[16px] text-gray-600 leading-[24px]">
                                    Giao diện của VivuToday.com được thiết kế để giúp bạn tìm kiếm thông tin nhà xe, giờ khởi hành, điểm xuất
                                    phát và đích một cách nhanh chóng và dễ dàng. Thông qua việc nhập các thông tin cơ bản, bạn có thể tìm kiếm
                                    lịch trình phù hợp chỉ trong vài giây.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg md:text-xl lg:text-[18px] font-bold text-orange-500 mb-4 leading-[32px]">
                                    Tùy Chỉnh Theo Tài Chính Của Bạn
                                </h3>
                                <p className="text-base md:text-lg lg:text-[16px] text-gray-600 leading-[24px]">
                                    Chúng tôi hiểu rằng mỗi hành trình có một ngân sách riêng. Với giao diện của chúng tôi, bạn có thể tùy chỉnh
                                    lựa chọn những nhà xe nằm trong khoảng giá tiền mà bạn mong muốn. Điều này giúp bạn tiết kiệm thời gian và
                                    tìm được các lựa chọn phù hợp với túi tiền.
                                </p>
                            </div>
                        </div>

                        {/* Center Image */}
                        {/* <div className="hidden lg:flex items-center justify-center">
                            <div className="w-48 h-48 md:w-[354px] md:h-[450px] bg-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-gray-600 text-lg">Image Placeholder</span>
                            </div>
                        </div> */}

                        {/* Right Column */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg md:text-xl lg:text-[18px] font-bold text-orange-500 mb-4 leading-[32px]">
                                    Lựa Chọn Nhà Xe Có Đánh Giá Cao
                                </h3>
                                <p className="text-base md:text-lg lg:text-[16px] text-gray-600 leading-[24px]">
                                    Chất lượng là một yếu tố quan trọng. Trên giao diện của VivuToday.com, bạn có thể chọn lựa những nhà xe được
                                    đánh giá cao với mục đánh giá 5 sao. Điều này đảm bảo rằng bạn đang chọn một dịch vụ uy tín và chất lượng
                                    cho hành trình của mình.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg md:text-xl lg:text-[18px] font-bold text-orange-500 mb-4 leading-[32px]">
                                    Thanh Toán An Toàn
                                </h3>
                                <p className="text-base md:text-lg lg:text-[16px] text-gray-600 leading-[24px]">
                                    Việc thanh toán không còn là vấn đề khiến bạn lo lắng. Chúng tôi cung cấp các phương thức thanh toán đa dạng
                                    bao gồm thanh toán trực tuyến, qua ngân hàng và epays. Đảm bảo bạn có sự linh hoạt trong việc chọn phương
                                    thức phù hợp với bạn và đảm bảo tính an toàn cho giao dịch.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Focus Section - New Desktop Section */}
            <section className="py-16 px-4 md:px-[170px]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl lg:text-[36px] font-bold text-orange-500 leading-[48px]">
                            Khách hàng là trung tâm
                        </h2>
                    </div>

                    <div className="text-center space-y-4">
                        <p className="text-base md:text-lg lg:text-[20px] text-gray-600 leading-[32px]">
                            Chúng tôi luôn đặt "khách hàng là trung tâm" và xem việc làm hài lòng, đáp ứng nhu cầu của khách hàng như mục
                            tiêu hàng đầu. Chúng tôi lắng nghe và tiếp thu những đóng góp quý báu từ khách hàng, để không ngừng hoàn
                            thiện, đổi mới và cung cấp dịch vụ ngày càng tốt hơn.
                        </p>
                        <p className="text-base md:text-lg lg:text-[20px] text-gray-600 leading-[32px]">
                            Nếu bạn cần di chuyển đến bất kỳ tỉnh thành nào trong cả nước, hãy đến với kayak.com để trải nghiệm những
                            tiện ích tuyệt vời mà hệ thống của chúng tôi mang lại.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            {/* <section className="py-16 px-4 md:px-[170px]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl lg:text-[36px] font-bold text-orange-500 leading-[48px]">
                            Liên hệ với chúng tôi
                        </h2>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <form className="space-y-6">
                            <div>
                                <label className="block text-lg font-bold text-gray-800 mb-2">
                                    Họ Và Tên:
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-12 px-4 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập họ và tên của bạn"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-bold text-gray-800 mb-2">
                                    Email:
                                </label>
                                <input
                                    type="email"
                                    className="w-full h-12 px-4 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập email của bạn"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-bold text-gray-800 mb-2">
                                    Số Điện Thoại:
                                </label>
                                <input
                                    type="tel"
                                    className="w-full h-12 px-4 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập số điện thoại của bạn"
                                />
                            </div>

                            <div>
                                <label className="block text-lg font-bold text-gray-800 mb-2">
                                    Tin Nhắn:
                                </label>
                                <textarea
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập tin nhắn của bạn"
                                ></textarea>
                            </div>

                            <div className="text-center">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors duration-300 w-[353px] h-12"
                                >
                                    Gửi Ngay
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section> */}

            {/* Footer Information */}
            <Footer />
        </div>
    );
};

export default About;