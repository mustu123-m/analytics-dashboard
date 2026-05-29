const express = require('express');
// OpenAI v6: default export
const OpenAI = require('openai').default || require('openai');
const { dataStore } = require('./upload');

const router = express.Router();

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set in .env');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// POST /api/ai/insights/:fileId
router.post('/insights/:fileId', async (req, res) => {
  const dataset = dataStore.get(req.params.fileId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

  try {
    const openai = getOpenAI();
    const { columns, summary, data } = dataset;

    const numericStats = columns
      .filter(c => c.type === 'number')
      .map(c => `  ${c.name}: min=${c.stats.min}, max=${c.stats.max}, mean=${c.stats.mean}, median=${c.stats.median}`)
      .join('\n');

    const categoricalStats = columns
      .filter(c => c.type === 'string')
      .slice(0, 5)
      .map(c => `  ${c.name}: ${c.stats.uniqueCount} unique, top=${c.stats.topValues?.map(v => v.value).join(', ')}`)
      .join('\n');

    const prompt = `You are a senior data analyst. Analyze this dataset and respond with a JSON object ONLY (no markdown, no backticks).

Dataset: "${dataset.fileName}"
Rows: ${summary.totalRows}, Columns: ${summary.totalColumns}, Completeness: ${summary.completeness}%

Numeric columns:
${numericStats || 'None'}

Categorical columns:
${categoricalStats || 'None'}

Sample data (first 5 rows):
${JSON.stringify(data.slice(0, 5), null, 2)}

JSON schema to return:
{
  "summary": "2-3 sentence executive summary",
  "keyInsights": [{"title":"...","description":"...","type":"trend|anomaly|pattern|recommendation"}],
  "kpiRecommendations": [{"metric":"...","rationale":"...","suggestedTarget":"..."}],
  "dataQualityNotes": ["..."],
  "predictiveOpportunities": "1-2 sentences on ML/forecasting use cases"
}`;

    // OpenAI v6: same chat.completions.create API, model names unchanged
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1200,
    });

    const text = response.choices[0].message.content.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const insights = JSON.parse(clean);

    res.json({ success: true, insights, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('AI insights error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat/:fileId
router.post('/chat/:fileId', async (req, res) => {
  const dataset = dataStore.get(req.params.fileId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const openai = getOpenAI();
    const { columns, summary, data } = dataset;

    const systemPrompt = `You are an expert data analyst helping users understand their dataset.

Dataset: "${dataset.fileName}"
Rows: ${summary.totalRows}, Columns: ${summary.totalColumns}, Completeness: ${summary.completeness}%

Columns:
${columns.map(c => `- ${c.name} (${c.type})${c.stats.mean !== undefined ? `: mean=${c.stats.mean}, min=${c.stats.min}, max=${c.stats.max}` : c.stats.uniqueCount ? `: ${c.stats.uniqueCount} unique values` : ''}`).join('\n')}

Sample rows: ${JSON.stringify(data.slice(0, 10))}

Be concise, precise, and data-driven.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 600,
    });

    res.json({ reply: response.choices[0].message.content, usage: response.usage });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
