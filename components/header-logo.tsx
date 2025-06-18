"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export const HeaderLogo = () => {
    return (
        <Link 
            href="/" 
            className="outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-lg"
        >
            <motion.div 
                className="items-center hidden lg:flex group" 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Image 
                        src="/currency.svg" 
                        width={42} 
                        height={42} 
                        alt="logo"
                        className="relative transform group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="ml-3">
                    <p className="font-bold text-2xl tracking-tight">
                        <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent group-hover:to-white/100 transition-all duration-300">
                            Expense Manager
                        </span>
                    </p>
                    <span className="text-[10px] text-white/70 font-medium tracking-widest uppercase">
                        Your Financial Assistant
                    </span>
                </div>
            </motion.div>
        </Link>
    );
};
