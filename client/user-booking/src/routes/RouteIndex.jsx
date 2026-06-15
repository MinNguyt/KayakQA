import React from 'react';
import { Routes, Route } from "react-router-dom";
import Home from '../pages/Home/Home.jsx';
import About from '../pages/Home/About/About.jsx';
import BusCompany from '../pages/Home/Bus_company/Bus_Company.jsx';
import Station from '../pages/Home/Station/Station.jsx';
import RoutePage from '../pages/Home/Route/Route.jsx';
import BusList from '../pages/Home/Bus_list/BusList.jsx';
import CheckTicket from '../pages/Home/CheckTicket/CheckTicket.jsx';
import Login from '../pages/Auth/Login.jsx';
import Register from '../pages/Auth/Register.jsx';
import CarDetail from '../pages/Home/CarDetail/CarDetail.jsx';
import BusCompanyDetail from '../pages/Home/BusCompanyDetail/BusCompanyDetail.jsx';
import ResetPassword from '../pages/Auth/ResetPassword.jsx';

function RouteIndex(props) {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/bus-company" element={<BusCompany />} />
                <Route path="/station" element={<Station />} />
                <Route path="/route" element={<RoutePage />} />
                <Route path="/bus-list" element={<BusList />} />
                <Route path="/check-ticket" element={<CheckTicket />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/car-detail/:id" element={<CarDetail />} />
                <Route path="/bus-company-detail/:id" element={<BusCompanyDetail />} />
            </Routes>
        </div>
    );
}

export default RouteIndex;