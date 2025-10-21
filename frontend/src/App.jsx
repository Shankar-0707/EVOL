// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailyNotes from './pages/DailyNotes';
import ViewAllNotes from './pages/ViewAllNotes';
import AddSongs from './pages/AddSongs';
import ViewAllSongs from './pages/ViewSongs';
import AddMemory from './pages/AddMemory';
import ViewMemories from './pages/ViewMemories';
import AddPhotoGallery from './pages/AddPhotoGallery';
import ViewGallery from './pages/ViewGallery';
import GenerateContent from './pages/GenerateContentMood';
import ViewMoodMuse from './pages/ViewMoodMuse';
import GenerateQuiz from './pages/GenerateQuiz';
import ViewQuiz from './pages/ViewQuiz';

const App = () => {
    return (
        // BrowserRouter must wrap everything that uses routing
        <BrowserRouter>
            <Routes>
                {/* The main Route uses the Layout component as its element.
                  This ensures the Layout (which contains the Sidebar) is always rendered.
                */}
                <Route path="/" element={<Layout />}>
                    
                    {/* index: true means this is the default page for the parent path ("/").
                      When you first open the site (at the root URL), it shows the Dashboard.
                    */}
                    <Route index element={<Dashboard />} />

                    <Route path="/daily-notes" element={<DailyNotes />} />
                    <Route path="/view-all-daily-notes" element={<ViewAllNotes />} />
                    <Route path="/our-songs/addsong" element={<AddSongs />} />
                    <Route path="/our-songs/viewsongs" element={<ViewAllSongs />} />
                    <Route path="/our-memories/add-memory" element={<AddMemory />} />
                    <Route path="/our-memories/view-memories" element={<ViewMemories />} />
                    <Route path="/our-gallery/upload-photo" element={<AddPhotoGallery />} />
                    <Route path="/our-gallery/view-gallery" element={<ViewGallery />} />
                    <Route path="/mood-muse/generate" element={<GenerateContent />} />
                    <Route path="/mood-muse/view" element={<ViewMoodMuse />} />
                    <Route path="/couple-quiz/generate" element={<GenerateQuiz />} />
                    <Route path="/couple-quiz/view" element={<ViewQuiz />} />
                    
                    {/* These are the other pages that will be rendered inside the <Outlet /> */}
                    {/* <Route path="favorites" element={<Favorites />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="settings" element={<Settings />} /> */}
                    
                    {/* Optional: Add a catch-all for 404 pages */}
                    <Route path="*" element={<div className="text-center pt-20 text-xl">404: Page Not Found</div>} />
                
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;