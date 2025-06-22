"use client"

import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export const WelcomeMsg = () => {
    const {user, isLoaded} = useUser();
    const [isMounted, setIsMounted] = useState(false);
    
    // Set mounted state after client-side hydration is complete
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    // Show a loading state with the same structure during SSR and initial client render
    // This ensures consistent rendering between server and client
    if (!isMounted || !isLoaded) {
        return (
            <div className="space-y-3 mb-6">
                <h2 className="text-2xl lg:text-4xl text-white font-medium">
                    <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                        Welcome Back
                    </span>
                    <span className="inline-block ml-1">💸</span>
                </h2>
                <p className="text-sm lg:text-base text-[#d4f2ec] font-medium tracking-wide">
                    <span className="bg-gradient-to-r from-[#d4f2ec] to-[#d4f2ec]/80 bg-clip-text text-transparent">
                        This is your Expense Overview Report 
                    </span>
                    <span className="inline-block ml-1 opacity-80">📊</span>
                </p>
                <div className="text-xs lg:text-sm text-[#d4f2ec]/70 font-medium">
                    Track your spending, monitor your savings, and achieve your financial goals.
                </div>
            </div>
        );
    }
    
    // After mounting and data is loaded, render with animations
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3 mb-6"
        >
            <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl lg:text-4xl text-white font-medium"
            >
                <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                    Welcome Back{user?.firstName ? `, ${user.firstName}` : ""}
                </span>
                <span className="inline-block animate-bounce-subtle ml-1">💸</span>
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-sm lg:text-base text-[#d4f2ec] font-medium tracking-wide"
            >
                <span className="bg-gradient-to-r from-[#d4f2ec] to-[#d4f2ec]/80 bg-clip-text text-transparent">
                    This is your Expense Overview Report 
                </span>
                <span className="inline-block ml-1 opacity-80">📊</span>
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-xs lg:text-sm text-[#d4f2ec]/70 font-medium"
            >
                Track your spending, monitor your savings, and achieve your financial goals.
            </motion.div>
        </motion.div>
    )
};
