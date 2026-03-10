import { Home, TrendingUp, Users, BookOpen, Calendar, HelpCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            clsx(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium mb-1",
                isActive ? "bg-dark-700 text-gray-300" : "text-gray-400 hover:bg-dark-700 hover:text-gray-300"
            )
        }
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </NavLink>
);

const SectionTitle = ({ title }) => (
    <h3 className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
    </h3>
);

const LeftSidebar = () => {
    const { user } = useAuth();

    return (
        <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto border-r border-dark-600 py-4 custom-scrollbar">
            <div className="px-2">
                <NavItem to="/" icon={Home} label="Home" />
                <NavItem to="/popular" icon={TrendingUp} label="Popular" />

                <div className="my-4 border-t border-dark-600" />

                <SectionTitle title="Your Communities" />
                {user?.communities?.length > 0 ? (
                    user.communities.map((community) => (
                        <NavItem
                            key={community._id}
                            to={`/r/${community.name}`}
                            icon={Users}
                            label={community.displayName || community.name}
                        />
                    ))
                ) : (
                    <p className="px-4 py-2 text-sm text-gray-500 italic">No communities joined</p>
                )}

                <SectionTitle title="Discover" />
                <NavItem to="/communities" icon={Users} label="All Communities" />

                <SectionTitle title="Resources" />
                <NavItem to="/events" icon={Calendar} label="Events" />
                <NavItem to="/library" icon={BookOpen} label="Library" />
                <NavItem to="/help" icon={HelpCircle} label="Help Center" />
            </div>
        </aside>
    );
};

export default LeftSidebar;
