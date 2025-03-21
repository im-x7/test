export const getEnvValue = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

export const isDev = (): boolean => {
  return import.meta.env.DEV;
};

export const isProd = (): boolean => {
  return import.meta.env.PROD;
}; 