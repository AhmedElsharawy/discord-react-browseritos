import React from 'react';
// import { FaGithub } from 'react-icons/fa';
import logo from './assets/images/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center" />
      <div className="flex items-center justify-center">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
      </div>
      <div className="flex items-center" />
        {/* <FaGithub className="text-2xl" />
        <FaGithub className="text-2xl" />
      </div> */}
    </nav>
  );
};

export default Navbar;
