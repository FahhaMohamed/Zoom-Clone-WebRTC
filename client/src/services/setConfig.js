export const setConfig = (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return config;
  };
  