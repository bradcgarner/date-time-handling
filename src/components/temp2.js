'use strict';

const getTheTimezoneOffset = date => {
  // input: optional date parameter; no parameter = current date
  // returns user's current timezone offset from UTC/Zulu time
  const theDate = date instanceof Date ? date : new Date();
  // getCurrentTimezoneOffset reverses the sign, so we flip it back
  const offset = theDate.getTimezoneOffset();
  return -offset;
}

const convertStringToTimeStamp = (theString) => {
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
      if(dateTimeArray[1].includes(splitters[i])) {
        const split = dateTimeArray[1].split(splitters[i]);
        if(splitters[i] !== 'Z') {
          return parseInt(split[1]);
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
    console.log('splitEnd',splitEnd);
  
    // SPLIT TIME FROM MS AND/OR ZONE SUFFIX
    console.log('dateTimeArray[1]',dateTimeArray[1])
    const timeSplit = 
      splitEnd[0] !== splitters[0] ? dateTimeArray[1].split(splitters[0]) :
      splitEnd[1] !== splitters[1] ? dateTimeArray[1].split(splitters[1]) :
      splitEnd[2] !== splitters[2] ? dateTimeArray[1].split(splitters[2]) :
                                     dateTimeArray[1].split(splitters[2]) ;
    
    // GET TIME AS INTEGERS
    console.log('timeSplit',timeSplit);
    const timeHmsArray = timeSplit[0].split(':');
    console.log('timeHmsArray',timeHmsArray);
    const timeArrayIntegers = timeHmsArray.map(time=>parseInt(time,10));
    console.log('timeArrayIntegers',timeArrayIntegers);
    const timeMs = isNaN(splitEnd[0]) ? 0 : splitEnd[0];

    // COMPILE INTO A SINGLE DATE OBJECT
    // ALL MEASUREMENTS (YEAR-MILLISECONDS) ARE ENTERED EXACTLY AS READ FROM THE STRING
    // THE DATE OBJECT HAS NO TIME ZONE OFFSET YET, SO ZULU IS ASSUMED
    // I.E. IF YOU PASSED IN 15 HOURS, AND YOUR OFFSET IS -5 HOURS, THIS WILL READ AS 10 HOURS ZULU TIME.
    const timestamp = new Date();
    console.log(dateArrayIntegers[0]);
    console.log(dateArrayIntegers[1] - 1);
    console.log(dateArrayIntegers[2]);
    console.log(timeArrayIntegers[0]);
    console.log(timeArrayIntegers[1]);
    console.log(timeArrayIntegers[2]);
    console.log('ms', timeMs);
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
    console.log('offsetParamMins',offsetParamMins);
    // GET THE USER'S CURRENT OFFSET; THIS WAS USED ABOVE BY DEFAULT WHEN THE NEW DATE WAS CREATED
    const offsetCurrent = getTheTimezoneOffset(timestamp);
    console.log('offsetCurrent', offsetCurrent);
    // DETERMINE HOW MUCH WE NEED TO CORRECT THE ZULU TIME
    const offsetDelta = offsetParamMins - offsetCurrent;
    // CORRECT THE ZULU TIME
    const timestampAdj = new Date(timestamp - (offsetDelta * milliSecondsPerMinute));
    console.log('    timestamp',theString);
    console.log('raw timestamp',timestamp);
    console.log('adj timestamp',timestampAdj);

  }
  return {} ;
}

// convertStringToTimeStamp('2018-03-15T15:25:19Z');

const convertStringToTimeStampOld = (theString, tzOffset=-4) => {
  // IMPROVEMENT: INSTEAD OF DEFAULT OFFSET PARAM, CALC DEFAULT OFFSET FROM CURRENT TIME ZONE
  // input: string in Zulu format; e.g. '2018-01-19T15:24:45.000Z'
  // offset param is optional. No param = USER'S CURRENT TIME ZONE
  // output: Date object in specified (or user's) time zone
  if (typeof theString === 'string') {
    // IMPROVEMENT: VALIDATE DATE FORMAT. POSSIBLY ALLOW OTHER FORMATS.
    // IMPROVEMENT: ADD MILLISECONDS

    const milliSecondsPerMinute = 60 * 60 * 1000 ;

    const dateTimeArray = theString.split('T');
    const dateArray = dateTimeArray[0].split('-');
    const dateArrayIntegers = dateArray.map(date=>parseInt(date,10));
    const timeArraywithZone = dateTimeArray[1].split('.');
    const timeArray =  timeArraywithZone[0].split(':');
    const timeArrayIntegers = timeArray.map(time=>parseInt(time,10));

    const timestamp = new Date();

    timestamp.setFullYear(dateArrayIntegers[0]);
    timestamp.setMonth(dateArrayIntegers[1] - 1); // months are 0-index in date objects
    timestamp.setDate(dateArrayIntegers[2]);
    timestamp.setHours(timeArrayIntegers[0]);
    timestamp.setMinutes(timeArrayIntegers[1]);
    timestamp.setSeconds(timeArrayIntegers[2]);

    // input: 
    const offset = !isNaN(tzOffset) ? tzOffset : getTheTimezoneOffset(timestamp);

    const adjustedTimestamp = offset < 0 ?
      new Date(timestamp - (-offset * milliSecondsPerMinute)) : // - is earlier
      new Date(timestamp - (offset * milliSecondsPerMinute)) ; // -- is later
      console.log(theString)
      console.log( adjustedTimestamp)
      return adjustedTimestamp;
  }
  return {} ;
}

convertStringToTimeStampOld('2018-03-15T15:25:19Z')