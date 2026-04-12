import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';
import CommandPalette from '../components/layout/CommandPalette';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';

const MainLayout = () => {
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const location = useLocation();

    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                    <AnimatePresence mode="wait">
                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>
                    </AnimatePresence>
                </main>
                <RightPanel />
            </div>
            <CommandPalette 
                isOpen={isCommandPaletteOpen} 
                onClose={() => setIsCommandPaletteOpen(false)} 
            />
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 z-[60] w-12 h-12 bg-primary text-white rounded-2xl shadow-orange-glow flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MainLayout;
