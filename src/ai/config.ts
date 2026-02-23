/** AI 配置管理 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.bazi-master');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface AiConfig {
  provider?: string; // openai / anthropic / ...
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

/** 读取配置 */
export function loadConfig(): AiConfig {
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as AiConfig;
  } catch {
    return {};
  }
}

/** 保存配置 */
export function saveConfig(config: AiConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/** 设置单个配置项 */
export function setConfigValue(key: string, value: string): void {
  const config = loadConfig();
  (config as Record<string, string>)[key] = value;
  saveConfig(config);
}

/** 获取配置项 */
export function getConfigValue(key: string): string | undefined {
  const config = loadConfig();
  return (config as Record<string, string>)[key];
}
