import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';

const MainLayout = () => {
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
        </div>
    );
};

export default MainLayout;
