import { motion } from 'framer-motion';
import './ZoneCard.css';

interface ZoneCardProps {
  zoneName: string;
  teams: (string | null)[];
}

export function ZoneCard({ zoneName, teams }: ZoneCardProps) {
  return (
    <div className="zone-card">
      <h2 className="zone-card-title">{zoneName}</h2>
      <div className="zone-card-rows">
        {teams.map((team, index) => (
          <div key={index} className="zone-card-row">
            {team ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="team-name"
              >
                {team}
              </motion.div>
            ) : (
              <div className="empty-slot"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
