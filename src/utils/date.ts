const date = {
  addMinute: (minute: number) => {
    const minuteInMs = 60 * 1000 * minute;
    const currentDateInMs = Date.now();

    const newDate = new Date(currentDateInMs + minuteInMs);

    return newDate;
  },

  compare: (date: Date) => {
    const currentDateInMs = Date.now();
    const dateInMs = new Date(date).getTime();

    if (currentDateInMs > dateInMs) {
      return true;
    }

    return false;
  },
};

export default date;
