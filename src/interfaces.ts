export interface Trip {
  fromLine: string;
  toLine: string;
  dateTime: string;
}

export interface Fare {
  isPeak: boolean;
  fare: number;
}

export interface CalculatedFareTrip extends Trip {
  fromLine: string;
  toLine: string;
  dateTime: string;
  isPeak: boolean;
  fare: number;
}

export interface DailyFare {
  totalFare: number;
  fareCap: number;
  totalFareSavings: number;
  finalFare: number;
  numberOfTrips?: number;
}

export interface WeeklyFare {
  totalFare: number;
  fareCap: number;
  totalFareSavings: number;
  finalFare: number;
  numberOfTrips?: number;
}
