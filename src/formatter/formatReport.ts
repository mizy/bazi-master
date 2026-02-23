/**
 * 完整八字报告格式
 */

import chalk from 'chalk';
import type { BaziResult } from '../bazi/types.js';
import {
  formatPillarChart,
  formatWuxingBar,
  formatWuxingAnalysis,
} from './formatBazi.js';

const HR = chalk.dim('─'.repeat(40));

/** 生成完整八字报告 */
export function formatBaziReport(
  bazi: BaziResult,
  date: { year: number; month: number; day: number; hour: number },
): string {
  const sections: string[] = [];

  // 标题
  sections.push(chalk.bold('  ☰ 八字排盘'));
  sections.push(HR);

  // 出生信息
  const h = String(date.hour).padStart(2, '0');
  sections.push(
    chalk.dim(`  公历 ${date.year}年${date.month}月${date.day}日 ${h}时`),
  );
  sections.push('');

  // 四柱排盘
  sections.push(formatPillarChart(bazi));
  sections.push('');
  sections.push(HR);

  // 五行统计
  sections.push(chalk.bold('  五行力量'));
  sections.push('');
  sections.push(formatWuxingBar(bazi.wuxing.count));
  sections.push('');
  sections.push(HR);

  // 五行分析
  sections.push(chalk.bold('  命局分析'));
  sections.push('');
  sections.push(formatWuxingAnalysis(bazi));
  sections.push('');
  sections.push(HR);

  // 免责
  sections.push(chalk.dim('  仅供娱乐参考，命由己造'));

  return sections.join('\n');
}
