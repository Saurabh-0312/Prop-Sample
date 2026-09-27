export type TraderCity = {
  city: string;
  country: string;
  location: [number, number];
  weight: number;
};

/** Marker coordinates for trader cities shown on the globe. */
export const TRADER_CITIES: TraderCity[] = [
  { city: "Dubai", country: "AE", location: [25.2048, 55.2708], weight: 1 },
  { city: "London", country: "GB", location: [51.5072, -0.1276], weight: 0.9 },
  { city: "Lagos", country: "NG", location: [6.5244, 3.3792], weight: 0.85 },
  { city: "Mumbai", country: "IN", location: [19.076, 72.8777], weight: 0.9 },
  { city: "Singapore", country: "SG", location: [1.3521, 103.8198], weight: 0.7 },
  { city: "New York", country: "US", location: [40.7128, -74.006], weight: 0.8 },
  { city: "São Paulo", country: "BR", location: [-23.5558, -46.6396], weight: 0.75 },
  { city: "Johannesburg", country: "ZA", location: [-26.2041, 28.0473], weight: 0.6 },
  { city: "Kuala Lumpur", country: "MY", location: [3.139, 101.6869], weight: 0.6 },
  { city: "Istanbul", country: "TR", location: [41.0082, 28.9784], weight: 0.65 },
  { city: "Madrid", country: "ES", location: [40.4168, -3.7038], weight: 0.55 },
  { city: "Frankfurt", country: "DE", location: [50.1109, 8.6821], weight: 0.55 },
  { city: "Toronto", country: "CA", location: [43.6532, -79.3832], weight: 0.5 },
  { city: "Mexico City", country: "MX", location: [19.4326, -99.1332], weight: 0.55 },
  { city: "Nairobi", country: "KE", location: [-1.2921, 36.8219], weight: 0.5 },
  { city: "Karachi", country: "PK", location: [24.8607, 67.0011], weight: 0.6 },
  { city: "Manila", country: "PH", location: [14.5995, 120.9842], weight: 0.5 },
  { city: "Sydney", country: "AU", location: [-33.8688, 151.2093], weight: 0.5 },
  { city: "Tokyo", country: "JP", location: [35.6762, 139.6503], weight: 0.5 },
  { city: "Riyadh", country: "SA", location: [24.7136, 46.6753], weight: 0.6 },
  { city: "Warsaw", country: "PL", location: [52.2297, 21.0122], weight: 0.45 },
  { city: "Bogotá", country: "CO", location: [4.711, -74.0721], weight: 0.45 },
];

export const TOP_COUNTRIES = [
  { code: "AE", name: "UAE", share: 0.11 },
  { code: "NG", name: "Nigeria", share: 0.09 },
  { code: "IN", name: "India", share: 0.09 },
  { code: "GB", name: "United Kingdom", share: 0.07 },
  { code: "BR", name: "Brazil", share: 0.06 },
];
