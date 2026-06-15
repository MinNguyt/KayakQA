import React from 'react';

const Boastcast = () => {
    // Platform benefits data with FontAwesome icons
    const platformBenefits = [
        {
            icon: "fa-search-location",
            title: "Mạng Lưới Rộng Khắp",
            description: "Hơn 5000+ tuyến đường và 1500+ nhà xe chất lượng cao trên toàn quốc"
        },
        {
            icon: "fa-ticket-alt",
            title: "Đảm Bảo Có Vé",
            description: "Cam kết giữ vé 100%, hoàn ngay 150% nếu có sự cố, giúp bạn an tâm trọn hành trình"
        },
        {
            icon: "fa-shield-alt",
            title: "Thanh Toán An Toàn",
            description: "Đa dạng phương thức thanh toán bảo mật, tiện lợi và nhanh chóng"
        },
        {
            icon: "fa-headset",
            title: "Hỗ Trợ 24/7",
            description: "Đội ngũ chuyên viên tận tâm, sẵn sàng giải quyết mọi vấn đề 24/7"
        }
    ];

    // Media partners with generated placeholder logos
    const mediaPartners = [
        { name: "24h", logo: "https://placehold.co/180x60/f8fafc/64748b?text=24h&font=roboto" },
        { name: "VTC News", logo: "https://placehold.co/180x60/f8fafc/64748b?text=VTC+News&font=roboto" },
        { name: "Eva", logo: "https://placehold.co/180x60/f8fafc/64748b?text=Eva&font=roboto" },
        { name: "Afamily", logo: "https://placehold.co/180x60/f8fafc/64748b?text=Afamily&font=roboto" },
        { name: "Báo BRVT", logo: "https://placehold.co/180x60/f8fafc/64748b?text=BRVT&font=roboto" },
        { name: "Đà Nẵng", logo: "https://placehold.co/180x60/f8fafc/64748b?text=Da+Nang&font=roboto" },
        { name: "VnExpress", logo: "https://placehold.co/180x60/f8fafc/64748b?text=VnExpress&font=roboto" },
        { name: "Dantri", logo: "https://placehold.co/180x60/f8fafc/64748b?text=Dantri&font=roboto" }
    ];

    return (
        <React.Fragment>
            {/* Platform Benefits Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-6 tracking-tight">
                            Nền Tảng Kết Nối <span className="text-orange-500">Số 1 Việt Nam</span>
                        </h2>
                        <p className="text-lg text-gray-500">
                            Chúng tôi tự hào mang đến giải pháp di chuyển thông minh, kết nối hàng triệu hành khách với những chuyến đi an toàn và tiện lợi nhất.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {platformBenefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="group relative p-8 bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl mb-6 shadow-blue-200 shadow-xl group-hover:rotate-6 transition-transform duration-300">
                                        <i className={`fas ${benefit.icon}`}></i>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed font-medium text-sm">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Media Partners Section */}
            <section className="py-16 bg-slate-50 border-t border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <span className="text-sm font-bold tracking-widest text-gray-400 uppercase py-2 px-4 border border-gray-200 rounded-full bg-white">
                            Đối Tác Truyền Thông
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-300">
                        {mediaPartners.map((partner, index) => (
                            <div
                                key={index}
                                className="group w-32 md:w-40 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105"
                            >
                                <img
                                    src={partner.logo}
                                    alt={`${partner.name} logo`}
                                    className="max-w-full h-auto object-contain mix-blend-multiply"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </React.Fragment>
    );
};

export default Boastcast;
