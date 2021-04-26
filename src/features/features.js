export const checkForNumber = (e) => {
  let str = e.target.value;
  if (isNaN(str[str.length - 1])) {
    str = str.slice(0, str.length - 1);
    e.target.value = str;
  }
};
