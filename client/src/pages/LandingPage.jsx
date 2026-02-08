import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Bell,
    ShieldCheck,
    History,
    MessageSquare,
    Zap,
    ArrowRight,
    ChevronDown,
    Monitor,
    Lock,
    Cpu
} from 'lucide-react';
import Navbar from '../components/Landing/Navbar';
import WorkflowSection from '../components/Landing/WorkflowSection';

const LandingPage = () => {
    const navigate = useNavigate();
    const [typedText, setTypedText] = useState('');
    const fullText = "Operations simplified.";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTypedText(fullText.slice(0, i));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <div className="bg-page text-primary min-h-screen font-sans selection:bg-brand-primary selection:text-white">
            <Navbar />
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            x: [0, 50, 0],
                            y: [0, -30, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            x: [0, -60, 0],
                            y: [0, 40, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"
                    />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-4xl mx-auto text-center"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
                        >
                            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                            <span className="text-sm font-medium text-slate-300">SYSTEM STATUS: OPERATIONAL</span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
                        >
                            Range-Based Task & <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-indigo-400">
                                Information System
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                        >
                            Secure. Real-time. Operational. <br />
                            <span className="text-indigo-400 font-mono inline-block min-h-[1.5em]">{typedText}<span className="animate-pulse">|</span></span>
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <button
                                onClick={() => navigate('/login')}
                                className="group relative px-8 py-4 bg-brand-primary text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-2 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                Access System
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            {/* <button className="px-8 py-4 bg-white/5 text-white rounded-xl font-semibold border border-white/10 hover:bg-white/10 transition-colors">
                                View Protocols
                            </button> */}
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 flex flex-col items-center gap-2"
                >
                    <span className="text-xs uppercase tracking-widest">Discover</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <ChevronDown size={24} />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-page relative">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Capabilities</h2>
                        <div className="w-20 h-1 bg-brand-primary mx-auto rounded-full" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Bell size={24} />}
                            title="Real-Time Notifications"
                            description="Instant alerts across all active ranges for critical task updates."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<ShieldCheck size={24} />}
                            title="Range-Level Access"
                            description="Strict permission boundaries ensuring data is only visible to authorized personnel."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<History size={24} />}
                            title="Admin Oversight & Logs"
                            description="Complete audit trails and activity monitoring for operational transparency."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={<MessageSquare size={24} />}
                            title="Structured Internal Flow"
                            description="Organized communication channels tailored for office range structures."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <WorkflowSection id="workflow" />

            {/* Security Protocol */}
            <section id="security" className="py-24 bg-page border-t border-border-color">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto rounded-3xl p-8 md:p-12 bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck size={200} />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-8">Security Protocol</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <SecurityFeature title="JWT Authentication" desc="Encrypted stateless tokens for session management." />
                                <SecurityFeature title="Activity Tracking" desc="Comprehensive device-level logs for every interaction." />
                                <SecurityFeature title="Controlled Access" desc="Tiered permissions based on office range structure." />
                                <SecurityFeature title="Internal Only" desc="Optimized for isolated enterprise deployments." />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border-color bg-page">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <ShieldCheck className="text-brand-primary" />
                        <span className="font-bold text-lg">Range System</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4">
                        Version 1.0.0 | System ID: OPS-HQ-2026
                    </p>
                    <div className="inline-block px-4 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm border border-red-500/20">
                        Internal Use Only - Authorized Personnel Access Required
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -8 }}
        className="group p-8 bg-card border border-border-color rounded-2xl hover:border-brand-primary/50 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] cursor-default"
    >
        <div className="w-12 h-12 bg-brand-light dark:bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-lg font-bold mb-3 group-hover:text-brand-primary transition-colors">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </motion.div>
);



const SecurityFeature = ({ title, desc }) => (
    <div className="flex gap-4">
        <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 shrink-0" />
        <div>
            <div className="font-bold text-slate-200 mb-1">{title}</div>
            <div className="text-sm text-slate-400">{desc}</div>
        </div>
    </div>
);

export default LandingPage;
