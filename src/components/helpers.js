export const createStatusKeys = () => ({
  timestampCreated: 0,
  setup: 1,           // in setup, setup not done
  timestampOn: 3,     // setup done, ready to turn on
  timestampStart: 4,  // on, ready to turn off
  timestampOff: 5,    // running, ready to turn off
  timestampEnd: 7,    // off, ready to end
  timestampDone: 9,   // ended
  timestampDone2: 11,
});

export const calcStatusInt = (test, statusKeys) => {
  const statusTest =
    (!test.testname || !test.testProfile || !test.narrative || !test.storm ) ?
      statusKeys.setup : // 1
    test.timestampDone instanceof Date ?
      statusKeys.timestampDone2 : // 11
    test.timestampEnd instanceof Date ?
      statusKeys.timestampDone : // 9
    test.timestampOff instanceof Date ?
      statusKeys.timestampEnd : // 7
    test.timestampStart instanceof Date ?
      statusKeys.timestampOff : // 6
    test.timestampOn instanceof Date ?
      statusKeys.timestampOff :// 3
      statusKeys.timestampOn ;
  return statusTest;
}

export const immutableArrayInsert = (index, array, itemToUpdate) => {
  if (index === 0){
    const remainder = array.slice(1,array.length);
    const newArray = [itemToUpdate, ...remainder];
    return newArray;
  }
  if (index === array.length -1){
    const remainder = array.slice(0,array.length-1);
    const newArray =  [...remainder, itemToUpdate];
    return newArray;
  }
  const remainderFront = array.slice(0,index);
  const remainderBack = array.slice(index+1,array.length);
  const newArray = [...remainderFront, itemToUpdate, ...remainderBack];
  return newArray;
}
