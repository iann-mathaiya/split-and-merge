import path from "node:path"
import { zerox } from "zerox"
import type { ModelOptions } from "zerox/node-zerox/dist/types"

export async function runOCR(filePath: string) {
    const result = await zerox({
      filePath: path.resolve(__dirname, filePath),
      openaiAPIKey: process.env.OPENAI_API_KEY,
      cleanup: true,
      concurrency: 20,
      maintainFormat: true,
      outputDir: undefined,
      model: 'gpt-4o-mini' as ModelOptions,
    })
  
    return result
  }