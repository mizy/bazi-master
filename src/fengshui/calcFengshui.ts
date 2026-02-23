/** 九宫飞星风水算法 @entry */

import type {
  FengshuiResult,
  MingGua,
  DirectionInfo,
  FlyingStarInfo,
} from './types.js';
import { solarToLunar } from '../utils/lunarCalendar.js';

// ─── 卦数 → 卦名/五行 ───

const GUA_MAP: Record<number, { name: string; wuxing: string }> = {
  1: { name: '坎', wuxing: '水' },
  2: { name: '坤', wuxing: '土' },
  3: { name: '震', wuxing: '木' },
  4: { name: '巽', wuxing: '木' },
  6: { name: '乾', wuxing: '金' },
  7: { name: '兑', wuxing: '金' },
  8: { name: '艮', wuxing: '土' },
  9: { name: '离', wuxing: '火' },
};

const EAST_GROUP = new Set([1, 3, 4, 9]);

// ─── 八宅吉凶方位表（翻卦法推导，已验证对称性）───
// 方位顺序：北(坎)、东北(艮)、东(震)、东南(巽)、南(离)、西南(坤)、西(兑)、西北(乾)

const DIRECTIONS = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];

type StarEntry = [string, '吉' | '凶', string];

const BAZHAI: Record<number, StarEntry[]> = {
  1: [ // 坎
    ['伏位', '吉', '平稳安定'],
    ['五鬼', '凶', '灾祸频生'],
    ['天医', '吉', '健康财运'],
    ['生气', '吉', '生机旺盛'],
    ['延年', '吉', '长寿和合'],
    ['绝命', '凶', '最凶之位'],
    ['祸害', '凶', '口舌病灾'],
    ['六煞', '凶', '桃花是非'],
  ],
  2: [ // 坤
    ['绝命', '凶', '最凶之位'],
    ['生气', '吉', '生机旺盛'],
    ['祸害', '凶', '口舌病灾'],
    ['五鬼', '凶', '灾祸频生'],
    ['六煞', '凶', '桃花是非'],
    ['伏位', '吉', '平稳安定'],
    ['天医', '吉', '健康财运'],
    ['延年', '吉', '长寿和合'],
  ],
  3: [ // 震
    ['天医', '吉', '健康财运'],
    ['六煞', '凶', '桃花是非'],
    ['伏位', '吉', '平稳安定'],
    ['延年', '吉', '长寿和合'],
    ['生气', '吉', '生机旺盛'],
    ['祸害', '凶', '口舌病灾'],
    ['绝命', '凶', '最凶之位'],
    ['五鬼', '凶', '灾祸频生'],
  ],
  4: [ // 巽
    ['生气', '吉', '生机旺盛'],
    ['绝命', '凶', '最凶之位'],
    ['延年', '吉', '长寿和合'],
    ['伏位', '吉', '平稳安定'],
    ['天医', '吉', '健康财运'],
    ['五鬼', '凶', '灾祸频生'],
    ['六煞', '凶', '桃花是非'],
    ['祸害', '凶', '口舌病灾'],
  ],
  6: [ // 乾
    ['六煞', '凶', '桃花是非'],
    ['天医', '吉', '健康财运'],
    ['五鬼', '凶', '灾祸频生'],
    ['祸害', '凶', '口舌病灾'],
    ['绝命', '凶', '最凶之位'],
    ['延年', '吉', '长寿和合'],
    ['生气', '吉', '生机旺盛'],
    ['伏位', '吉', '平稳安定'],
  ],
  7: [ // 兑
    ['祸害', '凶', '口舌病灾'],
    ['延年', '吉', '长寿和合'],
    ['绝命', '凶', '最凶之位'],
    ['六煞', '凶', '桃花是非'],
    ['五鬼', '凶', '灾祸频生'],
    ['天医', '吉', '健康财运'],
    ['伏位', '吉', '平稳安定'],
    ['生气', '吉', '生机旺盛'],
  ],
  8: [ // 艮
    ['五鬼', '凶', '灾祸频生'],
    ['伏位', '吉', '平稳安定'],
    ['六煞', '凶', '桃花是非'],
    ['绝命', '凶', '最凶之位'],
    ['祸害', '凶', '口舌病灾'],
    ['生气', '吉', '生机旺盛'],
    ['延年', '吉', '长寿和合'],
    ['天医', '吉', '健康财运'],
  ],
  9: [ // 离
    ['延年', '吉', '长寿和合'],
    ['祸害', '凶', '口舌病灾'],
    ['生气', '吉', '生机旺盛'],
    ['天医', '吉', '健康财运'],
    ['伏位', '吉', '平稳安定'],
    ['六煞', '凶', '桃花是非'],
    ['五鬼', '凶', '灾祸频生'],
    ['绝命', '凶', '最凶之位'],
  ],
};

