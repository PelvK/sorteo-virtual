import { ZoneCard } from './ZoneCard';
import { Zone } from '../types';
import './ZoneGrid.css';

interface ZoneGridProps {
  zones: Zone[];
}

export function ZoneGrid({ zones }: ZoneGridProps) {
  return (
    <div className="zone-grid">
      {zones.map((zone) => (
        <ZoneCard key={zone.id} zoneName={zone.name} teams={zone.teams} />
      ))}
    </div>
  );
}
