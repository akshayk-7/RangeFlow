import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Zap } from 'lucide-react';

const WorkflowSection = ({ id }) => {
    const steps = [
        {
            id: '01',
            title: 'Range Configuration',
            description: 'Administrators define operational ranges and assign granular personnel access levels via the secure dashboard.',
            icon: <Settings className="w-6 h-6" />,
            color: 'from-blue-500 to-cyan-400'
        },
        {
            id: '02',
            title: 'Secure Authentication',
            description: 'Personnel access the system through encrypted, device-locked login protocols ensuring total environment control.',
            icon: <Shield className="w-6 h-6" />,
            color: 'from-indigo-500 to-purple-400'
        },
        {
            id: '03',
            title: 'Real-Time Execution',
            description: 'Tasks and intelligence are synchronized instantly across all active ranges via low-latency WebSocket connections.',
            icon: <Zap className="w-6 h-6" />,
            color: 'from-fuchsia-500 to-rose-400'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <section id={id} className="py-24 bg-slate-900 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Operational Workflow</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        A streamlined, secure process designed for high-efficiency range management.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            variants={cardVariants}
                            whileHover={{ y: -8 }}
                            className="group relative p-8 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
                        >
                            {/* Hover Gradient Border Effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-10 text-white shadow-lg`}>
                                        {step.icon}
                                    </div>
                                    <span className="text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors duration-300 font-mono">
                                        {step.id}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">
                                    {step.title}
                                </h3>

                                <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default WorkflowSection;
