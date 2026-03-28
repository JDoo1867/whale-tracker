export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  const { module, action, address, contractaddress, page, offset, sort } = req.query;
  const apiKey = process.env.ETHERSCAN_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const params = new URLSearchParams({
    chainid: '1',
    module, action,
    ...(address && { address }),
    ...(contractaddress && { contractaddress }),
    page: page || '1',
    offset: offset || '5',
    sort: sort || 'desc',
    apikey: apiKey
  });

  try {
    const r = await fetch(`https://api.etherscan.io/v2/api?${params}`, {
      cache: 'no-store'
    });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
