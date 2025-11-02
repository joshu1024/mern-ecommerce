import express from "express";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

async function generateAccessToken() {
  const auth = Buffer.from(
    `AVhcnD3RpwZcOKS-AA8jpS_FuzRgVnj25RtZ-eNtafl8mpNFhpru97SCVE5xJ05wD6PpDIkR1neYNVO6:EA2LKo2rmfGn2GfhO3HuykdD_p0Kikpisf3wwWflrDwafxxO4WMyBMfR58V2hZ5B-kDa7FC-9CRo4XFU`
  ).toString("base64");

  const response = await fetch(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ PayPal token error:", data);
    throw new Error(data.error_description || "Failed to generate token");
  }

  console.log("✅ PayPal token generated successfully");
  return data.access_token;
}

// Create order
router.post("/create-order", async (req, res) => {
  try {
    const accessToken = await generateAccessToken();

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: req.body.amount, // e.g. 184
              },
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("🧾 PayPal Order Created:", data); // Debug
    res.json(data); // ⚠️ Must contain { id: "PAYPAL_ORDER_ID" }
  } catch (err) {
    console.error("Create order failed:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.post("/capture-order", async (req, res) => {
  try {
    const { orderID } = req.body;
    const accessToken = await generateAccessToken();
    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to capture order");
  }
});
const token = await generateAccessToken();
console.log("Token:", token);

export default router;
