import { Home, TrendingUp, Users, BookOpen, Calendar, HelpCircle, Trophy } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold mb-1 group",
                isActive 
                    ? "bg-white/10 text-white shadow-premium border border-white/5" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
            )
        }
    >
        <Icon className={clsx("w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-active:scale-95")} />
        <span className="tracking-wide">{label}</span>
    </NavLink>
);

const SectionTitle = ({ title }) => (
    <h3 className="px-4 mt-8 mb-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
        {title}
    </h3>
);

const LeftSidebar = () => {
    const { user } = useAuth();

    return (
        <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto border-r border-white/5 py-6 px-4 bg-dark-900/50 backdrop-blur-sm">
            <div className="space-y-1">
                <NavItem to="/" icon={Home} label="Home" />
                <NavItem to="/popular" icon={TrendingUp} label="Popular" />

                <div className="my-6 mx-4 border-t border-white/5" />

                <SectionTitle title="Your Communities" />
                <div className="space-y-1">
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
                        <p className="px-4 py-2 text-xs text-gray-500 italic font-medium opacity-60">No communities joined</p>
                    )}
                </div>

                <SectionTitle title="Discover" />
                <NavItem to="/communities" icon={Users} label="All Communities" />

                <SectionTitle title="Resources" />
                <div className="space-y-1">
                    <NavItem to="/events" icon={Calendar} label="Events" />
                    <NavItem to="/library" icon={BookOpen} label="Library" />
                    <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
                    <NavItem to="/help" icon={HelpCircle} label="Help Center" />
                </div>
            </div>
        </aside>
    );
};

export default LeftSidebar;
