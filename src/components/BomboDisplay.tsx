import { Team } from '../types';
import './BomboDisplay.css';

interface BomboDisplayProps {
  ballCages: Team[][];
  drawnTeamIds: string[];
}

export function BomboDisplay({ ballCages, drawnTeamIds }: BomboDisplayProps) {
  return (
    <div className="bombo-display">
      {ballCages.map((cage, index) => (
        <div key={index} className="bombo-section">
          <h3 className="bombo-title">Bombo {index + 1}</h3>
          <div className="bombo-teams">
            {cage.map((team) => (
              <div
                key={team.id}
                className={`bombo-team ${drawnTeamIds.includes(team.id) ? 'drawn' : ''}`}
              >
                {team.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
