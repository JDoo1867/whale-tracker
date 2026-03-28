export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const heliusKey = process.env.HELIUS_API_KEY;
  const { address } = req.query;

  if (!address) return res.status(400).json({ error: 'address required' });

  // Helius 시도 → 실패/한도초과시 Solscan 폴백
  if (heliusKey) {
    try {
      const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${heliusKey}&limit=5&type=TRANSFER`;
      const r = await fetch(url);

      // 429 = 한도초과, 402 = 크레딧 부족 → Solscan으로 폴백
      if (r.status === 429 || r.status === 402) {
        console.log('Helius quota exceeded, falling back to Solscan');
      } else if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length >= 0) {
          return res.status(200).json({ source: 'helius', data });
        }
      }
    } catch (e) {
      console.log('Helius error, falling back to Solscan:', e.message);
    }
  }

  // Solscan 폴백 (키 없을 때 or Helius 실패시)
  try {
    const r = await fetch(
      `https://public-api.solscan.io/account/transactions?account=${address}&limit=5`,
      { headers: { 'accept': 'application/json' } }
    );
    if (!r.ok) return res.status(200).json({ source: 'solscan', data: [] });
    const data = await r.json();
    return res.status(200).json({ source: 'solscan', data: Array.isArray(data) ? data : [] });
  } catch (e) {
    return res.status(200).json({ source: 'none', data: [] });
  }
}
