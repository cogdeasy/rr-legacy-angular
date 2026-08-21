export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  baseLocation: string;
  authorityLevel: string;
  lastLogin: string;
  employeeSince: string;
  fleetsCovered: string[];
}

export interface UserPreferences {
  alertEmails: boolean;
  dailyFleetDigest: boolean;
  aogPager: boolean;
  egtMarginThreshold: number;
  defaultFleet: string;
}
