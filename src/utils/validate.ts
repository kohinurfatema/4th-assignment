export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidDate = (value: string) => !isNaN(Date.parse(value));

export const isFutureDate = (value: string) => new Date(value) > new Date();
