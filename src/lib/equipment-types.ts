/**
 * Equipment Types Configuration
 * 
 * This file defines the available equipment types that soldiers can be assigned.
 * TO UPDATE: Simply modify this array when you receive the final equipment list.
 * Each entry is a display name string used in the add/edit soldier forms.
 */
export const EQUIPMENT_TYPES = [
  'M4',
  'M5 (כוונת)',
  'אפוד מגן',
  'קסדה',
  'משקפת לילה',
  'מכשיר קשר',
  'מגזין',
  'ערכת עזרה ראשונה',
] as const;

export type EquipmentTypeName = typeof EQUIPMENT_TYPES[number] | string;
