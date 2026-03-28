export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address required' });

  try {
    const r = await fetch(`https://blockchain.info/rawaddr/${address}?limit=3`, {
      cache: 'no-store'
    });
    if (!r.ok) return res.status(200).json({ txs: [] });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(200).json({ txs: [] });
  }
}
