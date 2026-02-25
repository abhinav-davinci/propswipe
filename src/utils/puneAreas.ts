export interface PuneArea {
  name: string;
  slug: string;
  zone: 'east' | 'west' | 'north' | 'south' | 'central' | 'pcmc';
}

export const puneAreas: PuneArea[] = [
  // East Pune
  { name: 'Kharadi', slug: 'kharadi', zone: 'east' },
  { name: 'Viman Nagar', slug: 'viman-nagar', zone: 'east' },
  { name: 'Hadapsar', slug: 'hadapsar', zone: 'east' },
  { name: 'Magarpatta', slug: 'magarpatta', zone: 'east' },
  { name: 'Koregaon Park', slug: 'koregaon-park', zone: 'east' },
  { name: 'Kalyani Nagar', slug: 'kalyani-nagar', zone: 'east' },
  { name: 'Wagholi', slug: 'wagholi', zone: 'east' },
  { name: 'Mundhwa', slug: 'mundhwa', zone: 'east' },

  // West Pune
  { name: 'Baner', slug: 'baner', zone: 'west' },
  { name: 'Balewadi', slug: 'balewadi', zone: 'west' },
  { name: 'Wakad', slug: 'wakad', zone: 'west' },
  { name: 'Hinjewadi', slug: 'hinjewadi', zone: 'west' },
  { name: 'Aundh', slug: 'aundh', zone: 'west' },
  { name: 'Pashan', slug: 'pashan', zone: 'west' },
  { name: 'Sus', slug: 'sus', zone: 'west' },
  { name: 'Mahalunge', slug: 'mahalunge', zone: 'west' },

  // South Pune
  { name: 'Sinhagad Road', slug: 'sinhagad-road', zone: 'south' },
  { name: 'Dhayari', slug: 'dhayari', zone: 'south' },
  { name: 'Undri', slug: 'undri', zone: 'south' },
  { name: 'NIBM', slug: 'nibm', zone: 'south' },
  { name: 'Kondhwa', slug: 'kondhwa', zone: 'south' },
  { name: 'Katraj', slug: 'katraj', zone: 'south' },
  { name: 'Bibwewadi', slug: 'bibwewadi', zone: 'south' },

  // North Pune / PCMC
  { name: 'Pimpri-Chinchwad', slug: 'pimpri-chinchwad', zone: 'pcmc' },
  { name: 'Ravet', slug: 'ravet', zone: 'pcmc' },
  { name: 'Tathawade', slug: 'tathawade', zone: 'pcmc' },
  { name: 'Moshi', slug: 'moshi', zone: 'pcmc' },
  { name: 'Charholi', slug: 'charholi', zone: 'pcmc' },

  // Central Pune
  { name: 'Shivaji Nagar', slug: 'shivaji-nagar', zone: 'central' },
  { name: 'Deccan', slug: 'deccan', zone: 'central' },
  { name: 'Camp', slug: 'camp', zone: 'central' },
  { name: 'Kothrud', slug: 'kothrud', zone: 'central' },
];

export const areasByZone = puneAreas.reduce(
  (acc, area) => {
    if (!acc[area.zone]) acc[area.zone] = [];
    acc[area.zone].push(area);
    return acc;
  },
  {} as Record<string, PuneArea[]>
);

export const zoneLabels: Record<string, string> = {
  east: 'East Pune',
  west: 'West Pune',
  south: 'South Pune',
  north: 'North Pune',
  central: 'Central Pune',
  pcmc: 'PCMC',
};
