const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const pool = require('../utils/db');

const router = express.Router();
const MODEL = 'gemini-2.5-flash';

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set in .env');
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const getDataset = async (fileId, userId) => {
  const { rows } = await pool.query(
    `SELECT d.file_name, d.columns_meta, d.summary, dr.rows
     FROM datasets d
     JOIN dataset_rows dr ON d.file_id = dr.file_id
     WHERE d.file_id = $1 AND d.user_id = $2`,
    [fileId, userId]
  );
  if (!rows[0]) return null;
  return {
    fileName: rows[0].file_name,
    columns: rows[0].columns_meta,
    summary: rows[0].summary,
    data: rows[0].rows,
  };
};

// POST /api/ai/insights/:fileId
router.post('/insights/:fileId', async (req, res) => {
  try {
    // Check cache first
    const cached = await pool.query(
      'SELECT insights, generated_at FROM ai_insights WHERE file_id = $1',
      [req.params.fileId]
    );
    if (cached.rows[0]) {
      return res.json({
        success: true,
        insights: cached.rows[0].insights,
        generatedAt: cached.rows[0].generated_at,
        fromCache: true,
      });
    }

    const dataset = await getDataset(req.params.fileId, req.user.id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    const { columns, summary, data, fileName } = dataset;

    const numericStats = columns
      .filter(c => c.type === 'number')
      .map(c => `  ${c.name}: min=${c.stats.min}, max=${c.stats.max}, mean=${c.stats.mean}, median=${c.stats.median}`)
      .join('\n');

    const categoricalStats = columns
      .filter(c => c.type === 'string')
      .slice(0, 5)
      .map(c => `  ${c.name}: ${c.stats.uniqueCount} unique, top=${c.stats.topValues?.map(v => v.value).join(', ')}`)
      .join('\n');

    const prompt = `You are a senior data analyst. Analyze this dataset and respond with a JSON object ONLY (no markdown, no backticks, no extra text).

Dataset: "${fileName}"
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

    const ai = getGenAI();
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    const text = response.text.replace(/```json|```/g, '').trim();
    const insights = JSON.parse(text);

    // Cache in DB
    await pool.query(
      `INSERT INTO ai_insights (file_id, insights)
       VALUES ($1, $2)
       ON CONFLICT (file_id) DO UPDATE SET insights = $2, generated_at = NOW()`,
      [req.params.fileId, JSON.stringify(insights)]
    );

    res.json({ success: true, insights, generatedAt: new Date().toISOString(), fromCache: false });
  } catch (err) {
    console.error('AI insights error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat/:fileId
router.post('/chat/:fileId', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const dataset = await getDataset(req.params.fileId, req.user.id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    const { columns, summary, data, fileName } = dataset;

    const systemInstruction = `You are an expert data analyst helping users understand their dataset.

Dataset: "${fileName}"
Rows: ${summary.totalRows}, Columns: ${summary.totalColumns}, Completeness: ${summary.completeness}%

Columns:
${columns.map(c => `- ${c.name} (${c.type})${c.stats.mean !== undefined ? `: mean=${c.stats.mean}, min=${c.stats.min}, max=${c.stats.max}` : c.stats.uniqueCount ? `: ${c.stats.uniqueCount} unique values` : ''}`).join('\n')}

Sample rows: ${JSON.stringify(data.slice(0, 10))}

Be concise, precise, and data-driven.`;

    const geminiHistory = history.slice(-8).map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    const ai = getGenAI();
    const chat = ai.chats.create({ model: MODEL, config: { systemInstruction }, history: geminiHistory });
    const response = await chat.sendMessage({ message });

    res.json({ reply: response.text });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
