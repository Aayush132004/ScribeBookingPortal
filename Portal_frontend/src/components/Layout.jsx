import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, userRole }) => {
  return (
    <div className="min-h-screen bg-surface">
      {/* Accessibility: Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar userRole={userRole} />

      <main id="main-content" className="max-w-7xl mx-auto p-4 md:p-6 pt-20 md:pt-24 focus:outline-none" tabIndex="-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;