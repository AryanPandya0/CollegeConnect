import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-dark-900 flex flex-col">
            <div className="p-4">
                <Link to="/" className="flex items-center gap-2 text-gray-300 font-bold text-xl">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                        C
                    </div>
                    CollegeConnect
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <Outlet />
            </div>

            <footer className="p-4 text-center text-xs text-gray-500">
                &copy; {new Date().getFullYear()} CollegeConnect. All rights reserved.
            </footer>
        </div>
    );
};

export default AuthLayout;
