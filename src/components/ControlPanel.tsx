import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Team, DrawConfig } from '../types';
import './ControlPanel.css';

interface ControlPanelProps {
  config: DrawConfig;
  onConfigChange: (config: DrawConfig) => void;
  onStartDraw: () => void;
  onReset: () => void;
  isDrawing: boolean;
}

export function ControlPanel({
  config,
  onConfigChange,
  onStartDraw,
  onReset,
  isDrawing,
}: ControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [numZones, setNumZones] = useState(config.numZones);

  const handleNumZonesChange = (value: number) => {
    if (value >= 4 && value <= 8) {
      setNumZones(value);
      onConfigChange({ ...config, numZones: value });
    }
  };

  const handleAddTeam = (cageIndex: number) => {
    const teamName = prompt('Nombre del equipo:');
    if (teamName && teamName.trim()) {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: teamName.trim(),
        ballCage: cageIndex + 1,
      };

      const newBallCages = [...config.ballCages];
      newBallCages[cageIndex] = [...newBallCages[cageIndex], newTeam];

      const newDrawOrder = [...config.drawOrder, newTeam.id];

      onConfigChange({
        ...config,
        ballCages: newBallCages,
        drawOrder: newDrawOrder,
      });
    }
  };

  const handleRemoveTeam = (cageIndex: number, teamIndex: number) => {
    const newBallCages = [...config.ballCages];
    const removedTeam = newBallCages[cageIndex][teamIndex];
    newBallCages[cageIndex] = newBallCages[cageIndex].filter((_, i) => i !== teamIndex);

    const newDrawOrder = config.drawOrder.filter(id => id !== removedTeam.id);

    onConfigChange({
      ...config,
      ballCages: newBallCages,
      drawOrder: newDrawOrder,
    });
  };

  const moveTeamInDrawOrder = (teamId: string, direction: 'up' | 'down') => {
    const currentIndex = config.drawOrder.indexOf(teamId);
    if (currentIndex === -1) return;

    const newDrawOrder = [...config.drawOrder];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newDrawOrder.length) {
      [newDrawOrder[currentIndex], newDrawOrder[targetIndex]] =
      [newDrawOrder[targetIndex], newDrawOrder[currentIndex]];

      onConfigChange({ ...config, drawOrder: newDrawOrder });
    }
  };

  const getAllTeams = () => {
    return config.ballCages.flat();
  };

  return (
    <>
      <button
        className="control-toggle"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDrawing}
      >
        <Settings size={24} />
        <span>Configuración</span>
      </button>

      {isOpen && (
        <div className="control-panel-overlay" onClick={() => setIsOpen(false)}>
          <div className="control-panel" onClick={(e) => e.stopPropagation()}>
            <div className="control-panel-header">
              <h2>Configuración del Sorteo</h2>
              <button className="close-button" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>

            <div className="control-panel-content">
              <section className="config-section">
                <h3>Número de Zonas</h3>
                <div className="zone-selector">
                  <input
                    type="number"
                    min="4"
                    max="8"
                    value={numZones}
                    onChange={(e) => handleNumZonesChange(parseInt(e.target.value))}
                    disabled={isDrawing}
                  />
                  <span className="zone-info">Entre 4 y 8 zonas</span>
                </div>
              </section>

              <section className="config-section">
                <h3>Equipos por Bolillero</h3>
                <div className="ball-cages-config">
                  {config.ballCages.map((cage, cageIndex) => (
                    <div key={cageIndex} className="cage-config">
                      <h4>Bolillero {cageIndex + 1}</h4>
                      <div className="teams-list">
                        {cage.map((team, teamIndex) => (
                          <div key={team.id} className="team-item">
                            <span>{team.name}</span>
                            <button
                              onClick={() => handleRemoveTeam(cageIndex, teamIndex)}
                              disabled={isDrawing}
                              className="remove-button"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddTeam(cageIndex)}
                          disabled={isDrawing}
                          className="add-team-button"
                        >
                          + Agregar Equipo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="config-section">
                <h3>Orden de Sorteo</h3>
                <div className="draw-order-list">
                  {config.drawOrder.map((teamId, index) => {
                    const team = getAllTeams().find(t => t.id === teamId);
                    if (!team) return null;

                    return (
                      <div key={teamId} className="draw-order-item">
                        <span className="order-number">{index + 1}</span>
                        <span className="team-name-order">{team.name}</span>
                        <span className="cage-badge">B{team.ballCage}</span>
                        <div className="order-controls">
                          <button
                            onClick={() => moveTeamInDrawOrder(teamId, 'up')}
                            disabled={index === 0 || isDrawing}
                            className="order-button"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveTeamInDrawOrder(teamId, 'down')}
                            disabled={index === config.drawOrder.length - 1 || isDrawing}
                            className="order-button"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="control-actions">
                <button
                  onClick={onStartDraw}
                  disabled={isDrawing || config.drawOrder.length === 0}
                  className="start-button"
                >
                  {isDrawing ? 'Sorteando...' : 'Iniciar Sorteo'}
                </button>
                <button
                  onClick={onReset}
                  disabled={isDrawing}
                  className="reset-button"
                >
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
