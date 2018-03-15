'use strict';

const getTheTimezoneOffset = (date) => {
  // returns user's current timezone offset from UTC/Zulu time
  // date parameter is optional; no parameter = current date
  const theDate = date instanceof Date ? date : new Date();
  // getCurrentTimezoneOffset reverses the sign, so we flip it back
  const offset = -theDate.getTimezoneOffset();
  // console.log(theDate)
  // console.log(offsetHours);
  return offset;
}

const otherDate = new Date(2018, 2, 12);

const offsetHours = getTheTimezoneOffset(otherDate);

const isDaylightSavings = (currentOffsetHours) => {
  // input: currentOffset with CORRECT sign, i.e. US will have a negative sign
  // all calcs are in MINUTES
  // returns true if daylight savings time, else false
  const today = new Date();
  const thisYear = today.getFullYear();
  const jan = new Date(thisYear, 0, 1);
  const jul = new Date(thisYear, 6, 1);
  // getTimezoneOffset reverses the sign, so we flip it back
  const janOffset = -jan.getTimezoneOffset();
  const julOffset = -jul.getTimezoneOffset();
  
  const currentOffset = currentOffsetHours * 60;
  const hemisphere = janOffset < julOffset ? 'north' : 'south' ;

  // console.log(janOffset, jan)
  // console.log(julOffset, jul)
  // console.log(hemisphere)
  const isDST = 
    janOffset === julOffset ? false : // DST must not be observed
    (hemisphere === 'north' && currentOffset === julOffset) ? true :
    (hemisphere === 'south' && currentOffset === janOffset) ? true :
    false ;
  // console.log(isDST)
  return isDST;
};

isDaylightSavings(offsetHours);

const formatOffsetAsString = offsetMins => {
  // input: signed integer of minutes of timezone offset
  // US is negative (behind Zulu time)
  if(isNaN(offsetMins)) return '';
  const offsetSign = offsetMins >= 0 ? '+' : '-' ;
  // console.log('sign', offsetSign);
  const offsetHours = offsetSign === '-' ? 
    Math.abs(Math.ceil( offsetMins/60)) :
    Math.abs(Math.floor(offsetMins/60)) ;
  // console.log('hours', offsetHours);
  const leadingZeroHours = offsetHours < 10 ? '0' : '' ;
  // console.log('zero hours', leadingZeroHours);
  const offsetMinsRemaining = Math.abs(offsetMins%60);
  // console.log('mins', offsetMinsRemaining);
  const leadingZeroMins = offsetMinsRemaining < 10 ? '0' : '' ;
  // console.log('zero mins', leadingZeroMins);
  const offsetFormatted = `${offsetSign}${leadingZeroHours}${offsetHours}:${leadingZeroMins}${offsetMinsRemaining}`;
  // console.log(offsetFormatted);
  return offsetFormatted;
}

const convertTimeStampToString = timestamp => {
  // input: JS Date object (i.e. timestamp) (correctly formatted, i.e. time zone is local, and time is time in local time zone)
  // output: string in TIMESTAMP WITH TIME ZONE format (zone relative to Zulu)
  // sample output: '2017-12-21T16:26:48-05:00'
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

const sampleDate = new Date(2001,4,1);

const example = convertTimeStampToString(sampleDate);
console.log('example', example);