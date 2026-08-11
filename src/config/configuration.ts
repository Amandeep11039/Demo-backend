export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
  },
});
