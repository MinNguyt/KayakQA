import React from 'react';
import { CImage, CSpinner } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilFilter } from '@coreui/icons';

const CompanyLogo = ({ image, companyName, size = 50, className = '' }) => {
    const [imageError, setImageError] = React.useState(false);


    const handleImageError = () => {
        setImageError(true);
    };



    if (imageError || !image) {
        return (
            <div
                className={`bg-light rounded d-flex align-items-center justify-content-center ${className}`}
                style={{ width: size, height: size }}
                title={companyName}
            >
                <CIcon icon={cilFilter} />
            </div>
        );
    }

    return (
        <img
            src={`http://localhost:8080/files${image}`}
            alt={companyName}
            width={size}
            height={size}
            className={`rounded ${className}`}
            style={{ objectFit: 'cover' }}

            onError={handleImageError}
        />
    );
};

export default CompanyLogo;


