'use client';

import { useState } from 'react';
import styles from './QuestionComponent.module.css';

interface QuestionComponentProps {
    onCorrectAnswer: () => void;
}

export default function QuestionComponent({ onCorrectAnswer }: QuestionComponentProps) {
    const [answer, setAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [showError, setShowError] = useState(false);

    const correctAnswer = 1.86e-3;
    const tolerance = 0.05; // 5% tolerance

    const normalizeInput = (input: string): number => {
        // Remove spaces and convert to lowercase
        input = input.replace(/\s+/g, '').toLowerCase();
        
        // Handle scientific notation with x10^ format
        input = input.replace(/x10\^/g, 'e');
        
        return parseFloat(input);
    };

    const checkAnswer = () => {
        const numericAnswer = normalizeInput(answer);
        if (isNaN(numericAnswer)) {
            setShowError(true);
            return;
        }

        const percentDifference = Math.abs(numericAnswer - correctAnswer) / correctAnswer;
        if (percentDifference <= tolerance) {
            setIsCorrect(true);
            setShowError(false);
            onCorrectAnswer();
        } else {
            setShowError(true);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.banner}>Solve the Question to Earn the Letter</h1>
            <div className={styles.questionBox}>
                <p>A flask is filled with 1.59 L (L = litre) of a liquid at 97.2°C. When the liquid is cooled to 16.1°C, its
                volume is only 1.35 L, however. Neglect the contraction of the flask. What is the coefficient of volume
                expansion of the liquid?</p>
                <p className={styles.hint}>Express your answer in decimal or scientific notation (e.g., 5.96E-5, 0.0000596)</p>
            </div>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => {
                        setAnswer(e.target.value);
                        setShowError(false);
                    }}
                    placeholder="Enter your answer..."
                    className={`${styles.input} ${showError ? styles.error : ''}`}
                />
                <button 
                    onClick={checkAnswer}
                    className={styles.submitButton}
                    disabled={isCorrect}
                >
                    Submit
                </button>
            </div>
            {showError && (
                <p className={styles.errorMessage}>
                    Incorrect answer. Please try again.
                </p>
            )}
        </div>
    );
} 