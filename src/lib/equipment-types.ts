/**
 * Equipment Types Configuration
 * 
 * This file defines the available equipment types that soldiers can be assigned.
 * TO UPDATE: Simply modify this array when you receive the final equipment list.
 * Each entry is a display name string used in the add/edit soldier forms.
 */
export const EQUIPMENT_TYPES = [
  'נועה',
  'מיקרון',
  'פק',
  'ליאור',
  'משקפת',
  'שח"מ',
  'שח"ע',
  'עדי',
  'טרמיס',
  'מצפן',
  'עמית',
  'מכפל עמית',
  'מטל',
  'לייזר נגב',
  'קליפאון',
  'מאג',
  'נגב 5',
  'נגב 7',
  'm4',
  'm5',
  'm16',
  'קלע',
  'מטול',
  'נשק צלף',
  'כוונת m4',
  'רימון רסס',
  'מטול נפיץ',
  'מטול תאורה',
  'אולר',
  'טיל לאו',
  'טיל מטאדור',
  // Additional types found in existing data
  'זאבון',
  'טריג׳',
  'לאופולד מארק 6',
  'מארס',
  'מטלון',
  'מפרולייט',
  'פליר',
  'צובה',
  'ציין',
  'קנס״פ',
  'קשר',
] as const;

export type EquipmentTypeName = typeof EQUIPMENT_TYPES[number] | string;
