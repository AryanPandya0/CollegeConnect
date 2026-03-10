import { TrendingUp, Calendar } from 'lucide-react';

const RightPanel = () => {
    return (
        <aside className="hidden xl:block w-80 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto py-4 pl-4 custom-scrollbar">

            {/* Trending Communities */}
            <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden mb-4">
                <div className="p-3 bg-dark-700/50 border-b border-dark-600">
                    <h3 className="text-sm font-bold text-gray-300">Trending Communities</h3>
                </div>
                <div className="p-3 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">
                                    r/{i}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-300">r/TechClub</span>
                                    <span className="text-xs text-gray-500">1.2k members</span>
                                </div>
                            </div>
                            <button className="px-3 py-1 bg-dark-700 rounded-full text-xs font-bold text-gray-300 hover:bg-dark-600">Join</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden">
                <div className="p-3 bg-dark-700/50 border-b border-dark-600 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-300">Upcoming Events</h3>
                    <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <div className="p-3 space-y-3">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-dark-700 rounded-lg flex flex-col items-center justify-center border border-dark-600">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Feb</span>
                            <span className="text-sm font-bold text-gray-300">22</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-300 line-clamp-1">Hackathon Opening Ceremony</p>
                            <p className="text-xs text-gray-500">Main Auditorium • 10:00 AM</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-dark-700 rounded-lg flex flex-col items-center justify-center border border-dark-600">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Feb</span>
                            <span className="text-sm font-bold text-gray-300">24</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-300 line-clamp-1">Career Fair 2026</p>
                            <p className="text-xs text-gray-500">Campus Ground • 9:00 AM</p>
                        </div>
                    </div>
                </div>
            </div>

        </aside>
    );
};

export default RightPanel;
