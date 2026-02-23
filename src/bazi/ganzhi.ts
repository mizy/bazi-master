/** 十天干 */
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

/** 十二地支 */
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/** 十二时辰名 */
export const SHICHEN_NAMES = [
  '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
  '午时', '未时', '申时', '酉时', '戌时', '亥时',
] as const;

/** 天干→五行 */
export const WUXING_OF_GAN: Record<string, string> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
};

/** 地支→五行 */
export const WUXING_OF_ZHI: Record<string, string> = {
  子: '水', 丑: '土',
  寅: '木', 卯: '木',
  辰: '土', 巳: '火',
  午: '火', 未: '土',
  申: '金', 酉: '金',
  戌: '土', 亥: '水',
};

/** 地支藏干（本气、中气、余气） */
export const ZHI_CANG_GAN: Record<string, string[]> = {
  子: ['癸'],
  丑: ['己', '癸', '辛'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲'],
};

/**
 * 六十甲子纳音表
 * 每两组干支共享一个纳音（共30个纳音）
 */
export const NAYIN_TABLE: string[] = [
  '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木',
  '路旁土', '路旁土', '剑锋金', '剑锋金', '山头火', '山头火',
  '涧下水', '涧下水', '城头土', '城头土', '白蜡金', '白蜡金',
  '杨柳木', '杨柳木', '泉中水', '泉中水', '屋上土', '屋上土',
  '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
  '砂石金', '砂石金', '山下火', '山下火', '平地木', '平地木',
  '壁上土', '壁上土', '金箔金', '金箔金', '覆灯火', '覆灯火',
  '天河水', '天河水', '大驿土', '大驿土', '钗钏金', '钗钏金',
  '桑柘木', '桑柘木', '大溪水', '大溪水', '沙中土', '沙中土',
  '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水',
];

/**
 * 十神关系表
 * key = 日主五行, value = { 目标五行: 十神 }
 * 同阴阳为偏，异阴阳为正
 */
export const SHISHEN_BASE: Record<string, Record<string, string>> = {
  木: { 木: '比劫', 火: '食伤', 土: '财星', 金: '官杀', 水: '印枭' },
  火: { 火: '比劫', 土: '食伤', 金: '财星', 水: '官杀', 木: '印枭' },
  土: { 土: '比劫', 金: '食伤', 水: '财星', 木: '官杀', 火: '印枭' },
  金: { 金: '比劫', 水: '食伤', 木: '财星', 火: '官杀', 土: '印枭' },
  水: { 水: '比劫', 木: '食伤', 火: '财星', 土: '官杀', 金: '印枭' },
};

/** 获取天干索引 */
export function ganIndex(gan: string): number {
  const idx = TIAN_GAN.indexOf(gan as typeof TIAN_GAN[number]);
  if (idx === -1) throw new Error(`无效天干: ${gan}`);
  return idx;
}

/** 获取地支索引 */
export function zhiIndex(zhi: string): number {
  const idx = DI_ZHI.indexOf(zhi as typeof DI_ZHI[number]);
  if (idx === -1) throw new Error(`无效地支: ${zhi}`);
  return idx;
}

/** 根据干支序号获取纳音 */
export function getNayin(ganIdx: number, zhiIdx: number): string {
  const jiazi = (ganIdx % 10) * 12 + (zhiIdx % 12);
  // 六十甲子序号
  const idx60 = ((ganIdx % 10) + (zhiIdx % 12) * 5) % 60;
  // 简化：直接用干支索引计算
  const order = ganZhiOrder(ganIdx, zhiIdx);
  return NAYIN_TABLE[order];
}

/** 计算六十甲子序号 (0-59) */
export function ganZhiOrder(ganIdx: number, zhiIdx: number): number {
  // 天干和地支的最小公倍数周期是60
  // 甲子=0, 乙丑=1, ..., 癸亥=59
  let g = ganIdx % 10;
  let z = zhiIdx % 12;
  // 干支配对必须同奇同偶
  let order = 0;
  while (order < 60) {
    if (order % 10 === g && order % 12 === z) return order;
    order++;
  }
  return 0; // fallback
}
