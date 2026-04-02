import { Calendar, MapPin, Clock, Star, Bell } from 'lucide-react';
import Button from '../components/ui/Button';

const Events = () => {
    const categories = ['All', 'Workshops', 'Hackathons', 'Seminars', 'Clubs', 'Festivals'];

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative h-[300px] rounded-[3rem] overflow-hidden group shadow-premium-lg border border-white/5">
                <img 
                    src="https://images.unsplash.com/photo-1540575861501-7ad060e39fe1?q=80&w=2070&auto=format&fit=crop" 
                    alt="Campus Events" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Campus Events</h1>
                        <p className="text-gray-300 font-bold max-w-md">Discovery your next big opportunity. From hackathons to cultural fests, everything is here.</p>
                    </div>
                    <Button className="rounded-2xl px-8 flex items-center gap-2 font-black shadow-orange-glow group">
                        <Bell className="w-5 h-5 group-hover:animate-bounce" /> Notify Me
                    </Button>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {categories.map((cat, i) => (
                    <button 
                        key={cat} 
                        className={`px-6 py-2 rounded-2xl whitespace-nowrap text-sm font-black transition-all ${i === 0 ? 'bg-primary text-white shadow-premium' : 'bg-dark-800 border border-white/5 text-gray-500 hover:text-gray-300 hover:bg-dark-700'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Coming Soon Alert */}
            <div className="py-32 text-center bg-dark-800/20 border border-dashed border-dark-600/50 rounded-[3rem] px-8">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 shadow-orange-glow">
                    <Calendar className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Stay Tuned!</h2>
                <p className="text-gray-500 font-bold max-w-sm mx-auto mb-8">We're building a state-of-the-art event management system for your campus. Launching very soon.</p>
                <div className="flex justify-center gap-4">
                    <div className="flex -space-x-3 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <img key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-dark-900" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" />
                        ))}
                    </div>
                    <p className="text-xs font-black text-white/40 uppercase tracking-widest mt-3">800+ students joined waitlist</p>
                </div>
            </div>
        </div>
    );
};

export default Events;
