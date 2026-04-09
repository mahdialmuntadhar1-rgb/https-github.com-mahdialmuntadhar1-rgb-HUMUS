#!/usr/bin/env node
/**
 * Supabase Migration Script
 * Migrates business records from old project to new project's contacts table
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.migration
dotenv.config({ path: resolve(process.cwd(), '.env.migration') });

// Interfaces
interface OldBusiness {
  id?: number;
  name: string;
  phone: string;
  governorate: string;
  category?: string;
  [key: string]: any;
}

interface NewContact {
  display_name: string;
  raw_phone: string;
  normalized_phone: string;
  whatsapp_phone: string;
  governorate: string;
  category: string;
  validity_status: string;
}

// Configuration
const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL || 'https://hsadukhmcclwixuntqwu.supabase.co';
const OLD_SERVICE_ROLE_KEY = process.env.OLD_SERVICE_ROLE_KEY || '';
const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL || 'https://ujdsxzvvgaugypwtugdl.supabase.co';
const NEW_SERVICE_ROLE_KEY = process.env.NEW_SERVICE_ROLE_KEY || '';
const BATCH_SIZE = 100;

// Validate environment variables
function validateEnv(): void {
  const missing: string[] = [];
  if (!OLD_SERVICE_ROLE_KEY) missing.push('OLD_SERVICE_ROLE_KEY');
  if (!NEW_SERVICE_ROLE_KEY) missing.push('NEW_SERVICE_ROLE_KEY');
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\nPlease add them to .env.migration file');
    process.exit(1);
  }
}

// Phone number normalization
function normalizePhone(phone: string): { normalized: string; whatsapp: string } {
  if (!phone) return { normalized: '', whatsapp: '' };
  
  let cleaned = phone.trim();
  
  // Remove spaces, dashes, and other formatting characters
  cleaned = cleaned.replace(/[\s\-\(\)\.]/g, '');
  
  // Normalize based on patterns
  if (cleaned.startsWith('07')) {
    cleaned = '+964' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') && cleaned.length >= 10) {
    cleaned = '+964' + cleaned;
  } else if (cleaned.startsWith('964')) {
    cleaned = '+' + cleaned;
  }
  
  if (!cleaned.startsWith('+') && cleaned.startsWith('964')) {
    cleaned = '+' + cleaned;
  }
  
  const whatsapp = cleaned.startsWith('+') ? cleaned.substring(1) : cleaned;
  
  return { normalized: cleaned, whatsapp };
}

// Fetch businesses from old Supabase
async function fetchBusinesses(oldClient: SupabaseClient): Promise<OldBusiness[]> {
  console.log('📥 Fetching businesses from old project...');
  
  const { data, error } = await oldClient
    .from('businesses')
    .select('*');
  
  if (error) {
    console.error('❌ Error fetching businesses:', error.message);
    throw error;
  }
  
  console.log(`✅ Fetched ${data?.length || 0} businesses`);
  return data || [];
}

// Transform and migrate data in batches
async function migrateInBatches(
  newClient: SupabaseClient,
  businesses: OldBusiness[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log(`\n🚀 Starting migration in batches of ${BATCH_SIZE}...`);
  
  const results = { success: 0, failed: 0, errors: [] as string[] };
  const totalBatches = Math.ceil(businesses.length / BATCH_SIZE);
  
  for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
    const batch = businesses.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    
    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} records)...`);
    
    const contacts: NewContact[] = batch.map(business => {
      const phoneData = normalizePhone(business.phone);
      
      return {
        display_name: business.name || 'Unknown',
        raw_phone: business.phone || '',
        normalized_phone: phoneData.normalized,
        whatsapp_phone: phoneData.whatsapp,
        governorate: business.governorate || 'Unknown',
        category: business.category || 'General',
        validity_status: 'valid'
      };
    });
    
    try {
      const { error } = await newClient
        .from('contacts')
        .upsert(contacts, { onConflict: 'normalized_phone' });
      
      if (error) {
        console.error(`❌ Batch ${batchNum} failed:`, error.message);
        results.failed += batch.length;
        results.errors.push(`Batch ${batchNum}: ${error.message}`);
      } else {
        console.log(`✅ Batch ${batchNum} completed (${contacts.length} records)`);
        results.success += contacts.length;
      }
    } catch (err: any) {
      console.error(`❌ Batch ${batchNum} error:`, err.message);
      results.failed += batch.length;
      results.errors.push(`Batch ${batchNum}: ${err.message}`);
    }
    
    if (batchNum < totalBatches) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

// Main migration function
async function runMigration(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   SUPABASE BUSINESS → CONTACTS MIGRATION');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  validateEnv();
  
  const oldClient = createClient(OLD_SUPABASE_URL, OLD_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const newClient = createClient(NEW_SUPABASE_URL, NEW_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  console.log('🔗 Connected to:');
  console.log(`   Old: ${OLD_SUPABASE_URL}`);
  console.log(`   New: ${NEW_SUPABASE_URL}\n`);
  
  const businesses = await fetchBusinesses(oldClient);
  
  if (businesses.length === 0) {
    console.log('⚠️ No businesses found to migrate');
    return;
  }
  
  console.log(`\n⚡ Ready to migrate ${businesses.length} records`);
  console.log('   (Press Ctrl+C to cancel, continuing in 3 seconds...)\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const results = await migrateInBatches(newClient, businesses);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   MIGRATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Successfully migrated: ${results.success} records`);
  if (results.failed > 0) console.log(`❌ Failed: ${results.failed} records`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

runMigration().catch(err => {
  console.error('\n💥 Migration failed:', err);
  process.exit(1);
});
