import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FloatingCTA = ({ onOpenModal, settings }) => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const isHeroVisible = window.scrollY < 600;
            const isAdmin = location.pathname.startsWith('/admin');
            setIsVisible(!isHeroVisible && !isAdmin);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    onClick={onOpenModal}
                    className="fixed bottom-8 right-8 z-[9999] px-8 py-4 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--btn-colored-text)' }}
                >
                    <span className="font-extrabold tracking-tight">
                        {/* Connected to Backend 'FLOATING CTA TEXT' */}
                        {settings?.floating_cta_text || "Let's Talk"}
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default FloatingCTA;
