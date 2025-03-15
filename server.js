const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ここにあなたのクライアントIDとシークレットを設定（環境変数で管理するのが望ましい）
const CLIENT_ID = "TAKARAZA-IchizoAn-PRD-06881f02d-6a92d998";
const CLIENT_SECRET = "PRD-6881f02d8e73-ca59-43c4-bf10-3793";

/**
 * axiosを使ってOAuth 2.0トークンを取得する関数
 * Client Credentials Grant Typeを利用
 */
async function getAccessToken() {
  const url = "https://api.ebay.com/identity/v1/oauth2/token";
  // URLエンコードされたデータを作成
  const data = "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope";
  // クライアントIDとシークレットをBase64エンコード
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${auth}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error("トークン取得エラー:", error.response ? error.response.data : error.message);
    throw error;
  }
}

// フロントエンドからのリクエストを受け付けるエンドポイント
// 例: http://localhost:3000/api/ebay?api=browse&q=laptop&limit=10
app.get('/api/ebay', async (req, res) => {
  const apiType = req.query.api || 'browse';
  let ebayUrl = "";

  // API種別に応じたエンドポイントURLを設定（ここではBrowse APIのみ例示）
  if (apiType === 'browse') {
    const searchQuery = req.query.q || 'laptop';
    const limit = req.query.limit || 10;
    ebayUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}`;
  } else if (apiType === 'analytics') {
    ebayUrl = 'https://api.ebay.com/sell/analytics/v1_beta/rate_limit';
  } else if (apiType === 'inventory') {
    ebayUrl = 'https://api.ebay.com/sell/inventory/v1/inventory_item';
  } else {
    return res.status(400).json({ error: 'Invalid API type' });
  }

  try {
    // axiosを使用して新しいアクセストークンを取得
    const accessToken = await getAccessToken();
    
    // 取得したトークンを使ってeBay APIへGETリクエスト
    const response = await axios.get(ebayUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US", // 必要に応じて変更
        "Content-Type": "application/json"
      }
    });
    // eBay APIから取得したJSONデータをそのまま返す
    res.json(response.data);
  } catch (error) {
    console.error("eBay API エラー:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
