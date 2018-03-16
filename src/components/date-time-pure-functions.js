export const getTheTimezoneOffset = date => {
  // input: optional date parameter; no parameter = current date
  // returns user's current timezone offset from UTC/Zulu time
  // used as a helper function throughout
  const theDate = date instanceof Date ? date : new Date();
  // getCurrentTimezoneOffset reverses the sign, so we flip it back
  const offset = theDate.getTimezoneOffset();
  return -offset;
}

export const isDaylightSavings = offset => {
  // input: currentOffset with CORRECT sign, i.e. US will have a negative sign
  // returns true if daylight savings time, else false
  // all calcs are in MINUTES
  // How used?  Standalone.  Not used as a helper function anywhere.
  const currentOffset = !isNaN(offset) ? offset : getTheTimezoneOffset();
  const today = new Date();
  const thisYear = today.getFullYear();
  const jan = new Date(thisYear, 0, 1);
  const jul = new Date(thisYear, 6, 1);
  // getTimezoneOffset reverses the sign, so we flip it back
  const janOffset = -jan.getTimezoneOffset();
  const julOffset = -jul.getTimezoneOffset();
  
  const hemisphere = janOffset < julOffset ? 'north' : 'south' ;

  const isDST = 
    janOffset === julOffset ? false : // DST must not be observed
    (hemisphere === 'north' && currentOffset === julOffset) ? true :
    (hemisphere === 'south' && currentOffset === janOffset) ? true :
    false ; // either non-applicable offset passed, or it is not DST
  return isDST;
};

const formatOffsetAsString = offsetMins => {
  // input: signed integer of minutes of timezone offset
  // US is negative (behind Zulu time)
  // How used?  Helper function to convertTimeStampToString()
  if(isNaN(offsetMins)) return '';
  const offsetSign = offsetMins >= 0 ? '+' : '-' ;
  const offsetHours = offsetSign === '-' ? 
    Math.abs(Math.ceil( offsetMins/60)) :
    Math.abs(Math.floor(offsetMins/60)) ;
  const leadingZeroHours = offsetHours < 10 ? '0' : '' ;
  const offsetMinsRemaining = Math.abs(offsetMins%60);
  const leadingZeroMins = offsetMinsRemaining < 10 ? '0' : '' ;
  const offsetFormatted = `${offsetSign}${leadingZeroHours}${offsetHours}:${leadingZeroMins}${offsetMinsRemaining}`;
  return offsetFormatted;
}

export const convertTimeStampToString = timestamp => {
  // input: JS Date object (i.e. timestamp) (correctly formatted, i.e. time zone is local, and time is time in local time zone)
  // output: string in TIMESTAMP WITH TIME ZONE format (zone relative to Zulu)
  // sample output: '2017-12-21T16:26:48-05:00'
  // WHY USE?  Be in full control of the string. Don't send timestamps to the database, and let the database decide how to convert. Convert here, and avoid time zone conversion problems.
  if (timestamp instanceof Date) {
    const year = timestamp.getFullYear();
    const month = timestamp.getMonth() + 1; // months are 0-index in date objects, but not in string
    const date = timestamp.getDate();
    const timeSymbol = 'T';
    const hours = timestamp.getHours();
    const minutes = timestamp.getMinutes();
    const seconds = timestamp.getSeconds();
    const offset = getTheTimezoneOffset(timestamp); // returns signed minutes
    const offsetFormatted = formatOffsetAsString(offset); // pass in signed minutes, returns signed string
    return `${year}-${month}-${date}${timeSymbol}${hours}:${minutes}:${seconds}${offsetFormatted}`;
  }
  return '' ;
}

export const convertTimeStampToIntegers = timestamp => {
  const dateTimeObject = {
    year: timestamp.getFullYear(),
    month: timestamp.getMonth() + 1, // months 0 index
    date: timestamp.getDate(),
    hours: timestamp.getHours(),
    minutes: timestamp.getMinutes(),
    seconds: timestamp.getSeconds(),
    milliseconds: timestamp.getMilliseconds(),
  };
  return dateTimeObject;
}

