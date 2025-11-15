/**
 * Script pour exécuter une migration SQL via Supabase
 * 
 * Usage: npx tsx scripts/run-migration.ts <nom-du-fichier>
 * Exemple: npx tsx scripts/run-migration.ts 007_seed_events_with_images.sql
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n📝 Assurez-vous d\'avoir un fichier .env.local avec ces variables.');
  process.exit(1);
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Usage: npx tsx scripts/run-migration.ts <nom-du-fichier>');
  console.error('   Exemple: npx tsx scripts/run-migration.ts 007_seed_events_with_images.sql');
  process.exit(1);
}

async function runMigration() {
  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('📂 Lecture du fichier:', migrationFile);
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', migrationFile!);
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Exécution de la migration...\n');
    
    // Diviser le SQL en plusieurs statements si nécessaire
    // (Supabase RPC n'accepte pas toujours les DO blocks directement)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Si exec_sql n'existe pas, essayer une approche alternative
      console.log('⚠️  La fonction exec_sql n\'existe pas, utilisation de l\'approche alternative...');
      
      // Méthode alternative: exécuter via l'API REST directement
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey!,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_query: sql }),
      });

      if (!response.ok) {
        throw new Error(`❌ Erreur HTTP: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Migration exécutée avec succès!');
    } else {
      console.log('✅ Migration exécutée avec succès!');
      if (data) {
        console.log('📊 Résultat:', data);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution:', error);
    console.error('\n💡 Alternative: Copiez le contenu du fichier SQL et exécutez-le dans Supabase Studio:');
    console.error(`   ${supabaseUrl?.replace('/v1', '')}/project/_/sql`);
    process.exit(1);
  }
}

runMigration();