// ─── 九星信息 ───

const NINE_STARS: Record<number, { name: string; luck: '大吉' | '吉' | '凶' | '大凶' }> = {
  1: { name: '一白贪狼', luck: '吉' },
  2: { name: '二黑巨门', luck: '凶' },
  3: { name: '三碧禄存', luck: '凶' },
  4: { name: '四绿文曲', luck: '吉' },
  5: { name: '五黄廉贞', luck: '大凶' },
  6: { name: '六白武曲', luck: '吉' },
  7: { name: '七赤破军', luck: '凶' },
  8: { name: '八白左辅', luck: '大吉' },
  9: { name: '九紫右弼', luck: '吉' },
};

// 洛书飞星轨迹：中→乾(西北)→兑(西)→艮(东北)→离(南)→坎(北)→坤(西南)→震(东)→巽(东南)
// 宫位索引：0北,1东北,2东,3东南,4南,5西南,6西,7西北,8中
const FLY_ORDER = [8, 7, 6, 1, 4, 0, 5, 2, 3];

const PALACE_NAMES = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾', '中'];
const PALACE_DIRS = ['北', '东北', '东', '东南', '南', '西南', '西', '西北', '中宫'];

// ─── 工具函数 ───

/** 数字各位相加至一位数 */
function digitSum(n: number): number {
  while (n >= 10) {
    let s = 0;
    let v = n;
    while (v > 0) {
      s += v % 10;
      v = Math.floor(v / 10);
    }
    n = s;
  }
  return n;
}

// ─── 本命卦 ───

function calcMingGua(year: number, gender: 'male' | 'female'): MingGua {
  const lastTwo = year >= 2000 ? year - 2000 : year % 100;
  const s = digitSum(lastTwo);

  let guaNum: number;

  if (gender === 'male') {
    guaNum = year >= 2000 ? 9 - s : 10 - s;
    if (guaNum <= 0) guaNum += 9;
    if (guaNum === 5) guaNum = 2; // 男归坤
  } else {
    guaNum = year >= 2000 ? s + 6 : s + 5;
    if (guaNum > 9) guaNum -= 9;
    if (guaNum === 5) guaNum = 8; // 女归艮
    if (guaNum === 0) guaNum = 9;
  }

  const gua = GUA_MAP[guaNum]!;
  return {
    number: guaNum,
    name: gua.name,
    wuxing: gua.wuxing,
    group: EAST_GROUP.has(guaNum) ? '东四命' : '西四命',
  };
}

// ─── 八宅方位 ───

function calcDirections(guaNum: number): DirectionInfo[] {
  return BAZHAI[guaNum]!.map(([name, type, description], i) => ({
    direction: DIRECTIONS[i]!,
    type,
    name,
    description,
  }));
}

// ─── 流年九宫飞星 ───

function calcCenterStar(year: number): number {
  const s = digitSum(year);
  let center = 11 - s;
  if (center > 9) center -= 9;
  return center;
}

function calcFlyingStars(year: number): FlyingStarInfo[] {
  const center = calcCenterStar(year);
  const grid: FlyingStarInfo[] = [];

  for (let i = 0; i < 9; i++) {
    const posIdx = FLY_ORDER[i]!;
    const starNum = ((center - 1 + i) % 9) + 1;
    const info = NINE_STARS[starNum]!;

    grid.push({
      palace: PALACE_NAMES[posIdx]!,
      direction: PALACE_DIRS[posIdx]!,
      star: starNum,
      starName: info.name,
      luck: info.luck,
    });
  }

  return grid;
}

// ─── 主函数 ───

/** 风水方位分析 — 本命卦 + 八宅吉凶 + 流年九宫飞星 */
export function calcFengshui(
  year: number,
  month: number,
  day: number,
  gender: 'male' | 'female',
): FengshuiResult {
  // 本命卦基于农历年（春节前出生属上一年）
  const lunar = solarToLunar(year, month, day);
  const mingGua = calcMingGua(lunar.lunarYear, gender);
  const directions = calcDirections(mingGua.number);
  // 流年飞星使用阳历年（当年运势）
  const flyingStars = calcFlyingStars(year);

  return { mingGua, directions, flyingStars, year };
}
