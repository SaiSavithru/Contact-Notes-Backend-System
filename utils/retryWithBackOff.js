const { RateLimitError } = require('../kafka/producer');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackOff = async (fn, maxRetries = 5, baseDelay = 1000) => {
  let attempt = 0;
  let success = false;

  while (attempt < maxRetries && !success) {
    try {
      await fn();
      success = true;
    } catch (err) {
      if (err instanceof RateLimitError) {
        const delayTime = Math.pow(2, attempt) * baseDelay;
        console.warn(`Rate limited. Retrying in ${delayTime}ms... (attempt ${attempt + 1})`);
        await delay(delayTime);
        attempt++;
      } else {
        throw err;
      }
    }
  }

  if (!success) {
    throw new Error('Max retry attempts reached');
  }
};

module.exports = retryWithBackOff;
