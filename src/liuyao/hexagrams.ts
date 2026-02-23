/**
 * 八卦与六十四卦数据表
 */

/** 八卦 */
export interface Trigram {
  name: string;
  symbol: string;
  lines: number[]; // [下, 中, 上] 1=阳 0=阴
  wuxing: string;
}

export const TRIGRAMS: Trigram[] = [
  { name: '乾', symbol: '☰', lines: [1, 1, 1], wuxing: '金' },
  { name: '兑', symbol: '☱', lines: [1, 1, 0], wuxing: '金' },
  { name: '离', symbol: '☲', lines: [1, 0, 1], wuxing: '火' },
  { name: '震', symbol: '☳', lines: [0, 0, 1], wuxing: '木' },
  { name: '巽', symbol: '☴', lines: [1, 1, 0], wuxing: '木' },
  { name: '坎', symbol: '☵', lines: [0, 1, 0], wuxing: '水' },
  { name: '艮', symbol: '☶', lines: [0, 0, 1], wuxing: '土' },
  { name: '坤', symbol: '☷', lines: [0, 0, 0], wuxing: '土' },
];

// 八卦序号：先天八卦序 乾1 兑2 离3 震4 巽5 坎6 艮7 坤8
// 索引用 0-7 对应上面数组

/** 64卦信息 */
export interface Hexagram {
  name: string;
  upper: number; // 上卦索引 (TRIGRAMS)
  lower: number; // 下卦索引
  guaci: string; // 卦辞
  meaning: string; // 白话简述
}

/**
 * 64卦表，按上卦×下卦索引
 * key = `${upper}-${lower}`
 */
