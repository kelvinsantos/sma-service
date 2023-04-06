// Define the fare matrix for each line
export const fareMatrix = {
  green: {
    green: {
      peak: 2,
      nonPeak: 1
    },
    red: {
      peak: 4,
      nonPeak: 3
    }
  },
  red: {
    red: {
      peak: 3,
      nonPeak: 2
    },
    green: {
      peak: 3,
      nonPeak: 2
    }
  }
};

// Define the peak hour times
export const peakHours = {
  0: {
    startTime: '18:00',
    endTime: '23:00',
    startTime2: '00:00',
    endTime2: '00:00'
  },
  1: {
    startTime1: '8:00',
    endTime1: '10:00',
    startTime2: '16:30',
    endTime2: '19:00'
  },
  2: {
    startTime: '8:00',
    endTime: '10:00',
    startTime2: '16:30',
    endTime2: '19:00'
  },
  3: {
    startTime: '8:00',
    endTime: '10:00',
    startTime2: '16:30',
    endTime2: '19:00'
  },
  4: {
    startTime: '8:00',
    endTime: '10:00',
    startTime2: '16:30',
    endTime2: '19:00'
  },
  5: {
    startTime: '8:00',
    endTime: '10:00',
    startTime2: '16:30',
    endTime2: '19:00'
  },
  6: {
    startTime: '10:00',
    endTime: '14:00',
    startTime2: '18:00',
    endTime2: '23:00'
  }
};

export const fareCapMatrix = {
  green: {
    green: {
      dailyCap: 8,
      weeklyCap: 55
    },
    red: {
      dailyCap: 12,
      weeklyCap: 70
    }
  },
  red: {
    red: {
      dailyCap: 15,
      weeklyCap: 90
    },
    green: {
      dailyCap: 15,
      weeklyCap: 90
    }
  }
};
