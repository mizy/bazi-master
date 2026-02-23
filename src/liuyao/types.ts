/** 单爻 */
export interface Yao {
  position: number; // 爻位 1-6（初爻到上爻）
  value: number; // 6=老阴, 7=少阳, 8=少阴, 9=老阳
  yin: boolean; // 是否阴爻
  changing: boolean; // 是否动爻
  dizhi: string; // 所配地支
  wuxing: string; // 五行
  liuqin: string; // 六亲
}

/** 卦信息 */
export interface HexagramInfo {
  name: string; // 卦名
  symbol: string; // 卦象（如 ☰）
  gua: number[]; // 爻数组 [初爻...上爻]
  upperTrigram: string; // 上卦
  lowerTrigram: string; // 下卦
}

/** 六爻排盘结果 */
export interface LiuyaoResult {
  mainHexagram: HexagramInfo; // 本卦
  changedHexagram: HexagramInfo | null; // 变卦
  yaos: Yao[]; // 六爻详情
  shiYao: number; // 世爻位置
  yingYao: number; // 应爻位置
  date: { year: string; month: string; day: string }; // 起卦日期干支
}
