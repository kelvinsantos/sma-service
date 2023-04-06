import SingaMetroAuthority, { SingaMetroAuthorityError } from './app';
import { fareMatrix, peakHours, fareCapMatrix } from './fares-config';

describe('test isTimeInRange function', () => {
  test('should return false if the time given is NOT IN the range of start time and end time', () => {
    const sma = new SingaMetroAuthority(null, null, null);
    expect(sma.isTimeInRange('7:59', '8:00', '10:00')).toBe(false);
  });

  test('should return true if the time given is IN the range of start time and end time', () => {
    const sma = new SingaMetroAuthority(null, null, null);
    expect(sma.isTimeInRange('9:59', '8:00', '10:00')).toBe(true);
  });
});

describe('test calculateFare function', () => {
  test('should return an fare object if the given parameters are valid', () => {
    const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
    const fare = typeof sma.calculateFare('green', 'green', new Date('2021-03-24T07:58:30'));
    expect(fare).toBe('object');
  });

  test('should return a off-peak fare when given an off-peak date', () => {
    const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
    const fare = sma.calculateFare('green', 'green', new Date('2021-03-24T07:58:30'));
    expect(fare).toHaveProperty('isPeak');
    expect(fare).toHaveProperty('fare');
    expect(fare.isPeak).toBe(false);
    expect(fare.fare).toBe(1);
  });

  test('should return a peak fare when given an peak date', () => {
    const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
    const fare = sma.calculateFare('green', 'green', new Date('2021-03-24T08:58:30'));
    expect(fare).toHaveProperty('isPeak');
    expect(fare).toHaveProperty('fare');
    expect(fare.isPeak).toBe(true);
    expect(fare.fare).toBe(2);
  });

  test('should return an exception if the given parameters are invalid', () => {
    try {
      const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
      sma.calculateFare('green', 'violet', new Date('2021-03-24T07:58:30'));
    } catch (e) {
      expect(e).toBeInstanceOf(SingaMetroAuthorityError);
      expect(e.message).toBe('There were some issues with the given parameters.');
    }
  });
});

describe('test calculateDailyFare function', () => {
  const testData = [
    {
      fromLine: 'green',
      toLine: 'green',
      dateTime: '2021-03-24T07:58:30',
      isPeak: false,
      fare: 1,
    },
    {
      fromLine: 'green',
      toLine: 'green',
      dateTime: '2021-03-25T07:58:30',
      isPeak: false,
      fare: 1,
    },
  ];

  test('should return a valid dailyFare object if the given parameters are valid', () => {
    const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
    const dailyFare = typeof sma.calculateDailyFare(testData);
    expect(dailyFare).toBe('object');
  });

  test('should return a finalFare that is equals to totalFare if totalFare is less than or equal fareCap', () => {
    const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
    const dailyFare = sma.calculateDailyFare(testData);
    expect(dailyFare).toEqual({ totalFare: 2, fareCap: 8, totalFareSavings: 0, finalFare: 2 });
    expect(dailyFare.finalFare).toBe(dailyFare.totalFare);
  });

  test('should return a finalFare that is equals to fareCap if the totalFare is greater or equal than fareCap', () => {
    const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
    const dailyFare = sma.calculateDailyFare([
      ...testData,
      {
        fromLine: 'green',
        toLine: 'green',
        dateTime: '2021-03-25T08:58:30',
        isPeak: false,
        fare: 2,
      },
      {
        fromLine: 'green',
        toLine: 'green',
        dateTime: '2021-03-25T08:59:30',
        isPeak: false,
        fare: 2,
      },
      {
        fromLine: 'green',
        toLine: 'green',
        dateTime: '2021-03-25T09:58:30',
        isPeak: false,
        fare: 2,
      },
      {
        fromLine: 'green',
        toLine: 'green',
        dateTime: '2021-03-25T09:59:30',
        isPeak: false,
        fare: 2,
      },
    ]);
    expect(dailyFare).toEqual({ totalFare: 10, fareCap: 8, totalFareSavings: 2, finalFare: 8 });
    expect(dailyFare.finalFare).toBe(dailyFare.fareCap);
  });

  test('should return an exception if the given parameters are invalid', () => {
    try {
      const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
      sma.calculateDailyFare([
        ...testData,
        {
          fromLine: 'green',
          toLine: 'violet', // <- a line that doesn't exist
          dateTime: '2021-03-24T09:58:30',
          isPeak: true,
          fare: 4,
        },
      ]);
    } catch (e) {
      expect(e).toBeInstanceOf(SingaMetroAuthorityError);
      expect(e.message).toBe('There were some issues with the given parameters.');
    }
  });
});

describe('test calculateWeeklyFare function', () => {
  const testData = [
    {
      fromLine: 'red',
      toLine: 'red',
      dateTime: '2021-03-25T11:58:30',
      isPeak: false,
      fare: 2,
    },
    {
      fromLine: 'red',
      toLine: 'red',
      dateTime: '2021-03-26T11:58:30',
      isPeak: false,
      fare: 2,
    },
  ];

  test('should return a valid weeklyFare object if the given parameters are valid', () => {
    const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
    const weeklyFare = typeof sma.calculateWeeklyFare(testData);
    expect(weeklyFare).toBe('object');
  });

  test('should return a finalFare that is equals to totalFare if totalFare is less than or equal fareCap', () => {
    const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
    const weeklyFare = sma.calculateWeeklyFare(testData);
    expect(weeklyFare).toEqual({ totalFare: 4, fareCap: 90, totalFareSavings: 0, finalFare: 4 });
    expect(weeklyFare.finalFare).toBe(weeklyFare.totalFare);
  });

  test('should return a finalFare that is equals to fareCap if the totalFare is greater or equal than fareCap', () => {
    const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
    const weeklyFare = sma.calculateWeeklyFare([
      ...testData,
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:59:30',
        isPeak: false,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
      {
        fromLine: 'red',
        toLine: 'red',
        dateTime: '2021-03-27T11:58:30',
        isPeak: true,
        fare: 3,
      },
    ]);
    expect(weeklyFare).toEqual({ totalFare: 91, fareCap: 90, totalFareSavings: 1, finalFare: 90 });
    expect(weeklyFare.finalFare).toBe(weeklyFare.fareCap);
  });

  test('should return an exception if the given parameters are invalid', () => {
    try {
      const sma = new SingaMetroAuthority(fareMatrix, peakHours, fareCapMatrix);
      sma.calculateWeeklyFare([
        ...testData,
        {
          fromLine: 'red',
          toLine: 'violet', // <- a line that doesn't exist
          dateTime: '2021-03-26T11:58:30',
          isPeak: true,
          fare: 2,
        },
      ]);
    } catch (e) {
      expect(e).toBeInstanceOf(SingaMetroAuthorityError);
      expect(e.message).toBe('There were some issues with the given parameters.');
    }
  });
});
