import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    const navLinks = [
        { name: 'Features', id: 'features' },
        { name: 'Workflow', id: 'workflow' },
        { name: 'Security', id: 'security' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-slate-900/60 backdrop-blur-md border-b border-white/10 shadow-sm'
                : 'bg-transparent border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo Section */}
                <div
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors duration-300">
                        <ShieldCheck className="text-white group-hover:text-indigo-400 transition-colors duration-300" size={20} />
                    </div>
                    <span className="font-semibold text-white tracking-tight group-hover:text-indigo-400 transition-colors duration-300">
                        RangeFlow
                    </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={() => scrollToSection(link.id)}
                            className="relative group text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                        </button>
                    ))}
                </div>

                {/* Right Side Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {/* <button
                        className="px-4 py-2 text-sm font-medium text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-300"
                    >
                        Request Access
                    </button> */}
                    <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                        <LogIn size={16} />
                        Login
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
                    >
                        <div className="p-6 space-y-4">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => scrollToSection(link.id)}
                                    className="block w-full text-left py-3 text-slate-300 hover:text-white font-medium border-b border-white/5 hover:border-indigo-500/30 transition-colors"
                                >
                                    {link.name}
                                </button>
                            ))}
                            <div className="pt-4 flex flex-col gap-3">
                                <button className="w-full py-3 text-center text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-all">
                                    Request Access
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                                >
                                    <LogIn size={18} />
                                    Login Portal
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
