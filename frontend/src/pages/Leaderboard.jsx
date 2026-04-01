import { useState, useEffect, useCallback } from 'react';
import { getLeaderboard } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Star, TrendingUp, Users, Target, Crown } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';

const Leaderboard = () => {
    const { user: currentUser } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scope, setScope] = useState('global'); // 'global' or 'campus'

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const params = { limit: 10 };
            if (scope === 'campus' && currentUser?.college) {
                params.college = currentUser.college;
            }
            const response = await getLeaderboard(params);
            setLeaderboard(response.data.data.leaderboard);
        } catch (error) {
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    }, [scope, currentUser?.college]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const TopThree = () => {
        const top3 = leaderboard.slice(0, 3);
        // Reorder for CSS podium layout (2, 1, 3)
        const podium = [top3[1], top3[0], top3[2]].filter(u => u !== undefined);

        return (
            <div className="flex justify-center items-end gap-2 md:gap-8 min-h-[300px] mb-12 px-4">
                {podium.map((user, idx) => {
                    const isWinner = leaderboard[0]?._id === user._id;
                    const isSecond = leaderboard[1]?._id === user._id;
                    const isThird = leaderboard[2]?._id === user._id;

                    return (
                        <div 
                            key={user._id} 
                            className={clsx(
                                "flex flex-col items-center group relative",
                                isWinner ? "z-10" : "z-0"
                            )}
                        >
                            <div className="relative mb-4">
                                <div className={clsx(
                                    "p-1 rounded-full transition-all duration-500 group-hover:scale-110",
                                    isWinner ? "bg-gradient-to-tr from-yellow-400 to-amber-600 shadow-[0_0_30px_-5px_rgba(251,191,36,0.5)]" :
                                    isSecond ? "bg-gradient-to-tr from-gray-300 to-slate-500" :
                                    "bg-gradient-to-tr from-orange-400 to-amber-700"
                                )}>
                                    <Avatar 
                                        src={user.avatar} 
                                        size={isWinner ? "xl" : "lg"} 
                                        className="border-4 border-dark-900"
                                    />
                                </div>
                                {isWinner && (
                                    <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-400 drop-shadow-lg animate-bounce" />
                                )}
                                <div className={clsx(
                                    "absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-dark-900",
                                    isWinner ? "bg-yellow-400 text-dark-900" :
                                    isSecond ? "bg-gray-300 text-dark-900" :
                                    "bg-orange-400 text-dark-900"
                                )}>
                                    {isWinner ? 1 : isSecond ? 2 : 3}
                                </div>
                            </div>

                            <div className={clsx(
                                "text-center space-y-1 bg-dark-800/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl w-28 md:w-40 transition-all duration-500",
                                isWinner ? "h-36 shadow-premium group-hover:bg-dark-700/60" : 
                                isSecond ? "h-28" : "h-24"
                            )}>
                                <p className="text-xs font-black text-white truncate max-w-full px-2">{user.name}</p>
                                <p className="text-[10px] font-bold text-gray-500 truncate px-2">{user.college}</p>
                                <div className="mt-2 flex items-center justify-center gap-1">
                                    <Star className={clsx("w-3 h-3", isWinner ? "text-yellow-400" : "text-gray-400")} />
                                    <span className="text-[11px] font-black text-primary">{user.campusScore}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-20 max-w-4xl mx-auto">
            {/* Header / Tabs */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full border border-primary/5 text-primary">
                    <Trophy className="w-5 h-5" />
                    <span className="text-sm font-black uppercase tracking-widest">Global Rankings</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">Campus Champions</h1>
                <p className="text-gray-500 font-medium max-w-md mx-auto">
                    The elite of CollegeConnect. Earn points by posting, commenting, and contributing to the community.
                </p>
                
                <div className="flex items-center justify-center p-1.5 bg-dark-800/40 backdrop-blur-md border border-white/5 rounded-3xl w-fit mx-auto mt-8">
                    <button
                        onClick={() => setScope('global')}
                        className={clsx(
                            "px-8 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2",
                            scope === 'global' 
                                ? "bg-white/10 text-white shadow-premium border border-white/5" 
                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        )}
                    >
                        <Star className="w-4 h-4" />
                        Global
                    </button>
                    <button
                        onClick={() => setScope('campus')}
                        className={clsx(
                            "px-8 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2",
                            scope === 'campus' 
                                ? "bg-white/10 text-white shadow-premium border border-white/5" 
                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        My Campus
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : leaderboard.length > 0 ? (
                <>
                    <TopThree />

                    {/* Rankings List */}
                    <div className="bg-dark-800/20 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="divide-y divide-white/5">
                            {leaderboard.slice(3).map((user, idx) => (
                                <div 
                                    key={user._id}
                                    className={clsx(
                                        "p-6 flex items-center justify-between group hover:bg-white/5 transition-all duration-300",
                                        currentUser?._id === user._id && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex items-center gap-6">
                                        <span className="text-lg font-black text-white/20 w-6 group-hover:text-white/40 transition-colors">
                                            {idx + 4}
                                        </span>
                                        <div className="relative">
                                            <Avatar src={user.avatar} size="md" />
                                            {user.role === 'ALUMNI' && (
                                                <div className="absolute -bottom-1 -right-1">
                                                    <Badge variant="alumni" verified className="scale-50 origin-bottom-right" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-sm font-black text-white group-hover:text-primary transition-colors">
                                                {user.name}
                                                {currentUser?._id === user._id && <span className="ml-2 text-[10px] text-primary/60 font-medium">(You)</span>}
                                            </h4>
                                            <span className="text-[11px] font-medium text-gray-500">{user.college}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="text-right mr-4">
                                            <p className="text-sm font-black text-white">{user.campusScore}</p>
                                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Points</p>
                                        </div>
                                        <TrendingUp className="w-4 h-4 text-emerald-500/50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="py-20 text-center bg-dark-800/20 border-2 border-dashed border-white/5 rounded-[3rem]">
                    <p className="text-gray-500">No data available for this ranking scope.</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
