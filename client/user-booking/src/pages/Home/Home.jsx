
import Navigation from './Navigation.jsx';
import HomeBanner from './components/HomeBanner.jsx';
import PopularRoutes from './components/PopularRoutes.jsx';
import PopularBusCompany from './components/PopularBusCompany.jsx';
import TopReviews from './components/TopReviews.jsx';
import PupularStation from './components/PupularStation.jsx';
import Boastcast from './components/Boastcast.jsx';
import Footer from './components/Footer.jsx';

const Home = () => {
    return (
        <>
            <Navigation />
            <HomeBanner />
            <PopularRoutes />
            <PopularBusCompany />
            <TopReviews />
            {/* <PupularStation /> */}
            <Boastcast />
            <Footer />

        </>
    );
};

export default Home;
