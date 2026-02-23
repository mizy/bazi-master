/**
 * 紫微斗数排盘彩色终端输出
 * 以传统 4×3 网格布局展示十二宫
 */

import chalk from 'chalk';
import type { ZiweiResult, ZiweiPalace } from '../ziwei/types.js';
import { WUXING_JU_NAMES } from '../ziwei/stars.js';

const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/**
 * 传统排盘图十二宫位置映射
 * 排盘图按 4列×4行 网格，十二宫排列如下（中间4格为空）：
 *
 *   巳(5)  午(6)  未(7)  申(8)
 *   辰(4)              酉(9)
 *   卯(3)              戌(10)
 *   寅(2)  丑(1)  子(0)  亥(11)
 *
 * 用 [row][col] 表示位置，row 0=顶部
 */
const GRID_POSITIONS: [number, number, number][] = [
  // [zhiIdx, row, col]
  [5, 0, 0], [6, 0, 1], [7, 0, 2], [8, 0, 3],
  [4, 1, 0],                                     [9, 1, 3],
  [3, 2, 0],                                     [10, 2, 3],
  [2, 3, 0], [1, 3, 1], [0, 3, 2], [11, 3, 3],
];

/** 每格宽度（字符数，全角按2算） */
const CELL_W = 10;

/** 将字符串补齐到指定显示宽度（考虑中文字符占2宽） */
function displayWidth(s: string): number {
  // strip ANSI codes for width calculation
  const clean = s.replace(/\x1b\[[0-9;]*m/g, '');
  let w = 0;
  for (const ch of clean) {
    w += ch.charCodeAt(0) > 0x7f ? 2 : 1;
  }
  return w;
}

function padEnd(s: string, width: number): string {
  const diff = width - displayWidth(s);
  return diff > 0 ? s + ' '.repeat(diff) : s;
}

function padCenter(s: string, width: number): string {
  const diff = width - displayWidth(s);
  if (diff <= 0) return s;
  const left = Math.floor(diff / 2);
  return ' '.repeat(left) + s + ' '.repeat(diff - left);
}

/** 格式化单个宫位内容（多行文本） */
function formatPalaceCell(palace: ZiweiPalace, isMing: boolean, isShen: boolean): string[] {
  const lines: string[] = [];

  // 第一行：主星（亮色）
  const mainNames = palace.mainStars.map(s => chalk.bold.yellow(s.name)).join(' ');
  lines.push(mainNames || chalk.dim('—'));

  // 第二行：吉星（暗色）
  if (palace.luckyStars.length > 0) {
    lines.push(chalk.cyan(palace.luckyStars.map(s => s.name).join(' ')));
  }

  // 第三行：宫名
  let label = palace.name;
  if (isShen) label = `[${label}·身]`;
  else label = `[${label}]`;
  lines.push(chalk.green(label));

  return lines;
}

/** 构建排盘网格 */
function buildGrid(result: ZiweiResult): string {
  const { palaces, mingGongIndex, shenGongIndex } = result;

  // 准备每个宫位的渲染内容 (4 行 lines)
  const cellContent: Map<string, string[]> = new Map();
  const MAX_LINES = 3;

  for (const [zhiIdx, row, col] of GRID_POSITIONS) {
    const p = palaces[zhiIdx];
    const isMing = zhiIdx === mingGongIndex;
    const isShen = zhiIdx === shenGongIndex;
    const lines = formatPalaceCell(p, isMing, isShen);
    // pad to MAX_LINES
    while (lines.length < MAX_LINES) lines.push('');
    cellContent.set(`${row},${col}`, lines);
  }

  const output: string[] = [];

  // 绘制4行，每行之间有分隔线
  for (let row = 0; row < 4; row++) {
    // 顶部边框
    if (row === 0) {
      const headers = [];
      for (let col = 0; col < 4; col++) {
        const zhiEntry = GRID_POSITIONS.find(([, r, c]) => r === row && c === col);
        const zhi = zhiEntry ? DI_ZHI[zhiEntry[0]] : ' ';
        headers.push(`──${zhi}宫──`);
      }
      output.push(chalk.dim(`┌${headers.join('┬')}┐`));
    } else {
      // 中间分隔线
      const segments = [];
      for (let col = 0; col < 4; col++) {
        const hasCell = GRID_POSITIONS.some(([, r, c]) => r === row && c === col);
        const hadCellAbove = GRID_POSITIONS.some(([, r, c]) => r === row - 1 && c === col);
        if (hasCell || hadCellAbove) {
          const zhiEntry = GRID_POSITIONS.find(([, r, c]) => r === row && c === col);
          if (zhiEntry) {
            const zhi = DI_ZHI[zhiEntry[0]];
            segments.push(`──${zhi}宫──`);
          } else {
            segments.push('────────');
          }
        } else {
          segments.push('        ');
        }
      }
      // 连接符
      const line = segments.map((seg, i) => {
        const leftHas = i === 0 || GRID_POSITIONS.some(([, r, c]) => (r === row || r === row - 1) && c === i - 1);
        return seg;
      });
      output.push(chalk.dim(`├${line.join('┼')}┤`));
    }

    // 内容行
    for (let lineIdx = 0; lineIdx < MAX_LINES; lineIdx++) {
      let rowStr = chalk.dim('│');
      for (let col = 0; col < 4; col++) {
        const key = `${row},${col}`;
        const content = cellContent.get(key);
        if (content) {
          rowStr += padEnd(padCenter(content[lineIdx], CELL_W), CELL_W);
        } else {
          rowStr += ' '.repeat(CELL_W);
        }
        rowStr += chalk.dim('│');
      }
      output.push(rowStr);
    }
  }

  // 底部边框
  output.push(chalk.dim(`└${'────────┴────────┴────────┴────────'}┘`));

  return output.join('\n');
}

/** @entry 格式化紫微斗数排盘报告 */
export function formatZiwei(result: ZiweiResult): string {
  const sections: string[] = [];
  const HR = chalk.dim('─'.repeat(42));

  sections.push(chalk.bold('  🔮 紫微斗数排盘'));
  sections.push(HR);

  // 基本信息
  const mingPalace = result.palaces[result.mingGongIndex];
  const shenPalace = result.palaces[result.shenGongIndex];
  const juName = WUXING_JU_NAMES[result.wuxingJu];

  sections.push(`  命宫: ${chalk.yellow(mingPalace.gan + mingPalace.zhi)}  身宫: ${chalk.yellow(shenPalace.gan + shenPalace.zhi)}  ${chalk.cyan(juName)}`);
  sections.push(`  命主: ${chalk.yellow(result.mingZhu)}  身主: ${chalk.yellow(result.shenZhu)}`);
  sections.push('');

  // 排盘图
  sections.push(buildGrid(result));
  sections.push('');

  sections.push(chalk.dim('  仅供娱乐参考，信则有不信则无'));

  return sections.join('\n');
}
