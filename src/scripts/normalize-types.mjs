import 'dotenv/config';
import pg from 'pg';

/**
 * Normalization map: database value → standardized value
 * 
 * This maps misspelled, differently-cased, or variant equipment names
 * to the official standardized list.
 */
const NORMALIZATION_MAP = {
  // Case fixes
  'M4':            'm4',
  'M5':            'm5',
  'M16':           'm16',
  'M24':           'm4',  // M24 is likely an error — map to m4 (review later if needed)

  // Variant spellings  
  'פאק':           'פק',
  'שחם':           'שח"מ',
  'שח״ע':          'שח"ע',

  // M5 variants → m5
  'M5 (כוונת)':    'כוונת m4', // M5 כוונת is likely "כוונת m4"
  'M5 נגב':        'נגב 5',    // M5 נגב → נגב 5

  // נגב variants
  'נגב':           'נגב 7',    // generic "נגב" → נגב 7 (most common)
  'נגב 7.62':      'נגב 7',    // 7.62 caliber = נגב 7

  // רימונים → רימון רסס (the most common grenade type)
  'רימונים':       'רימון רסס',

  // Others that don't have a direct match in the standardized list
  // These will be kept as-is (they're valid additional items in the DB):
  // 'טריג׳', 'זאבון', 'לאופולד מארק 6', 'מארס', 'מטלון', 
  // 'מפרולייט', 'פליר', 'צובה', 'ציין', 'קנס״פ', 'קשר'
};

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log('\n=== Equipment Type Normalization ===\n');

  for (const [oldType, newType] of Object.entries(NORMALIZATION_MAP)) {
    // Count how many items have this type
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM "Equipment" WHERE type = $1',
      [oldType]
    );
    const count = parseInt(countResult.rows[0].count, 10);

    if (count === 0) {
      console.log(`  ⏭️  "${oldType}" → "${newType}" (0 items, skipping)`);
      continue;
    }

    // Update
    const updateResult = await pool.query(
      'UPDATE "Equipment" SET type = $1 WHERE type = $2',
      [newType, oldType]
    );
    console.log(`  ✅ "${oldType}" → "${newType}" (${updateResult.rowCount} items updated)`);
  }

  // Show final state
  const finalResult = await pool.query(`
    SELECT type, COUNT(*) as count 
    FROM "Equipment" 
    GROUP BY type 
    ORDER BY type
  `);

  console.log('\n=== Final equipment types ===');
  for (const row of finalResult.rows) {
    console.log(`  "${row.type}" → ${row.count} items`);
  }
  console.log(`\nTotal distinct types: ${finalResult.rows.length}`);

  await pool.end();
}

main().catch(console.error);
