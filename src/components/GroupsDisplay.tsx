import { DrawConfig } from '../types';
import './GroupsDisplay.css';


export function GroupsDisplay({ config }: { config: DrawConfig }) {
  const limit = config.category === 15 || config.category === 12 ? 1 : 4;
  return (
    <div className="groups-display-overlay">
      <div className="groups-display">
        <h2 className="groups-title">Bolilleros</h2>
        <div className="groups-grid">
          {config.ballCages.slice(0, limit).map((cage, idx) => (
            <div key={idx} className="group-card">
              <h3 className="group-name">{`Bolillero ${limit == 1 ? 'único': idx + 1}`}</h3>
              <div className="group-teams">
                {cage.map((team, index) => (
                  <div key={index} className="group-team-item">
                    {team.name || '—'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
