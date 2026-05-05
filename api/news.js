export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  try {
    const CURRENTS_KEY = process.env.CURRENTS_API_KEY;
    const NEWS_API_KEY = process.env.NEWS_API_KEY;

    // ── Currents API (free, works on deployed domains, India support) ──
    if (CURRENTS_KEY) {
      const cRes  = await fetch(
        `https://api.currentsapi.services/v1/latest-news?language=en&country=IN&apiKey=${CURRENTS_KEY}`
      );
      const cData = await cRes.json();

      if (cData.news?.length) {
        return res.status(200).json({
          status: 'ok',
          totalResults: cData.news.length,
          articles: cData.news.slice(0, 10).map(a => ({
            source:      { name: a.author || 'Unknown' },
            title:       a.title,
            description: a.description,
            url:         a.url,
            urlToImage:  a.image !== 'None' ? a.image : null,
            publishedAt: a.published,
          }))
        });
      }
    }

    // ── Fallback: NewsAPI (localhost dev only) ──
    if (!NEWS_API_KEY) {
      return res.status(500).json({
        error: 'No API key configured. Set CURRENTS_API_KEY in Vercel env vars.'
      });
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&pageSize=10&apiKey=${NEWS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'error') {
      return res.status(400).json({ error: data.message, code: data.code });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
