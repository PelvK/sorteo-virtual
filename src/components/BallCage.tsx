import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import "./BallCage.css";

interface BallCageProps {
  cageNumber: number;
  isActive: boolean;
  currentTeam: string | null;
  onAnimationComplete: () => void;
  backgroundImage?: string;
}

export function BallCage({
  cageNumber,
  isActive,
  currentTeam,
  onAnimationComplete,
  backgroundImage,
}: BallCageProps) {
  const [animationStage, setAnimationStage] = useState<
    "idle" | "spinning" | "opening" | "revealing" | "closing"
  >("idle");

  useEffect(() => {
    if (isActive && currentTeam) {
      setAnimationStage("spinning");
    }
  }, [isActive, currentTeam]);

  /** Etapas */
  const handleSpinComplete = () => {
    setAnimationStage("opening");
  };

  const handleOpenComplete = () => {
    setAnimationStage("revealing");
  };

  const handleRevealComplete = async () => {
    await new Promise((r) => setTimeout(r, 2000)); // tiempo visible del reveal
    setAnimationStage("closing");
  };

  const handleCloseComplete = () => {
    setAnimationStage("idle");
    onAnimationComplete();
  };

  /** Animación de spin con aceleración/desaceleración */
  const spinSequence = {
    rotate: 1440*2,
    transition: {
      duration: 3.2,
      ease: "easeInOut", // acelera al inicio, desacelera al final
    },
  };

  /** Opacidad del título (fade out en open, fade in al cerrar) */
  const labelOpacity =
    animationStage === "opening" || animationStage === "revealing" ? 0 : 1;

  return (
    <div className="ball-cage-container">
      {/* fade del título */}
      <motion.div
        className="cage-label"
        animate={{ opacity: labelOpacity }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        Bolillero {cageNumber}
      </motion.div>

      <div className="ball-cage">
        <AnimatePresence mode="wait">
          {animationStage === "idle" && (
            <motion.div
              key="idle"
              className="cage-circle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="cage-inner">
{/*                 <span className="cage-number">{cageNumber}</span>
 */}              </div>
            </motion.div>
          )}

          {animationStage === "spinning" && (
            <motion.div
              key="spinning"
              className="cage-circle"
              initial={{ rotate: 0 }}
              animate={spinSequence}
              onAnimationComplete={handleSpinComplete}
              style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="cage-inner">
{/*                 <span className="cage-number">{cageNumber}</span>
 */}              </div>
            </motion.div>
          )}

          {(animationStage === "opening" ||
            animationStage === "revealing" ||
            animationStage === "closing") && (
            <div key="split" className="cage-split">
              {/* Mitad superior */}
              <motion.div
                className="cage-half cage-top"
                initial={{ y: 0 }}
                animate={{
                  y:
                    animationStage === "opening"
                      ? -40
                      : animationStage === "closing"
                      ? 0
                      : -40,
                }}
                style={{
                  backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                  backgroundSize: '160px 160px', // mismo tamaño que la bola completa
                  backgroundPosition: 'center top',
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                onAnimationComplete={
                  animationStage === "opening"
                    ? handleOpenComplete
                    : animationStage === "closing"
                    ? handleCloseComplete
                    : undefined
                }
              >
{/*                 <div className="cage-inner-half-top"></div>
 */}              </motion.div>

              {/* Mitad inferior */}
              <motion.div
                className="cage-half cage-bottom"
                initial={{ y: 0 }}
                animate={{
                  y:
                    animationStage === "opening"
                      ? 40
                      : animationStage === "closing"
                      ? 0
                      : 40,
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{
                  backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                  backgroundSize: '160px 160px', // mismo tamaño que la bola completa
                  backgroundPosition: 'center bottom',
                }}
              >
{/*                 <div className="cage-inner-half-bottom"></div>
 */}              </motion.div>

              {/* Reveal del equipo */}
              {animationStage === "revealing" && currentTeam && (
                <motion.div
                  key="reveal"
                  className="team-reveal"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  onAnimationComplete={handleRevealComplete}
                >
                  {currentTeam}
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
