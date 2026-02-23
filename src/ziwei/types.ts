/** 星曜类型 */
export type StarType = 'main' | 'lucky' | 'evil';

/** 阴阳 */
export type YinYang = '阴' | '阳';

/** 五行 */
export type Wuxing = '金' | '木' | '水' | '火' | '土';

/** 五行局数 */
export type WuxingJu = 2 | 3 | 4 | 5 | 6;

/** 星曜 */
export interface Star {
  name: string;
  type: StarType;
  yinyang?: YinYang;
  wuxing?: Wuxing;
  brightness?: string; // 庙/旺/得地/利/平/不得地/落陷
}

/** 宫位信息 */
export interface ZiweiPalace {
  name: string;         // 宫名（命宫、兄弟等）
  gan: string;          // 天干
  zhi: string;          // 地支
  mainStars: Star[];    // 主星
  luckyStars: Star[];   // 吉星
  evilStars: Star[];    // 煞星
}

/** 紫微斗数排盘结果 */
export interface ZiweiResult {
  palaces: ZiweiPalace[];   // 十二宫
  mingGongIndex: number;    // 命宫索引
  shenGongIndex: number;    // 身宫索引
  wuxingJu: WuxingJu;      // 五行局
  mingZhu: string;          // 命主星
  shenZhu: string;          // 身主星
}

/** 兼容旧接口 */
export type PalaceInfo = ZiweiPalace;
