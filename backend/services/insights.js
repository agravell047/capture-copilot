const { callLLM } = require('../llm/client');

const generate = async (rfpData) => {
  const prompt = `Analyze this RFP data and provide strategic insights for bidding: ${JSON.stringify(rfpData)}`;
  const response = await callLLM({ messages: [{ role: 'user', content: prompt }] });
  return { insights: response };
};

module.exports = { generate };