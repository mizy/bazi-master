/** AI 命理解读 (placeholder) */

import type { BaziResult } from '../bazi/types.js';
import { loadConfig } from './config.js';

/** AI 解读八字 — 功能开发中 */
export async function interpretBazi(_bazi: BaziResult): Promise<string> {
  const config = loadConfig();
  if (!config.apiKey) {
    return '🔮 AI 解读需要先配置 API Key:\n  bazi config set apiKey <your-key>\n  bazi config set provider openai';
  }
  return '🔮 AI 解读功能开发中，敬请期待';
}
