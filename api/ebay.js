import axios from "axios";

const CLIENT_ID = process.env.EBAY_CLIENT_ID;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;

/**
 * OAuth 2.0 トークンを取得する関数
 */
async function getAccessToken() {
  const url = "https://api.ebay.com/identity/v1/oauth2/token";
  const data = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  }).toString();

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("トークン取得エラー:", error.response?.data || error.message);
    throw new Error("Failed to obtain eBay API token");
  }
}

/**
 * APIリクエストを処理するVercel用ハンドラー
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiType = req.query.api || "browse";
  let ebayUrl = "";

  switch (apiType) {
    case "browse": {
      const searchQuery = req.query.q || "laptop";
      const limit = req.query.limit || 10;
      ebayUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}`;
      break;
    }
    case "analytics":
      ebayUrl = "https://api.ebay.com/sell/analytics/v1_beta/rate_limit";
      break;
    case "inventory":
      ebayUrl = "https://api.ebay.com/sell/inventory/v1/inventory_item";
      break;
    default:
      return res.status(400).json({ error: "Invalid API type" });
  }

  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(ebayUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        "Content-Type": "application/json",
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("eBay API エラー:", error.response?.data || error.message);
    return res.status(500).json({ 
      error: "Failed to fetch data from eBay API", 
      details: error.response?.data || error.message 
    });
  }
}
