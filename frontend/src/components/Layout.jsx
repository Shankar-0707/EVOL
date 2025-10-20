// src/components/Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // Key components for routing
import Sidebar from './Sidebar'; // Import the Sidebar from the next section

// Define the static width of your sidebar (must match Tailwind class w-56)
const SIDEBAR_WIDTH = '14rem'; 

const Layout = () => {
    // useLocation is a hook that tells us the current URL path.
    // We use this to correctly highlight the active link in the sidebar.
    const location = useLocation();
    
    // Get the current path (e.g., / or /favorites) and remove the leading slash
    const activePath = location.pathname.substring(1) || 'home'; 

    return (
        <div className="flex min-h-screen bg-gray-50">
            
            {/* 1. The Fixed Sidebar */}
            {/* We pass the active path to the sidebar so it can highlight the current link */}
            <Sidebar activePath={activePath} /> 
            
            {/* 2. The Main Content Area */}
            <div 
                className="flex-grow p-10 transition-all duration-300"
                // Pushes the content over by the sidebar's width
                style={{ marginLeft: SIDEBAR_WIDTH }} 
            >
                {/* The <Outlet /> is where the content of the currently matched route 
                  (Dashboard, Favorites, etc.) will be rendered. 
                */}
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;