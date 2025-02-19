'use client';

import { useState } from 'react';
import QuestionComponent from './components/QuestionComponent';
import LetterReveal from './components/LetterReveal';
import styles from './page.module.css';

export default function Ceim1Page() {
    const [showLetter, setShowLetter] = useState(false);

    const handleCorrectAnswer = () => {
        setShowLetter(true);
    };

    return (
        <div className={styles.page}>
            <QuestionComponent onCorrectAnswer={handleCorrectAnswer} />
            <LetterReveal show={showLetter} />
        </div>
    );
}
