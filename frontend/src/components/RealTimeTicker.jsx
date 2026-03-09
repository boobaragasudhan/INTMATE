import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const systemLogs = [
    "SUBJECT [A**** KUMAR] JUST INITIATED BROADCAST TO 14 STARTUPS.",
    "SUBJECT [M**** SINGH] SECURED INTERVIEW CLEARANCE WITH ZOHO CORP.",
    "SUBJECT [P**** REDDY] ARCHIVED DOSSIER INTO GLOBAL MAINFRAME.",
    "TRANSACTION LOG: 850 MAILS DISPATCHED OVER THE LAST 24 HOURS.",
    "SUBJECT [S**** IYER] STATUS UPDATED. INTERNSHIP SECURED AT FRESHWORKS.",
    "NEW CORPORATION DETECTED IN NETWORK: ATHER ENERGY.",
    "GLOBAL COMM LINK ESTABLISHED... MAINTAINING CONNECTION."
];

export const RealTimeTicker = () => {
    const [currentLogId, setCurrentLogId] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLogId(prev => (prev + 1) % systemLogs.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full border-y border-vintage-gray/30 bg-vintage-dark py-3 overflow-hidden relative mb-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentLogId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-vintage-gray whitespace-nowrap px-8 flex items-center justify-center overflow-hidden"
                >
                    <span className="text-white font-bold mr-4 animate-pulse">&gt; LIVE SENSOR FEED:</span>
                    <span className="truncate">{systemLogs[currentLogId]}</span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
