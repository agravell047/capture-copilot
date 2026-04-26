const { callLLM } = require('../llm/client');

const generate = async (rfpData) => {
  const prompt = `Generate an executive summary for this RFP proposal: ${JSON.stringify(rfpData)}`;
  const response = await callLLM({ messages: [{ role: 'user', content: prompt }] });
  return { summary: response };
};

module.exports = { generate };