/** @entry CLI 主入口 */
import { Command } from 'commander';
import chalk from 'chalk';
import { parseDate } from './utils/date.js';
import { calcBazi } from './bazi/index.js';
import { calcWuxing } from './bazi/calcWuxing.js';
import { calcLiuyao } from './liuyao/index.js';
import { formatBaziReport } from './formatter/formatReport.js';
import { formatLiuyaoReport } from './formatter/formatLiuyao.js';
import { formatWuxingBar, formatWuxingAnalysis } from './formatter/formatBazi.js';
import { formatZiwei } from './formatter/formatZiwei.js';
import { formatFengshui } from './formatter/formatFengshui.js';
import { calcZiwei } from './ziwei/index.js';
import { calcFengshui } from './fengshui/index.js';
import { interpretBazi } from './ai/interpreter.js';
import { setConfigValue, loadConfig } from './ai/config.js';

const program = new Command();

program
  .name('bazi')
  .description('赛博算命 CLI — 八字 / 六爻 / 紫微 / 风水')
  .version('0.1.0');

// 完整八字分析
program
  .command('analyze')
  .description('完整八字分析')
  .argument('<datetime>', '出生日期时间 (YYYY-MM-DD HH:mm)')
  .option('--ai', 'AI 解读')
  .action(async (datetime: string, opts: { ai?: boolean }) => {
    const parsed = parseDate(datetime);
    const result = calcBazi(parsed.year, parsed.month, parsed.day, parsed.hour);
    console.log('');
    console.log(formatBaziReport(result, {
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      hour: parsed.hour,
    }));
    if (opts.ai) {
      console.log('');
      console.log(chalk.bold('  🤖 AI 解读'));
      console.log(chalk.dim('─'.repeat(40)));
      const aiResult = await interpretBazi(result);
      console.log('  ' + aiResult);
    }
    console.log('');
  });

// 仅五行分析
program
  .command('wuxing')
  .description('五行力量分析')
  .argument('<datetime>', '出生日期时间 (YYYY-MM-DD HH:mm)')
  .action((datetime: string) => {
    const parsed = parseDate(datetime);
    const bazi = calcBazi(parsed.year, parsed.month, parsed.day, parsed.hour);
    console.log('');
    console.log(chalk.bold('  五行力量'));
    console.log('');
    console.log(formatWuxingBar(bazi.wuxing.count));
    console.log('');
    console.log(formatWuxingAnalysis(bazi));
    console.log('');
  });

// 六爻起卦
program
  .command('liuyao')
  .description('六爻起卦')
  .argument('[question]', '所问事项')
  .action((question?: string) => {
    const result = calcLiuyao(question);
    console.log('');
    console.log(formatLiuyaoReport(result));
    console.log('');
  });

// 紫微斗数
program
  .command('ziwei')
  .description('紫微斗数排盘')
  .argument('<datetime>', '出生日期时间 (YYYY-MM-DD HH:mm)')
  .action((datetime: string) => {
    const parsed = parseDate(datetime);
    const result = calcZiwei(parsed.year, parsed.month, parsed.day, parsed.hour);
    console.log('');
    console.log(formatZiwei(result));
    console.log('');
  });

// 风水方位
program
  .command('fengshui')
  .description('风水方位分析')
  .argument('<date>', '出生日期 (YYYY-MM-DD)')
  .option('--gender <gender>', '性别 (male/female)', 'male')
  .action((date: string, opts: { gender: string }) => {
    const parsed = parseDate(date);
    const gender = opts.gender === 'female' ? 'female' : 'male';
    const result = calcFengshui(parsed.year, parsed.month, parsed.day, gender);
    console.log('');
    console.log(formatFengshui(result));
    console.log('');
  });

// 配置管理
const configCmd = program
  .command('config')
  .description('配置管理');

configCmd
  .command('set')
  .description('设置配置项')
  .argument('<key>', '配置键 (provider / apiKey / model / baseUrl)')
  .argument('<value>', '配置值')
  .action((key: string, value: string) => {
    setConfigValue(key, value);
    console.log(chalk.green(`  ✓ 已设置 ${key}`));
  });

configCmd
  .command('show')
  .description('查看当前配置')
  .action(() => {
    const config = loadConfig();
    const entries = Object.entries(config);
    if (entries.length === 0) {
      console.log(chalk.dim('  暂无配置'));
      return;
    }
    console.log('');
    for (const [k, v] of entries) {
      const display = k === 'apiKey' && typeof v === 'string'
        ? v.slice(0, 8) + '...'
        : v;
      console.log(`  ${chalk.bold(k)}: ${display}`);
    }
    console.log('');
  });

program.parse();
