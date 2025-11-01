import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600" style={{ fontFamily: "Pacifico, serif" }}>
              Bibleway
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Home</Link>
              <Link to="/services" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Services</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Contact</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium">
              Login
            </Link>
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Sign Up
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600 p-2">
              <i className={isMenuOpen ? "ri-close-line" : "ri-menu-line"}></i>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 md:hidden">
            <div className="p-4">
              <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 text-gray-700 hover:text-blue-600">
                <i className="ri-close-line text-2xl"></i>
              </button>
              <div className="mt-12 space-y-1">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg">Home</Link>
                <Link to="/services" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg">Services</Link>
                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg">About</Link>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg">Contact</Link>
                <hr className="my-4" />
                <div className="space-y-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-center font-medium">Login</Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium">Sign Up</Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