export const HEXAGRAMS: Record<string, Hexagram> = {
  '0-0': { name: '乾为天', upper: 0, lower: 0, guaci: '元亨利贞', meaning: '刚健中正，万物之始' },
  '7-7': { name: '坤为地', upper: 7, lower: 7, guaci: '元亨，利牝马之贞', meaning: '柔顺包容，厚德载物' },
  '5-3': { name: '水雷屯', upper: 5, lower: 3, guaci: '元亨利贞，勿用有攸往', meaning: '初始困难，宜守不宜进' },
  '6-5': { name: '山水蒙', upper: 6, lower: 5, guaci: '亨，匪我求童蒙', meaning: '蒙昧初开，需要启蒙' },
  '5-0': { name: '水天需', upper: 5, lower: 0, guaci: '有孚，光亨，贞吉', meaning: '等待时机，耐心守候' },
  '0-5': { name: '天水讼', upper: 0, lower: 5, guaci: '有孚窒惕，中吉', meaning: '争讼之象，宜和不宜争' },
  '7-5': { name: '地水师', upper: 7, lower: 5, guaci: '贞，丈人吉', meaning: '统率众人，以正治军' },
  '5-7': { name: '水地比', upper: 5, lower: 7, guaci: '吉，原筮元永贞', meaning: '亲近辅佐，和睦相处' },
  '4-0': { name: '风天小畜', upper: 4, lower: 0, guaci: '亨，密云不雨', meaning: '小有蓄积，力量不足' },
  '0-4': { name: '天泽履', upper: 0, lower: 1, guaci: '履虎尾，不咥人，亨', meaning: '如履薄冰，谨慎前行' },
  '7-0': { name: '地天泰', upper: 7, lower: 0, guaci: '小往大来，吉亨', meaning: '天地交泰，万事亨通' },
  '0-7': { name: '天地否', upper: 0, lower: 7, guaci: '否之匪人，不利君子贞', meaning: '闭塞不通，运势不佳' },
  '0-2': { name: '天火同人', upper: 0, lower: 2, guaci: '同人于野，亨', meaning: '志同道合，众人团结' },
  '2-0': { name: '火天大有', upper: 2, lower: 0, guaci: '元亨', meaning: '丰盛富有，前景光明' },
  '7-6': { name: '地山谦', upper: 7, lower: 6, guaci: '亨，君子有终', meaning: '谦虚谨慎，终有好结果' },
  '3-7': { name: '雷地豫', upper: 3, lower: 7, guaci: '利建侯行师', meaning: '和乐愉悦，顺势而为' },
  '1-3': { name: '泽雷随', upper: 1, lower: 3, guaci: '元亨利贞', meaning: '随顺时势，灵活应变' },
  '6-4': { name: '山风蛊', upper: 6, lower: 4, guaci: '元亨，利涉大川', meaning: '事有败坏，需要整治' },
  '7-1': { name: '地泽临', upper: 7, lower: 1, guaci: '元亨利贞，至于八月有凶', meaning: '居高临下，光临大地' },
  '4-7': { name: '风地观', upper: 4, lower: 7, guaci: '盥而不荐，有孚颙若', meaning: '仰观俯察，审时度势' },
  '2-3': { name: '火雷噬嗑', upper: 2, lower: 3, guaci: '亨，利用狱', meaning: '咬碎障碍，明辨是非' },
  '6-2': { name: '山火贲', upper: 6, lower: 2, guaci: '亨，小利有攸往', meaning: '文饰外表，修饰美化' },
  '6-7': { name: '山地剥', upper: 6, lower: 7, guaci: '不利有攸往', meaning: '剥落衰败，不宜前进' },
  '7-3': { name: '地雷复', upper: 7, lower: 3, guaci: '亨，出入无疾', meaning: '一阳来复，否极泰来' },
  '0-3': { name: '天雷无妄', upper: 0, lower: 3, guaci: '元亨利贞', meaning: '纯真自然，不妄为' },
  '6-0': { name: '山天大畜', upper: 6, lower: 0, guaci: '利贞，不家食吉', meaning: '大有蓄积，宜守正道' },
  '6-3': { name: '山雷颐', upper: 6, lower: 3, guaci: '贞吉，观颐', meaning: '养生之道，慎言慎食' },
  '1-4': { name: '泽风大过', upper: 1, lower: 4, guaci: '栋桡，利有攸往', meaning: '力量过大，物极必反' },
  '5-5': { name: '坎为水', upper: 5, lower: 5, guaci: '有孚，维心亨', meaning: '重重险难，以诚破险' },
  '2-2': { name: '离为火', upper: 2, lower: 2, guaci: '利贞，亨', meaning: '光明附丽，依附正道' },
  '1-6': { name: '泽山咸', upper: 1, lower: 6, guaci: '亨利贞，取女吉', meaning: '感应交融，心意相通' },
  '3-4': { name: '雷风恒', upper: 3, lower: 4, guaci: '亨，无咎，利贞', meaning: '恒久之道，持之以恒' },
  '0-6': { name: '天山遁', upper: 0, lower: 6, guaci: '亨，小利贞', meaning: '退避隐遁，以退为进' },
  '3-0': { name: '雷天大壮', upper: 3, lower: 0, guaci: '利贞', meaning: '刚强壮盛，宜守正道' },
  '2-7': { name: '火地晋', upper: 2, lower: 7, guaci: '康侯用锡马蕃庶', meaning: '光明进取，步步高升' },
  '7-2': { name: '地火明夷', upper: 7, lower: 2, guaci: '利艰贞', meaning: '光明受损，韬光养晦' },
  '4-2': { name: '风火家人', upper: 4, lower: 2, guaci: '利女贞', meaning: '家庭和睦，齐家之道' },
  '2-1': { name: '火泽睽', upper: 2, lower: 1, guaci: '小事吉', meaning: '相违背离，求同存异' },
  '5-6': { name: '水山蹇', upper: 5, lower: 6, guaci: '利西南，不利东北', meaning: '行路艰难，迂回前进' },
  '3-5': { name: '雷水解', upper: 3, lower: 5, guaci: '利西南', meaning: '解除困难，春回大地' },
  '6-1': { name: '山泽损', upper: 6, lower: 1, guaci: '有孚，元吉', meaning: '减损自己，利益他人' },
  '4-3': { name: '风雷益', upper: 4, lower: 3, guaci: '利有攸往，利涉大川', meaning: '增益进取，大有作为' },
  '1-0': { name: '泽天夬', upper: 1, lower: 0, guaci: '扬于王庭', meaning: '决断果敢，刚柔并济' },
  '0-1': { name: '天风姤', upper: 0, lower: 4, guaci: '女壮，勿用取女', meaning: '不期而遇，谨防小人' },
  '1-7': { name: '泽地萃', upper: 1, lower: 7, guaci: '亨，王假有庙', meaning: '聚集会合，众志成城' },
  '7-4': { name: '地风升', upper: 7, lower: 4, guaci: '元亨，用见大人', meaning: '步步上升，积少成多' },
  '1-5': { name: '泽水困', upper: 1, lower: 5, guaci: '亨，贞大人吉', meaning: '困顿艰难，以德化解' },
  '5-4': { name: '水风井', upper: 5, lower: 4, guaci: '改邑不改井', meaning: '取之不尽，养人济世' },
  '1-2': { name: '泽火革', upper: 1, lower: 2, guaci: '己日乃孚，元亨利贞', meaning: '变革创新，除旧布新' },
  '2-4': { name: '火风鼎', upper: 2, lower: 4, guaci: '元吉，亨', meaning: '鼎新革故，功成名就' },
  '3-3': { name: '震为雷', upper: 3, lower: 3, guaci: '亨，震来虩虩', meaning: '震动惊惧，警醒反省' },
  '6-6': { name: '艮为山', upper: 6, lower: 6, guaci: '艮其背，不获其身', meaning: '适可而止，知止不殆' },
  '4-6': { name: '风山渐', upper: 4, lower: 6, guaci: '女归吉，利贞', meaning: '循序渐进，稳步前行' },
  '3-1': { name: '雷泽归妹', upper: 3, lower: 1, guaci: '征凶，无攸利', meaning: '仓促行事，结果不佳' },
  '3-2': { name: '雷火丰', upper: 3, lower: 2, guaci: '亨，王假之', meaning: '丰盛盈满，盛极转衰' },
  '2-6': { name: '火山旅', upper: 2, lower: 6, guaci: '小亨，旅贞吉', meaning: '漂泊旅行，谨慎为上' },
  '4-4': { name: '巽为风', upper: 4, lower: 4, guaci: '小亨，利有攸往', meaning: '顺从柔和，以柔制刚' },
  '1-1': { name: '兑为泽', upper: 1, lower: 1, guaci: '亨利贞', meaning: '喜悦交流，言语和善' },
  '4-5': { name: '风水涣', upper: 4, lower: 5, guaci: '亨，王假有庙', meaning: '涣散离散，需要聚合' },
  '5-1': { name: '水泽节', upper: 5, lower: 1, guaci: '亨，苦节不可贞', meaning: '节制有度，适可而止' },
  '4-1': { name: '风泽中孚', upper: 4, lower: 1, guaci: '豚鱼吉，利涉大川', meaning: '诚信中正，以诚感人' },
  '3-6': { name: '雷山小过', upper: 3, lower: 6, guaci: '亨利贞，可小事', meaning: '小有过越，不可大用' },
  '5-2': { name: '水火既济', upper: 5, lower: 2, guaci: '亨小，利贞', meaning: '事已成就，宜守不宜进' },
  '2-5': { name: '火水未济', upper: 2, lower: 5, guaci: '亨，小狐汔济', meaning: '事未完成，仍需努力' },
};

/**
 * 根据上下卦索引查找卦
 * @param upper 上卦索引 (0-7)
 * @param lower 下卦索引 (0-7)
 */
export function findHexagram(upper: number, lower: number): Hexagram {
  const key = `${upper}-${lower}`;
  return HEXAGRAMS[key] || { name: '未知卦', upper, lower, guaci: '', meaning: '' };
}

/**
 * 根据六爻阴阳确定八卦索引
 * 三爻从下到上，1=阳 0=阴
 */
export function trigramIndex(lines: number[]): number {
  for (let i = 0; i < TRIGRAMS.length; i++) {
    const t = TRIGRAMS[i];
    if (t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2]) {
      return i;
    }
  }
  return 0;
}
