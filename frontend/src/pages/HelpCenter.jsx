import { HelpCircle, Search, Mail, Book, MessageSquare, ChevronRight, Globe, Shield } from 'lucide-react';

const HelpCenter = () => {
    const faqs = [
        { q: "How to join a community?", a: "Find your community in the 'Communities' tab and click 'Join'. You can join as many as you like!", icon: HelpCircle },
        { q: "What is Campus Score?", a: "It's your reputation based on contributions. Post useful content and get upvotes to increase it.", icon: Globe },
        { q: "Can I delete my posts?", a: "Yes, click on the three dots (...) menu on your post to find the Delete option.", icon: Shield }
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Search Banner */}
            <div className="py-20 text-center rounded-[3rem] bg-dark-800 border border-white/5 shadow-premium-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-50 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 px-8">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-4">How can we help you?</h1>
                    <div className="max-w-xl mx-auto relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search help articles..." 
                            className="w-full bg-dark-900 border border-white/10 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-black text-white placeholder-gray-600 focus:outline-none focus:ring-8 focus:ring-primary/5 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Knowledge Base", icon: Book, desc: "Detailed guides for students" },
                    { title: "Community Support", icon: Users, desc: "Connect with campus leads" },
                    { title: "Direct Contact", icon: Mail, desc: "24/7 technical support" }
                ].map((item) => (
                    <div key={item.title} className="p-8 rounded-[2.5rem] bg-dark-800 border border-white/5 hover:border-primary/20 transition-all group cursor-pointer shadow-premium">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                            <item.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-white mb-2">{item.title}</h3>
                        <p className="text-gray-500 text-xs font-bold leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 ml-4">
                    <MessageSquare className="w-6 h-6 text-primary" /> Common Questions
                </h2>
                <div className="space-y-3">
                    {faqs.map((faq) => (
                        <div key={faq.q} className="p-6 rounded-3xl bg-dark-800 border border-white/5 hover:bg-dark-700/50 transition-all group flex items-start justify-between cursor-pointer shadow-premium">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shrink-0">
                                    <faq.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-sm mb-1">{faq.q}</h4>
                                    <p className="text-gray-500 text-xs font-bold leading-loose">{faq.a}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-primary mt-1 transition-transform group-hover:translate-x-1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Users = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default HelpCenter;
