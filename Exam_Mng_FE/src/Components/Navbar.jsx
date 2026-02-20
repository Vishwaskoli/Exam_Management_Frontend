import React, { useState } from "react";
import Sidebar from "./SideBar.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-blue-600 text-white px-4 py-1 flex justify-between items-center shadow-md z-50">
        
        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col gap-1 focus:outline-none"
        >
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
        </button>

        {/* Project Name */}
        <h1 className="text-lg font-semibold tracking-wide">
          Master Management System
        </h1>

        <div></div>
      </nav>

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Navbar;
