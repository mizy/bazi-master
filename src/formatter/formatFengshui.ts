/**
 * 九宫飞星风水彩色终端输出
 */

import chalk from 'chalk';
import type { FengshuiResult, FlyingStarInfo } from '../fengshui/types.js';

const LUCK_COLOR: Record<string, (s: string) => string> = {
  '大吉': chalk.bold.green,
  '吉': chalk.green,
  '凶': chalk.red,
  '大凶': chalk.bold.red,
};

function colorLuck(luck: string): string {
  return (LUCK_COLOR[luck] || chalk.white)(luck);
}

/** 格式化本命卦信息 */
function formatMingGua(result: FengshuiResult): string {
  const { mingGua } = result;
  const groupColor = mingGua.group === '东四命' ? chalk.green : chalk.yellow;
  return [
    `  命卦: ${chalk.bold.yellow(mingGua.name + '卦')}  五行: ${chalk.cyan(mingGua.wuxing)}  ${groupColor(mingGua.group)}`,
  ].join('\n');
}

/** 格式化八宅吉凶方位 */
function formatDirections(result: FengshuiResult): string {
  const lines: string[] = [];
  const lucky = result.directions.filter(d => d.type === '吉');
  const unlucky = result.directions.filter(d => d.type === '凶');

  lines.push(chalk.green('  ■ 吉位'));
  for (const d of lucky) {
    lines.push(`    ${chalk.green(d.name.padEnd(4, '　'))} ${d.direction.padEnd(3, '　')} ${chalk.dim(d.description)}`);
  }
  lines.push('');
  lines.push(chalk.red('  ■ 凶位'));
  for (const d of unlucky) {
    lines.push(`    ${chalk.red(d.name.padEnd(4, '　'))} ${d.direction.padEnd(3, '　')} ${chalk.dim(d.description)}`);
  }

  return lines.join('\n');
}

/** 计算字符串显示宽度（中文占2） */
function displayWidth(s: string): number {
  const clean = s.replace(/\x1b\[[0-9;]*m/g, '');
  let w = 0;
  for (const ch of clean) {
    w += ch.charCodeAt(0) > 0x7f ? 2 : 1;
  }
  return w;
}

function padCenter(s: string, width: number): string {
  const diff = width - displayWidth(s);
  if (diff <= 0) return s;
  const left = Math.floor(diff / 2);
  return ' '.repeat(left) + s + ' '.repeat(diff - left);
}

/**
 * 九宫飞星网格按洛书方位排列：
 *   东南(巽) | 正南(离) | 西南(坤)
 *   正东(震) | 中宫     | 正西(兑)
 *   东北(艮) | 正北(坎) | 西北(乾)
 */
const GRID_LAYOUT = [
  ['东南', '南', '西南'],
  ['东', '中宫', '西'],
  ['东北', '北', '西北'],
];

/** 格式化九宫飞星图 */
function formatFlyingStarGrid(stars: FlyingStarInfo[], year: number): string {
  // 按方位索引
  const byDir = new Map<string, FlyingStarInfo>();
  for (const s of stars) byDir.set(s.direction, s);

  const CW = 10; // cell width
  const lines: string[] = [];

  lines.push(`  ${chalk.bold(`${year}年 流年九宫飞星`)}`);
  lines.push('');

  // 顶部边框
  lines.push(chalk.dim(`  ┌${'─'.repeat(CW)}┬${'─'.repeat(CW)}┬${'─'.repeat(CW)}┐`));

  for (let row = 0; row < 3; row++) {
    const dirLine: string[] = [];
    const starLine: string[] = [];
    const luckLine: string[] = [];

    for (let col = 0; col < 3; col++) {
      const dir = GRID_LAYOUT[row]![col]!;
      const info = byDir.get(dir);

      if (info) {
        const color = LUCK_COLOR[info.luck] || chalk.white;
        dirLine.push(padCenter(chalk.dim(dir), CW));
        // 星名：取简称（如"四绿"）
        const shortName = info.starName.slice(0, 2);
        starLine.push(padCenter(color(shortName), CW));
        // 全名+吉凶
        const fullLabel = info.starName.slice(2) + colorLuck(info.luck);
        luckLine.push(padCenter(fullLabel, CW));
      } else {
        dirLine.push(' '.repeat(CW));
        starLine.push(' '.repeat(CW));
        luckLine.push(' '.repeat(CW));
      }
    }

    const sep = chalk.dim('│');
    lines.push(`  ${sep}${dirLine.join(sep)}${sep}`);
    lines.push(`  ${sep}${starLine.join(sep)}${sep}`);
    lines.push(`  ${sep}${luckLine.join(sep)}${sep}`);

    if (row < 2) {
      lines.push(chalk.dim(`  ├${'─'.repeat(CW)}┼${'─'.repeat(CW)}┼${'─'.repeat(CW)}┤`));
    }
  }

  // 底部边框
  lines.push(chalk.dim(`  └${'─'.repeat(CW)}┴${'─'.repeat(CW)}┴${'─'.repeat(CW)}┘`));

  return lines.join('\n');
}

/** @entry 格式化风水分析报告 */
export function formatFengshui(result: FengshuiResult): string {
  const sections: string[] = [];
  const HR = chalk.dim('─'.repeat(42));

  sections.push(chalk.bold('  🧭 风水方位分析'));
  sections.push(HR);

  // 本命卦
  sections.push(formatMingGua(result));
  sections.push('');

  // 八宅吉凶
  sections.push(chalk.bold('  八宅吉凶方位'));
  sections.push(formatDirections(result));
  sections.push('');

  // 九宫飞星
  sections.push(formatFlyingStarGrid(result.flyingStars, result.year));
  sections.push('');

  sections.push(chalk.dim('  仅供娱乐参考，信则有不信则无'));

  return sections.join('\n');
}
