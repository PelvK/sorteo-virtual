import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import './BallCage.css';

interface BallCageProps {
  cageNumber: number;
  isActive: boolean;
  currentTeam: string | null;
  onAnimationComplete: () => void;
}

export function BallCage({ cageNumber, isActive, currentTeam, onAnimationComplete }: BallCageProps) {
  const [animationStage, setAnimationStage] = useState<'idle' | 'spinning' | 'opening' | 'revealing'>('idle');

  useEffect(() => {
    if (isActive && currentTeam) {
      setAnimationStage('spinning');
    }
  }, [isActive, currentTeam]);

  const handleSpinComplete = () => {
    setAnimationStage('opening');
  };

  const handleOpenComplete = () => {
    setAnimationStage('revealing');
    setTimeout(() => {
      onAnimationComplete();
      setAnimationStage('idle');
    }, 1500);
  };

  return (
    <div className="ball-cage-container">
      <div className="cage-label">Bolillero {cageNumber}</div>

      <div className="ball-cage">
        <AnimatePresence mode="wait">
          {animationStage === 'idle' && (
            <motion.div
              key="idle"
              className="cage-circle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="cage-inner">
                <span className="cage-number">{cageNumber}</span>
              </div>
            </motion.div>
          )}

          {animationStage === 'spinning' && (
            <motion.div
              key="spinning"
              className="cage-circle spinning"
              initial={{ rotate: 0 }}
              animate={{ rotate: 720 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              onAnimationComplete={handleSpinComplete}
            >
              <div className="cage-inner">
                <span className="cage-number">{cageNumber}</span>
              </div>
            </motion.div>
          )}

          {animationStage === 'opening' && (
            <div key="opening" className="cage-split">
              <motion.div
                className="cage-half cage-top"
                initial={{ y: 0 }}
                animate={{ y: -80 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                onAnimationComplete={handleOpenComplete}
              >
                <div className="cage-inner-half"></div>
              </motion.div>
              <motion.div
                className="cage-half cage-bottom"
                initial={{ y: 0 }}
                animate={{ y: 80 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="cage-inner-half"></div>
              </motion.div>
            </div>
          )}

          {animationStage === 'revealing' && currentTeam && (
            <motion.div
              key="revealing"
              className="team-reveal"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {currentTeam}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
