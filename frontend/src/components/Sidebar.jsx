// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Use Link for navigation
import { NotebookPen,Leaf, Music, Home, Settings, Camera } from 'lucide-react'; // Icons

const menuItems = [
  // path '/' is for the dashboard (Home)
  { name: 'Home', icon: Home, path: '/' }, 
  { name: 'Daily-Notes', icon: NotebookPen, path: '/daily-notes' }, 
  { name: 'Our-Songs', icon: Music, path: '/our-songs/addsong' },
  { name: 'Our-Memories', icon: Camera, path: '/our-memories/add-memory' },
  { name: 'Gallery', icon: Settings, path: '/our-gallery/upload-photo' },
  { name: 'Mood-Muse', icon: Leaf, path: '/mood-muse/generate' },
];

// activePath will be the current URL path (e.g., '/', '/favorites')
const Sidebar = ({ activePath }) => {
  
  return (
    <nav 
      className="fixed top-0 left-0 h-screen w-56 bg-pink-600 shadow-2xl z-10 p-4"
    >
      <div className="flex flex-col h-full">
        
        {/* Brand Name (EVOL) */}
        <div className="text-white text-3xl font-extrabold tracking-widest text-center mb-10 pb-4 border-b border-pink-400">
            EVOL
        </div>
        
        {/* Navigation Items */}
        <div className="flex flex-col space-y-3">
          {menuItems.map((item) => (
            <Link
                key={item.name}
                to={item.path} // Link to the correct path
                // Check if the current route path matches the item's path
                className={`
                    flex items-center w-full text-left p-3 rounded-xl cursor-pointer transition-all duration-200 
                    ${item.path === activePath || (item.path === '/' && activePath === '') // Special check for the root path
                        ? 'bg-white text-pink-600 shadow-lg' 
                        : 'text-white hover:bg-pink-500 hover:scale-[1.02]'}`
                }
            >
              <item.icon size={20} className="mr-3" />
              <span className="font-medium whitespace-nowrap">
                  {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;