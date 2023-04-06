const fs = require('fs');
const csv = require('fast-csv');
import { fareMatrix, peakHours, fareCapMatrix } from './fares-config';
import { CalculatedFareTrip, DailyFare, Fare, WeeklyFare } from './interfaces';

/**
 * Returns the week number for this date.  dowOffset is the day of week the week
 * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
 * the week returned is the ISO 8601 week number.
 * @param int dowOffset
 * @return int
 */
/* istanbul ignore next */
Date.prototype.getWeek = function (dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

  dowOffset = typeof dowOffset == 'number' ? dowOffset : 0; //default dowOffset to zero
  const newYear = new Date(this.getFullYear(), 0, 1);
  let day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = day >= 0 ? day : day + 7;
  const daynum = Math.floor((this.getTime() - newYear.getTime() - (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
  let weeknum;
  //if the year starts before the middle of a week
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      const nYear = new Date(this.getFullYear() + 1, 0, 1);
      let nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
                the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  } else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  return weeknum;
};

// Create a custom SingaMetroAuthorityError exception object
export class SingaMetroAuthorityError extends Error {}

export default class SingaMetroAuthority {
  fareMatrix: object;
  peakHours: object;
  fareCapMatrix: object;

  constructor(fareMatrix: object, peakHours: object, fareCapMatrix: object) {
    this.fareMatrix = fareMatrix;
    this.peakHours = peakHours;
    this.fareCapMatrix = fareCapMatrix;
  }

  /**
   * Define a function to check the given time if it's in the range of peak hours or not
   * @param time string
   * @param startTime string
   * @param endTime string
   * @returns boolean
   */
  isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    const [hours, minutes] = time.split(':').map(parseFloat);

    // convert time to minutes
    const timeInMinutes = hours * 60 + minutes;
    const [startHours, startMinutes] = startTime.split(':').map(parseFloat);

    // convert start time to minutes
    const startInMinutes = startHours * 60 + startMinutes;
    const [endHours, endMinutes] = endTime.split(':').map(parseFloat);

    // convert end time to minutes
    const endInMinutes = endHours * 60 + endMinutes;

    // check if the time is between the start and end times of the range
    if (startInMinutes <= timeInMinutes && timeInMinutes <= endInMinutes) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Define a function to calculate the fare for a given fromLine, toLine, and dateTime
   * @param fromLine string
   * @param toLine string
   * @param dateTime Date
   * @returns Fare
   */
  calculateFare(fromLine: string, toLine: string, dateTime: Date): Fare {
    try {
      const dayOfWeek = dateTime.getDay();
      const hours = dateTime.getHours();
      const minutes = dateTime.getMinutes();

      const fare = fareMatrix[fromLine][toLine];

      const getPeakSchedule = peakHours[dayOfWeek];

      const isPeakHour =
        this.isTimeInRange(`${hours}:${minutes}`, getPeakSchedule.startTime, getPeakSchedule.endTime) ||
        this.isTimeInRange(`${hours}:${minutes}`, getPeakSchedule.startTime2, getPeakSchedule.endTime2);

      return {
        isPeak: isPeakHour ? true : false,
        fare: isPeakHour ? fare.peak : fare.nonPeak
      };
    } catch (e) {
      throw new SingaMetroAuthorityError('There were some issues with the given parameters.');
    }
  }

  /**
   * Define a function that calculates the daily fare by passing CalculatedFareTrip[]
   * @param trips CalculatedFareTrip[]
   * @returns DailyFare
   */
  calculateDailyFare(trips: CalculatedFareTrip[]): DailyFare {
    try {
      let totalFare = 0;
      let fareCap = 0;
      trips.forEach(trip => {
        totalFare += trip.fare;
        fareCap = fareCapMatrix[trip.fromLine][trip.toLine].dailyCap;
      });
      return {
        totalFare,
        fareCap,
        totalFareSavings: totalFare > Math.min(totalFare, fareCap) ? totalFare - Math.min(totalFare, fareCap) : 0,
        finalFare: Math.min(totalFare, fareCap)
      };
    } catch (e) {
      throw new SingaMetroAuthorityError('There were some issues with the given parameters.');
    }
  }

  /**
   * Define the function that calculates the weekly fare
   * @param trips CalculatedFareTrip[]
   * @returns WeeklyFare
   */
  calculateWeeklyFare(trips: CalculatedFareTrip[]): WeeklyFare {
    try {
      let totalFare = 0;
      let fareCap = 0;
      trips.forEach(trip => {
        totalFare += trip.fare;
        fareCap = fareCapMatrix[trip.fromLine][trip.toLine].weeklyCap;
      });
      return {
        totalFare,
        fareCap,
        totalFareSavings: totalFare > Math.min(totalFare, fareCap) ? totalFare - Math.min(totalFare, fareCap) : 0,
        finalFare: Math.min(totalFare, fareCap)
      };
    } catch (e) {
      throw new SingaMetroAuthorityError('There were some issues with the given parameters.');
    }
  }

  /**
   * Define a function that calculate trips in a daily or weekly basis
   * @param trips CalculatedFareTrip[]
   * @param groupBy string
   */
  /* istanbul ignore next */
  async calculate(trips: CalculatedFareTrip[], groupBy: string) {
    let reducedTrips: any;
    switch (groupBy) {
      case 'daily':
        // reconstruct the data and merge trips with same date
        reducedTrips = trips.reduce((accumulator, currentValue) => {
          const date = currentValue.dateTime.split('T')[0];
          const dateWithRoute = `${date}-${currentValue.fromLine}-${currentValue.toLine}`;
          if (!accumulator[dateWithRoute]) {
            accumulator[dateWithRoute] = [];
          }
          accumulator[dateWithRoute].push(currentValue);
          return accumulator;
        }, {});

        if (process.argv[2] === '--debug') {
          console.log('daily raw data::', reducedTrips);
        }

        // loop and calculate daily fare
        for (const key in reducedTrips) {
          if (reducedTrips.hasOwnProperty(key)) {
            const dailyFare: DailyFare = this.calculateDailyFare(reducedTrips[key]);
            dailyFare.numberOfTrips = reducedTrips[key].length;
            if (process.argv[2] === '--debug') {
              console.log(key, dailyFare);
              console.log('finalFare:', dailyFare.finalFare);
            } else {
              console.log('daily (year-month-day-route):', key);
              console.log('finalFare:', dailyFare.finalFare);
            }
          }
        }
        break;
      case 'weekly':
        // reconstruct the data and merge trips with same date
        reducedTrips = trips.reduce((accumulator, currentValue) => {
          const date = new Date(currentValue.dateTime);
          const weekGroup = `${currentValue.dateTime.split('-')[0]}-${date.getWeek()}`;
          const weekGroupWithRoute = `${weekGroup}-${currentValue.fromLine}-${currentValue.toLine}`;
          if (!accumulator[weekGroupWithRoute]) {
            accumulator[weekGroupWithRoute] = [];
          }
          accumulator[weekGroupWithRoute].push(currentValue);
          return accumulator;
        }, {});

        if (process.argv[2] === '--debug') {
          console.log('weekly raw data::', reducedTrips);
        }

        // loop and calculate weekly fare
        for (const key in reducedTrips) {
          if (reducedTrips.hasOwnProperty(key)) {
            const weeklyFare = this.calculateWeeklyFare(reducedTrips[key]);
            weeklyFare.numberOfTrips = reducedTrips[key].length;
            if (process.argv[2] === '--debug') {
              console.log(key, weeklyFare);
              console.log('finalFare:', weeklyFare.finalFare);
            } else {
              console.log('weekly (year-week-route):', key);
              console.log('finalFare:', weeklyFare.finalFare);
            }
          }
        }
        break;
    }
  }
}

/**
 * Created this self-invoking function for running or debugging purposes please see README.md for more information
 */
/* istanbul ignore next */
if (process.argv[2] === '--normal' || process.argv[2] === '--debug') {
  (async () => {
    const data = [];
    const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
    fs.createReadStream('./dataset.csv')
      .pipe(csv.parse())
      .on('error', (error: any) => console.error(error))
      .on('data', (row: any) => data.push(row))
      .on('end', async () => {
        // initial calculation of fare based on number of trips
        const trips: CalculatedFareTrip[] = data.map(d => {
          const fromLine = d[0].trim().toLowerCase();
          const toLine = d[1].trim().toLowerCase();
          const dateTime = d[2].trim();
          const parsedDate = new Date(dateTime);
          const calculatedFare = sma.calculateFare(fromLine, toLine, parsedDate);
          return {
            fromLine,
            toLine,
            dateTime,
            ...calculatedFare
          };
        });

        switch (process.argv[3]) {
          case '--daily':
            await sma.calculate(trips, 'daily');
            break;
          case '--weekly':
            await sma.calculate(trips, 'weekly');
            break;
          default:
            console.log('Invalid option, the app only supports daily or weekly.');
            break;
        }
      });
  })();
}
