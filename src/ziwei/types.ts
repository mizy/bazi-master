/** 紫微斗数排盘结果 (placeholder) */
export interface ZiweiResult {
  mingGong: string; // 命宫
  shenGong: string; // 身宫
  palaces: PalaceInfo[]; // 十二宫
}

export interface PalaceInfo {
  name: string; // 宫名
  dizhi: string; // 地支
  mainStars: string[]; // 主星
  minorStars: string[]; // 辅星
}
