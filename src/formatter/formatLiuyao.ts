/**
 * 六爻卦象终端格式化输出
 */

import chalk from 'chalk';
import type { Yao, HexagramInfo } from '../liuyao/types.js';

const HR = chalk.dim('─'.repeat(40));

/** 格式化单爻 */
function formatYaoLine(yao: Yao): string {
  const pos = ['初', '二', '三', '四', '五', '上'][yao.position - 1];
  const label = yao.yin ? `${pos}爻` : `${pos}爻`;

  if (yao.yin) {
    // 阴爻: ━━  ━━
    const line = yao.changing
      ? chalk.red('━━ ✕ ━━') // 老阴动爻
      : chalk.cyan('━━   ━━');
    return `  ${line}  ${chalk.dim(label)}${yao.changing ? chalk.red(' 动') : ''}`;
  } else {
    // 阳爻: ━━━━━
    const line = yao.changing
      ? chalk.red('━━━○━━━') // 老阳动爻
      : chalk.white('━━━━━━━');
    return `  ${line}  ${chalk.dim(label)}${yao.changing ? chalk.red(' 动') : ''}`;
  }
}

/** 格式化卦象 */
function formatHexagram(info: HexagramInfo, yaos: Yao[]): string {
  const lines: string[] = [];
  // 从上爻到初爻显示（上方为上爻）
  for (let i = 5; i >= 0; i--) {
    lines.push(formatYaoLine(yaos[i]));
    if (i === 3) {
      // 上下卦分界
      lines.push(chalk.dim('         ───'));
    }
  }
  return lines.join('\n');
}

/** 六爻起卦结果 */
export interface LiuyaoFormatInput {
  mainHexagram: HexagramInfo;
  changedHexagram: HexagramInfo | null;
  yaos: Yao[];
  question?: string;
  guaci: string;
  meaning: string;
  changedGuaci?: string;
  changedMeaning?: string;
}

/** 格式化六爻报告 */
export function formatLiuyaoReport(result: LiuyaoFormatInput): string {
  const sections: string[] = [];

  // 标题
  sections.push(chalk.bold('  ☰ 六爻起卦'));
  sections.push(HR);

  // 问题
  if (result.question) {
    sections.push(chalk.dim(`  所问: ${result.question}`));
    sections.push('');
  }

  // 本卦
  sections.push(chalk.bold(`  本卦: ${chalk.yellow(result.mainHexagram.name)}`));
  sections.push(chalk.dim(`  ${result.mainHexagram.symbol}  上${result.mainHexagram.upperTrigram} 下${result.mainHexagram.lowerTrigram}`));
  sections.push('');
  sections.push(formatHexagram(result.mainHexagram, result.yaos));
  sections.push('');
  sections.push(HR);

  // 卦辞
  sections.push(chalk.bold('  卦辞'));
  sections.push(`  ${chalk.italic(result.guaci)}`);
  sections.push(`  ${result.meaning}`);
  sections.push('');

  // 变卦
  if (result.changedHexagram) {
    sections.push(HR);
    sections.push(chalk.bold(`  变卦: ${chalk.yellow(result.changedHexagram.name)}`));
    sections.push(chalk.dim(`  ${result.changedHexagram.symbol}  上${result.changedHexagram.upperTrigram} 下${result.changedHexagram.lowerTrigram}`));
    sections.push('');

    // 变卦爻线
    const changedYaos = result.yaos.map((y) => ({
      ...y,
      yin: y.changing ? !y.yin : y.yin,
      changing: false,
    }));
    sections.push(formatHexagram(result.changedHexagram, changedYaos));
    sections.push('');

    if (result.changedGuaci) {
      sections.push(chalk.bold('  变卦辞'));
      sections.push(`  ${chalk.italic(result.changedGuaci)}`);
      sections.push(`  ${result.changedMeaning || ''}`);
      sections.push('');
    }
  } else {
    sections.push(chalk.dim('  无动爻，本卦即为结果'));
    sections.push('');
  }

  sections.push(HR);

  // 动爻提示
  const changingYaos = result.yaos.filter((y) => y.changing);
  if (changingYaos.length > 0) {
    const positions = changingYaos
      .map((y) => ['初', '二', '三', '四', '五', '上'][y.position - 1])
      .join('、');
    sections.push(chalk.dim(`  动爻: ${positions}爻`));
  }

  sections.push(chalk.dim('  仅供娱乐参考，信则有不信则无'));

  return sections.join('\n');
}
