import React from "react";
import { Outlet } from "react-router-dom";
import  Header from "../components/Header";
import Footer from "../components/Footer";
import './style.css'
// Xây dựng layout
function Layout(){
  return(
    <>
      <div className="layout">
        <div className="layout-header"><Header/> </div>
        <div className="layout-main"><Outlet/></div>
        <div className="layout-footer"><Footer/> </div>
      </div>
    </>
  )
}
export default Layout;