/**
 * 八字排盘彩色终端输出
 * 五行配色：木=绿 火=红 土=黄 金=白 水=蓝
 */

import chalk from 'chalk';
import type { BaziResult, WuxingCount } from '../bazi/types.js';
import { WUXING_OF_GAN, WUXING_OF_ZHI } from '../bazi/ganzhi.js';

const WUXING_COLOR: Record<string, (s: string) => string> = {
  木: chalk.green,
  火: chalk.red,
  土: chalk.yellow,
  金: chalk.white,
  水: chalk.blue,
};

/** 给天干上色 */
function colorGan(gan: string): string {
  const wx = WUXING_OF_GAN[gan];
  return WUXING_COLOR[wx](gan);
}

/** 给地支上色 */
function colorZhi(zhi: string): string {
  const wx = WUXING_OF_ZHI[zhi];
  return WUXING_COLOR[wx](zhi);
}

/** 给五行文字上色 */
export function colorWuxing(wx: string): string {
  return (WUXING_COLOR[wx] || chalk.white)(wx);
}

/** 格式化四柱排盘（天干一行、地支一行） */
export function formatPillarChart(bazi: BaziResult): string {
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  const labels = ['年柱', '月柱', '日柱', '时柱'];

  const header = labels.map((l) => `  ${l}  `).join('');
  const ganLine = pillars.map((p) => `  ${colorGan(p.gan)}    `).join('');
  const zhiLine = pillars.map((p) => `  ${colorZhi(p.zhi)}    `).join('');
  const nayinLine = bazi.napieces.map((n) => ` ${n} `).join('');

  return [
    chalk.dim(header),
    ganLine,
    zhiLine,
    chalk.dim(nayinLine),
  ].join('\n');
}

/** 格式化五行统计进度条 */
export function formatWuxingBar(count: WuxingCount): string {
  const keys = ['木', '火', '土', '金', '水'] as const;
  const maxVal = Math.max(...keys.map((k) => count[k]), 1);

  return keys
    .map((k) => {
      const val = count[k];
      const filled = Math.round((val / maxVal) * 8);
      const bar = '■'.repeat(filled) + '□'.repeat(8 - filled);
      const color = WUXING_COLOR[k];
      return `  ${color(k)} ${color(bar)} ${val.toFixed(1)}`;
    })
    .join('\n');
}

/** 格式化五行旺衰分析 */
export function formatWuxingAnalysis(bazi: BaziResult): string {
  const { wuxing } = bazi;
  const lines: string[] = [];

  lines.push(`日主: ${colorGan(bazi.dayMaster)}（${colorWuxing(wuxing.dayMasterWuxing)}）`);
  lines.push(`身${wuxing.isStrong ? chalk.red('强') : chalk.blue('弱')}`);
  lines.push(`最旺: ${colorWuxing(wuxing.dominant)}  最弱: ${colorWuxing(wuxing.weak)}`);

  if (wuxing.missing.length > 0) {
    lines.push(`五行缺: ${wuxing.missing.map(colorWuxing).join(' ')}`);
  } else {
    lines.push(chalk.green('五行俱全'));
  }

  lines.push(`喜神: ${colorWuxing(wuxing.xiShen)}  用神: ${colorWuxing(wuxing.yongShen)}`);

  return lines.join('\n');
}
