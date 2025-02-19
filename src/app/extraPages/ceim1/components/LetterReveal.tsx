'use client';

import { useEffect, useState } from 'react';
import styles from './LetterReveal.module.css';

interface LetterRevealProps {
    show: boolean;
}

export default function LetterReveal({ show }: LetterRevealProps) {
    const [isFlashing, setIsFlashing] = useState(false);

    useEffect(() => {
        if (show) {
            const flashInterval = setInterval(() => {
                setIsFlashing(prev => !prev);
            }, 500); // Flash every 500ms

            return () => clearInterval(flashInterval);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className={`${styles.letterContainer} ${styles.slideIn}`}>
            <h1 className={styles.banner}>The Letter is...</h1>  
            <div className={`${styles.letter} ${isFlashing ? styles.flash : ''}`}>
                W
            </div>
        </div>
    );
} 