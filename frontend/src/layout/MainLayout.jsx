import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';
import CommandPalette from '../components/layout/CommandPalette';

const MainLayout = () => {
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen bg-dark-900 text-gray-300 font-sans">
            <Navbar />
            <div className="max-w-[1600px] mx-auto flex justify-center">
                <LeftSidebar />
                <main className="flex-1 max-w-2xl w-full px-0 md:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
                    <Outlet />
                </main>
                <RightPanel />
            </div>
            <CommandPalette 
                isOpen={isCommandPaletteOpen} 
                onClose={() => setIsCommandPaletteOpen(false)} 
            />
        </div>
    );
};

export default MainLayout;
