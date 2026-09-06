export const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};
