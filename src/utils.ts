export function createToken(...is: number[]) {
  return is.map(i => generateRandomString(i)).join('-');
}

function generateRandomString(length: number) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

export function toNumber(defaultValue: number = 0) {
  return (value: string) => {
    if (!value) return defaultValue;
    if (isNaN(value as any)) return defaultValue;
    return Number(value) || defaultValue;
  }
}