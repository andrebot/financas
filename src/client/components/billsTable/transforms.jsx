export function dateTransformFactory (currentMonth) {
  return function (day) {
    const date = new Date();

    date.setMonth(currentMonth);
    date.setDate(day);

    return date;
  }
}

export function paidAtTransformFactory(currentMonth) {
  return function (paidAtValues) {
    let date = new Date();
    let firstDate = new Date();

    date.setHours(23, 59, 59, 999);
    firstDate.setMonth(currentMonth);
    firstDate.setDate(1);
    date = date.getTime();
    firstDate = firstDate.getTime();

    return paidAtValues.find(function (element) {
      const elementMilli = element.getTime();
      return elementMilli >= firstDate && elementMilli <= date;
    });
  }
}

export function isPaidTransformFactory (paidAtTransform){
  return function (paidAtValues) {
    const date = paidAtTransform(paidAtValues);

    return (date) ? true : false;
  }
}