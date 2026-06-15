// Xây dựng các hàm dùng chung

// API Base URL from config
export const API_BASE_URL = 'http://localhost:8080/files';

// Utility to get full image URL
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '/image/placeholder-bus.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
};

// Utility to handle image loading with fallback
export const createImageLoader = (fallbackSrc = '/image/placeholder-bus.png') => {
    return {
        // onError: (e) => {
        //     e.target.src = fallbackSrc;
        // }
    };
};