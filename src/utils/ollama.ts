import { readFile } from "node:fs/promises";

interface VLMJudgeParams {
  model: string;
  screenshotPath: string;
  prompt: string;
}

export async function vlmJudge({
  model,
  screenshotPath,
  prompt
}: VLMJudgeParams): Promise<string> {
  try {
    const buf = await readFile(screenshotPath);
    const b64 = buf.toString("base64");
    
    const ollamaHost = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
    
    const res = await fetch(`${ollamaHost}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: prompt,
            images: [b64]
          }
        ],
        stream: false,
        options: {
          temperature: 0.1,
          seed: 42
        }
      })
    });
    
    if (!res.ok) {
      throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
    }
    
    const data = await res.json() as any;
    const text = data.message?.content ?? "";
    
    return text.trim();
  } catch (error) {
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      throw new Error(
        "Cannot connect to Ollama. Please ensure Ollama is running at " +
        (process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434")
      );
    }
    throw error;
  }
}

export async function checkOllamaAvailability(model: string = "llava:13b"): Promise<boolean> {
  try {
    const ollamaHost = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
    const res = await fetch(`${ollamaHost}/api/tags`);
    
    if (!res.ok) {
      return false;
    }
    
    const data = await res.json() as any;
    const models = data.models || [];
    
    return models.some((m: any) => 
      m.name === model || m.name.startsWith(model.split(':')[0])
    );
  } catch {
    return false;
  }
}