export const convertStringToTimeStamp = (theString) => {
  // input: string in ISO 8601 format; 
  // if the offset is not included in the string, zulu time is assumed
  // output: Date object in specified ZULU time zone
  //  WORKING (STANDARD FORMATS)
  //   2018-03-11 was start of daylight savings
  //   2018-03-15T15:25:19+00:00
  //   2018-03-15T15:25:19Z
  // WORKING (NON-STANDARD FORMATS)
  //   2018-03-15T15:25:19 
  //   2018-03-15T15:25:19.001 
  //   2018-03-15T10:25:19.001-5:00 
  //   2018-03-15T15:25:19.001-4:00 
  //   2018-03-15T10:25:19.001-5 
  //   2018-03-15T15:25:19.001-4 
  // NOT WORKING YET
  //   20180315T152519Z

  // @@@@@@@@@ PARSE THE STRING @@@@@@@@
  const milliSecondsPerMinute = 60 * 1000 ;
  if (typeof theString === 'string') {
    // IMPROVEMENT: VALIDATE DATE FORMAT. POSSIBLY ALLOW OTHER FORMATS.

    // GET THE DATE AS INTEGERS
    const dateTimeArray = theString.split('T');
    const dateArray = dateTimeArray[0].split('-');
    const dateArrayIntegers = dateArray.map(date=>parseInt(date,10));
    
    // READ WHAT TYPE OF SUFFIX IS ON THE END: 2 TYPES: MS AND ZONE
    const splitters = ['.', '-', '+', 'Z'];
    const splitEnd = splitters.map((item, i)=>{
      if(typeof dateTimeArray[1] !== 'string') {
        if(splitters[i] === 'Z') {
          return 'not zulu';
        } else {
          return splitters[i];
        }
      } else if( dateTimeArray[1].includes(splitters[i])) {
        const split = dateTimeArray[1].split(splitters[i]);
        if(splitters[i] !== 'Z') {
          return parseInt(split[1], 10);
        } else {
          return 'zulu';
        }
      } else {
        if(splitters[i] === 'Z') {
          return 'not zulu';
        } else {
          return splitters[i];
        }
      }
    });
  
    // SPLIT TIME FROM MS AND/OR ZONE SUFFIX
    const timeSplit = 
      typeof dateTimeArray[1] !== 'string' ? '' :
      splitEnd[0] !== splitters[0] ? dateTimeArray[1].split(splitters[0]) :
      splitEnd[1] !== splitters[1] ? dateTimeArray[1].split(splitters[1]) :
      splitEnd[2] !== splitters[2] ? dateTimeArray[1].split(splitters[2]) :
                                     dateTimeArray[1].split(splitters[2]) ;
    
    // GET TIME AS INTEGERS
    const timeHmsArray = typeof timeSplit[0] === 'string' ? timeSplit[0].split(':') : [] ;
    const timeArrayIntegers = timeHmsArray.map(time=>parseInt(time,10));
    const timeMs = isNaN(splitEnd[0]) ? 0 : splitEnd[0];

    // COMPILE INTO A SINGLE DATE OBJECT
    // ALL MEASUREMENTS (YEAR-MILLISECONDS) ARE ENTERED EXACTLY AS READ FROM THE STRING
    // THE DATE OBJECT HAS NO TIME ZONE OFFSET YET, SO ZULU IS ASSUMED
    // I.E. IF YOU PASSED IN 15 HOURS, AND YOUR OFFSET IS -5 HOURS, THIS WILL READ AS 10 HOURS ZULU TIME.
    const timestamp = new Date();
    timestamp.setFullYear(dateArrayIntegers[0]);
    timestamp.setMonth(dateArrayIntegers[1] - 1); // months are 0-index in date objects
    timestamp.setDate(dateArrayIntegers[2]);
    timestamp.setHours(timeArrayIntegers[0]);
    timestamp.setMinutes(timeArrayIntegers[1]);
    timestamp.setSeconds(timeArrayIntegers[2]);
    timestamp.setMilliseconds(timeMs);

    // DETERMINE TIME ZONE OFFSET PASSED AS PARAMETER (IF ANY)
    const offsetParam = 
      splitEnd[1] !== splitters[1] ? -splitEnd[1] :
      splitEnd[2] !== splitters[2] ?  splitEnd[2] :
      splitEnd[3] === 'zulu'       ?  0 :
      0 ;
    const offsetParamMins = offsetParam * 60;
    // GET THE USER'S CURRENT OFFSET; THIS WAS USED ABOVE BY DEFAULT WHEN THE NEW DATE WAS CREATED
    const offsetCurrent = getTheTimezoneOffset(timestamp);
    // DETERMINE HOW MUCH WE NEED TO CORRECT THE ZULU TIME
    const offsetDelta = offsetParamMins - offsetCurrent;
    // CORRECT THE ZULU TIME
    const timestampAdj = new Date(timestamp - (offsetDelta * milliSecondsPerMinute));
    return timestampAdj;
  }
  return {} ;
}

export const convertIntegersToTimeStamp = (year, month=1, date=1, hours=0, minutes=0, seconds=0, tzOffset) => {
  // input: integers in local time format
  // calculation: create a date object, inputting values to match the integers, then adjust the date by the offset to compensate for UTC
  // output: Date object reflecting current time zone
  // tzOffset is optional, if not specified, use user's current time zone offset

  // IMPROVE THIS BY VALIDATING ALL DATA FIRST!!!!!
    const milliSecondsPerMinute = 60 * 1000 ;

    const timestamp = new Date();
    const currentYear = timestamp.getFullYear();
    const defaultYear = year ? year : currentYear ;

    timestamp.setFullYear(defaultYear);
    timestamp.setMonth(month); // months are 0-index in date objects
    timestamp.setDate(date);
    timestamp.setHours(hours);
    timestamp.setMinutes(minutes);
    timestamp.setSeconds(seconds);

    // if you don't pass in an offset, this calculates the offset based on that date in the user's current time zone (i.e. in eastern US daylight savings: -4, or -5 if not daylight savings)
    const offset = !isNaN(tzOffset) ? tzOffset : getTheTimezoneOffset(timestamp);

    const adjustedTimestamp = offset < 0 ?
      new Date(timestamp - (-offset * milliSecondsPerMinute)) : // - is earlier
      new Date(timestamp - (offset * milliSecondsPerMinute)) ; // -- is later
    return adjustedTimestamp;
}

export const printDate = date => {
  // input: timestamp or date; we should be handling all in Zulu time, so assume that.  Not tested with other time.
  // output: string to display timestamp to user; NOT formatting for data handling.
  if (date instanceof Date) {
    const dateOptions = {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric'
    };
    return date.toLocaleDateString('en',dateOptions)
  }
  return '';
}