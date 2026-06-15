import React from 'react';
import { CImage } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilFilter } from '@coreui/icons';

const StationImage = ({ image, stationName, size = 50, className = '' }) => {
    const [imageError, setImageError] = React.useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    // if (imageError || !image) {
    //     return (
    //         <div
    //             className={`bg-light rounded d-flex align-items-center justify-content-center ${className}`}
    //             style={{ width: size, height: size }}
    //             title={stationName}
    //         >
    //             <CIcon icon={cilFilter} />
    //         </div>
    //     );
    // }

    return (
        <img
            src={image}
            alt={stationName || 'Station'}
            width={size}
            height={size}
            className={`rounded ${className}`}
            style={{ objectFit: 'cover' }}
            onError={handleImageError}
        />
    );
};

export default StationImage;
