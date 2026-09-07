import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to your environment secrets in Settings > Secrets.");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Check config status
  app.get("/api/config", (_req, res) => {
    res.json({
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Chat RPG endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, playerName = "Petualang", genre = "🌌 Cyberpunk 2099 (Neon, Hacker, & Cyborg)" } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array cannot be empty" });
      }

      const systemPrompt = `Kamu adalah seorang Game Master (GM) RPG yang sangat seru dan interaktif.
Pemain bernama: ${playerName}
Genre petualangan: ${genre}

Panduan Merespons:
1. Buat narasi pembuka atau lanjutan yang imersif dan penuh suspense (maksimal 2-3 paragraf).
2. Tanggapi setiap aksi pemain dengan efek/konsekuensi yang realistis.
3. Gunakan formatting Markdown (teks tebal untuk aksi penting, cetak miring untuk dialog).
4. SELALU akhiri respons kamu dengan memberikan 3 Opsi Aksi Bernomor (1, 2, 3), lalu ingatkan bahwa pemain bebas mengetikkan tindakan unik mereka sendiri.`;

      // Transform history to Gemini format: role: "user" | "model"
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const ai = getGeminiClient();

      // gemini-3.6-flash, fast and responsive for interactive game narration
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.85,
        },
      });

      const responseText = response.text || "Game Master sedang terdiam...";
      return res.json({ text: responseText });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      const isApiKeyError = error.message?.includes("GEMINI_API_KEY") || error.message?.includes("API_KEY");
      return res.status(500).json({
        error: error.message || "Failed to generate story progression",
        isApiKeyError,
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
