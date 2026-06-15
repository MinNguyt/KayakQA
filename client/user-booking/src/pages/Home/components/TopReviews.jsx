import React from 'react';
import './TopReviews.css';

const TopReviews = () => {
    const cities = [
        {
            name: 'Sài Gòn',
            reviews: '1.2k',
            image: 'https://i.pinimg.com/1200x/ef/78/37/ef78370fd9db0d29245b16444393baf6.jpg',
            size: 'large'
        },
        {
            name: 'Vũng Tàu',
            reviews: '450',
            image: 'https://i.pinimg.com/736x/b7/fd/18/b7fd1844b78aa40435be0ee5ab59540c.jpg',
            size: 'medium'
        },
        {
            name: 'Đà Lạt',
            reviews: '890',
            image: 'https://i.pinimg.com/736x/90/53/b1/9053b13744541ab0a85aca7f9328cfdd.jpg',
            size: 'medium'
        },
        {
            name: 'Quy Nhơn',
            reviews: '320',
            image: 'https://i.pinimg.com/736x/ee/30/94/ee3094494632aaa8e4c3fe81b42a7b82.jpg',
            size: 'medium'
        },
        {
            name: 'Nha Trang',
            reviews: '670',
            image: 'https://i.pinimg.com/736x/4d/75/8e/4d758e48c0f7fc5c532392e39450a737.jpg',
            size: 'medium'
        },
        {
            name: 'Hà Nội',
            reviews: '950',
            image: 'https://i.pinimg.com/736x/ee/58/91/ee58912e57f7df698f52f861680472e7.jpg',
            size: 'large'
        },
        {
            name: 'Đà Nẵng',
            reviews: '740',
            image: 'https://i.pinimg.com/736x/e7/24/2c/e7242ca20869cd9a6a7c697235afe78c.jpg',
            size: 'medium'
        },
        {
            name: 'Phan Thiết',
            reviews: '280',
            image: 'https://i.pinimg.com/1200x/b8/03/f7/b803f7f0b50b4c8754014356c45a3e7b.jpg',
            size: 'medium'
        },
        {
            name: 'Hội An',
            reviews: '550',
            image: 'https://i.pinimg.com/736x/fb/ea/9f/fbea9f7ce62f826f168bc0edbeaa5626.jpg',
            size: 'medium'
        },
        {
            name: 'Sa Pa',
            reviews: '420',
            image: 'https://i.pinimg.com/1200x/dc/0d/7c/dc0d7c8d228cbb4a8c119ccf6ecf51c2.jpg',
            size: 'medium'
        }
    ];

    const handleCityClick = (cityName) => {
        console.log(`Clicked on ${cityName}`);
    };

    return (
        <section className="top-reviews">
            <div className="container">
                <div className="section-header">
                    <h2>Điểm đến nổi bật</h2>
                    <p>Khám phá vẻ đẹp Việt Nam qua những điểm đến được yêu thích nhất</p>
                    <div className="w-20 h-1 bg-orange-500 mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="cities-grid">
                    {cities.map((city, idx) => (
                        <div
                            key={idx}
                            className={`city-card ${city.size}`}
                            onClick={() => handleCityClick(city.name)}
                            tabIndex={0}
                            role="button"
                        >
                            <div
                                className="city-bg"
                                style={{ backgroundImage: `url('${city.image}')` }}
                            ></div>
                            <div className="city-overlay">
                                <h3 className="city-name">{city.name}</h3>
                                {/* <div className="city-reviews">
                                    <span className="review-badge">
                                        <i className="fas fa-camera mr-2"></i>
                                        {city.reviews} bài viết
                                    </span>
                                </div> */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TopReviews;
