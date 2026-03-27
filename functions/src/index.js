const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

// Two secrets stored securely in Firebase — never in your code
const anthropicKey = defineSecret("ANTHROPIC_API_KEY");
const appPassword  = defineSecret("APP_PASSWORD");

exports.analyzeMeal = onRequest(
  { secrets: [anthropicKey, appPassword], cors: true },
  async (req, res) => {

    // Only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Check password header — block anything without the right password
    const sentPassword = req.headers["x-app-password"];
    if (!sentPassword || sentPassword !== appPassword.value()) {
      console.warn("Unauthorized request blocked");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate body
    const { meal } = req.body;
    if (!meal || typeof meal !== "string") {
      return res.status(400).json({ error: "Missing meal text" });
    }

    // Call Anthropic API
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey.value(),
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          messages: [{
            role: "user",
            content: `Analyze this meal for someone on Zoloft (sertraline) trying to lose weight. Be warm and concise. Respond ONLY as valid JSON with these exact keys:
- calories: number (estimated kcal)
- protein: number (grams)
- carbs: number (grams)
- fat: number (grams)
- rating: number 1-5 (how well it supports weight loss on SSRIs)
- note: string (one short encouraging sentence or SSRI-specific tip)

Meal: "${meal.substring(0, 300)}"

Return only the JSON object, no markdown, no explanation.`,
          }],
        }),
      });

      const data   = await response.json();
      const text   = data.content?.[0]?.text || "{}";
      const clean  = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      return res.json(parsed);

    } catch (err) {
      console.error("Anthropic API error:", err);
      return res.status(500).json({ error: "Analysis failed" });
    }
  }
);
