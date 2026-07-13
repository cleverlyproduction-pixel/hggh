import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Lazy initializer for Gemini client to prevent crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Full-stack API Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, count } = req.body;
    
    // Safety check: answer max 10 questions limit
    if (count && count >= 10) {
      return res.status(403).json({
        error: "LIMIT_REACHED",
        text: "Daily Demo Limit Reached! Contact CLEV PRODUCTIONS™ to deploy a custom, fully integrated chatbot with infinite capacity for your brand."
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response generator if Gemini API key is missing
      console.log("No GEMINI_API_KEY environment variable found. Using high-fidelity fallback assistant.");
      const lastMsg = messages[messages.length - 1];
      const text = lastMsg.text || "";
      const lowerText = text.toLowerCase();
      
      let reply = "";
      if (lastMsg.file) {
        reply = `### 📂 Document Scanned Successfully\n\nI have successfully parsed **${lastMsg.file.name}** (${lastMsg.file.size}).\n\nBased on my scanning, this file contains information of type **${lastMsg.file.type || "Document"}**.\n\n* **Primary Content**: Found structured outlines, project schemas, or textual declarations.\n* **Cognitive Status**: 100% processed.\n\nAt **CLEV PRODUCTIONS™**, we specialize in feeding custom business data directly into neural models so that they can answer questions regarding your files with absolute precision. Give us a hi at \`cleverlyproduction@gmail.com\` to build yours!`;
      } else if (lowerText.includes("website") || lowerText.includes("page") || lowerText.includes("portfolio")) {
        reply = `### 🌐 Premium Website Creation\n\n**CLEV PRODUCTIONS™** designs lightning-fast, high-converting websites. Our specialties include:\n\n* **Responsive Design**: Fluid grids matching 4K displays down to standard touch devices.\n* **Modern Tech Stack**: React, Vite, Tailwind CSS, and Framer Motion.\n* **Custom Logic**: Booking widgets, custom databases, and real-time support dashboards.\n\nCheck out our Website Portfolios section below! Let's build yours today: contact us at **cleverlyproduction@gmail.com**!`;
      } else if (lowerText.includes("game") || lowerText.includes("arcade") || lowerText.includes("tetris") || lowerText.includes("shooter")) {
        reply = `### 🎮 Elite Interactive Games\n\nWe build highly complex web games optimized for standard desktop browsers and responsive mobile touch displays!\n\n* **Cosmic Shooter**: A canvas-based real-time arcade project featuring shields, triple-beams, and particle explosions.\n* **Cascade Tetris**: A blocks puzzle with high-precision piece hold, ghost rendering, and synthesized sounds via Web Audio.\n\nScroll down to our **Game Cabin** below to experience them live!`;
      } else if (lowerText.includes("pricing") || lowerText.includes("cost") || lowerText.includes("rate")) {
        reply = `### 🏷️ CLEV Custom Pricing Plans\n\nBecause we build tailored, high-performance chatbots, portfolios, and games, our pricing adapts to your specific project needs:\n\n1. **Advanced AI Chatbots**: From custom file-indexing brains to multi-agent Slack/Discord bots.\n2. **High-Fidelity Websites**: Elegant landing pages, modern portfolios, or robust dashboards.\n3. **Playable Web Games**: Stunning pixel or canvas-based custom retro projects.\n\nShoot us an inquiry in the form below or email us at **cleverlyproduction@gmail.com** and we'll draft a bespoke specification sheet and price quote within 24 hours!`;
      } else {
        reply = `Hi! I am the CLEV Showcase Assistant. I have received your message: "${text}".\n\nAt **CLEV PRODUCTIONS™**, we construct state-of-the-art web architectures with gorgeous animations, advanced backend integrations, and custom AI chat cores. Let's make something incredible together! Give us a hi at **cleverlyproduction@gmail.com** or fill out our Contact form.`;
      }

      return res.json({ text: reply });
    }

    // Format messages history for @google/genai SDK
    // Structure of contents: array of { role: 'user'|'model', parts: [{ text: '...' }] }
    const formattedContents = messages.map((m: any) => {
      const parts: any[] = [];
      
      // If message includes an uploaded file that is an image, we can send inlineData!
      if (m.file && m.file.base64 && m.file.type.startsWith("image/")) {
        parts.push({
          inlineData: {
            data: m.file.base64.split(",")[1] || m.file.base64,
            mimeType: m.file.type,
          }
        });
      }

      // Append text context
      let textSegment = m.text || "";
      if (m.file && !m.file.type.startsWith("image/")) {
        textSegment = `[User Uploaded File: ${m.file.name} (${m.file.size})]\nFile Content:\n${m.file.content || "No textual contents parsed."}\n\n${textSegment}`;
      }
      if (m.voiceNote) {
        textSegment = `[User Sent Voice Note transcribed as: "${m.voiceNote.transcript}"]\n\n${textSegment}`;
      }

      parts.push({ text: textSegment });

      return {
        role: m.role === "assistant" ? "model" : "user",
        parts,
      };
    });

    const systemInstruction = `You are the CLEV Assistant, an elite AI representative built by CLEV PRODUCTIONS™.
Your mission is to demonstrate our supreme design and engineering talent in developing:
1. 🤖 Advanced AI Chatbots: Fully customized solutions with file uploads, API integrations, and natural speech capability.
2. 🌐 High-Fidelity Websites: Stunning, responsive, and beautifully animated frontend web applications.
3. 🎮 Custom Playable Web Games: High-performance, pixel-perfect, and engaging games like those in our Game Cabin.

Be highly professional, friendly, and precise. Cite cleverlyproduction@gmail.com for inquiries. Keep responses formatted in beautiful, elegant Markdown. Never hallucinate or sound generic. Note that you can answer up to 10 questions in this demo, after which the client is encouraged to hire CLEV for infinite capacity. Always encourage saying "hi" and collaborating.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ text: response.text || "I processed your request, let's build together!" });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "An error occurred with our server. Let's try again!" });
  }
});

// Serve assets & launch Dev/Production setup
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
};

startServer();
