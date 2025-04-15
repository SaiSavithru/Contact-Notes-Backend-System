const axios = require('axios');

let accessToken = null;
let tokenExpiresAt = null;

const fetchNewToken = async () => {
  const res = await axios.get('http://localhost:4001/auth/token');
  accessToken = res.data.token;

  const [, payloadBase64] = accessToken.split('.');
  const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
  tokenExpiresAt = payload.exp * 1000;
  console.log('New JWT acquired');
};

const makeAuthenticatedRequest = async (config, retries = 1) => {
  if (!accessToken) {
    await fetchNewToken();
  }

  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${accessToken}`;
  try {
    const res = await axios(config);
    return res.data;
  } catch (err) {
    if ((err.response?.status === 401) && retries > 0) {
      console.warn('Token expired, retrying...');
      await fetchNewToken();
      return makeAuthenticatedRequest(config, retries - 1);
    }
    throw err;
  }
};

module.exports = makeAuthenticatedRequest;
