export interface RosterEntry {
  name: string
  number: number | null
}

export const ROSTER: RosterEntry[] = [
  { name: '元宝', number: 1 },
  { name: '阿杰', number: 2 },
  { name: '张总', number: 3 },
  { name: '边部', number: 4 },
  { name: '文超', number: 6 },
  { name: '大卫', number: 7 },
  { name: '阿坤', number: 8 },
  { name: '阿龙', number: 10 },
  { name: '飞天', number: 11 },
  { name: '天宇', number: 12 },
  { name: '邢跃', number: 13 },
  { name: '大志', number: 14 },
  { name: '任总', number: 15 },
  { name: '老朱', number: 16 },
  { name: '豹指', number: 17 },
  { name: '大石', number: 18 },
  { name: '姜尧', number: 19 },
  { name: '大鹏', number: 20 },
  { name: '雪松', number: 21 },
  { name: '周亮', number: 22 },
  { name: '志新', number: 23 },
  { name: '埃及穆', number: 24 },
  { name: '岳岳', number: 25 },
  { name: '恒瑞', number: 26 },
  { name: '小洪', number: 27 },
  { name: '小马', number: 28 },
  { name: '于新', number: 29 },
  { name: '小常', number: 30 },
  { name: '39号', number: 39 },
  { name: '77号', number: 77 },
  { name: '哆啦A梦', number: 78 },
  { name: '99号', number: 99 },
]

export const ROSTER_NAMES: string[] = ROSTER.map(r => r.name)
