/**
 * HubSpot Workflow Actions List Script
 * 
 * This script lists all currently registered workflow actions for a HubSpot app
 * using the Automation v4 API.
 * 
 * Usage: 
 *   node scripts/list-workflow-actions.js date-formatter
 *   node scripts/list-workflow-actions.js url-shortener
 * 
 * Required environment variables:
 * - HUBSPOT_DEVELOPER_API_KEY: Developer API key from HubSpot Developer Portal
 * - HUBSPOT_DATE_FORMATTER_APP_ID: App ID for Date Formatter app
 * - HUBSPOT_URL_SHORTENER_APP_ID: App ID for URL Shortener app (future)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCurrentEnvironment, getHubSpotConfig } from './config-helper.mjs';

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get app name and environment from command line arguments
const args = process.argv.slice(2);
const appName = args[0];
const environment = args[1];

if (!appName || !environment) {
  console.error('❌ App name and environment are required');
  console.log('Usage: node scripts/list-workflow-actions.js <app-name> <dev|prod>');
  console.log('Available apps: date-formatter, url-shortener');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/list-workflow-actions.js date-formatter dev     # List dev actions');
  console.log('  node scripts/list-workflow-actions.js date-formatter prod    # List prod actions');
  process.exit(1);
}

if (!['dev', 'prod'].includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.log('Environment must be either "dev" or "prod"');
  process.exit(1);
}

// Load app configurations
const appsConfigPath = path.join(__dirname, '..', 'config', 'apps.json');
const appsConfig = JSON.parse(fs.readFileSync(appsConfigPath, 'utf8'));

const appConfig = appsConfig[appName];

if (!appConfig) {
  console.error(`❌ Unknown app: ${appName}`);
  console.log('Available apps:', Object.keys(appsConfig).join(', '));
  process.exit(1);
}

// Get environment-specific configuration using explicit environment
const hubspotConfig = getHubSpotConfig(environment);

console.log(`🔧 Using ${environment.toUpperCase()} environment configuration`);

if (!hubspotConfig.developerApiKey) {
  const envVar = environment === 'dev' ? 'HUBSPOT_DEV_DEVELOPER_API_KEY' : 'HUBSPOT_PROD_DEVELOPER_API_KEY';
  console.error(`❌ ${envVar} environment variable is required`);
  console.log('Get this from https://developer.hubspot.com → Settings → API Keys');
  process.exit(1);
}

if (!hubspotConfig.dateFormatterAppId) {
  const envVar = environment === 'dev' ? 'HUBSPOT_DEV_DATE_FORMATTER_APP_ID' : 'HUBSPOT_PROD_DATE_FORMATTER_APP_ID';
  console.error(`❌ ${envVar} environment variable is required`);
  console.log('Get this from your HubSpot Developer Portal app dashboard');
  process.exit(1);
}

async function listWorkflowActions() {
  console.log(`📋 Listing workflow actions for ${appName}...`);
  console.log(`   App ID: ${hubspotConfig.dateFormatterAppId}`);
  
  const apiUrl = `https://api.hubspot.com/automation/v4/actions/${hubspotConfig.dateFormatterAppId}?hapikey=${hubspotConfig.developerApiKey}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      
      if (!result.results || result.results.length === 0) {
        console.log('📝 No workflow actions found for this app.');
        return;
      }
      
      console.log(`\n✅ Found ${result.results.length} workflow action(s):\n`);
      
      result.results.forEach((action, index) => {
        console.log(`🔧 Action #${index + 1}:`);
        console.log(`   ID: ${action.id}`);
        console.log(`   Revision: ${action.revisionId}`);
        console.log(`   Name: ${action.labels?.en?.actionName || 'Unnamed Action'}`);
        console.log(`   Description: ${action.labels?.en?.actionDescription || 'No description'}`);
        console.log(`   Status: ${action.published ? 'Published ✅' : 'Draft 📝'}`);
        console.log(`   Action URL: ${action.actionUrl}`);
        console.log(`   Object Types: ${action.objectTypes?.join(', ') || 'None'}`);
        console.log(`   Input Fields: ${action.inputFields?.length || 0}`);
        console.log(`   Output Fields: ${action.outputFields?.length || 0}`);
        
        if (action.inputFields && action.inputFields.length > 0) {
          console.log(`   Input Field Names: ${action.inputFields.map(f => f.typeDefinition.name).join(', ')}`);
        }
        
        if (action.outputFields && action.outputFields.length > 0) {
          console.log(`   Output Field Names: ${action.outputFields.map(f => f.typeDefinition.name).join(', ')}`);
        }
        
        console.log(''); // Empty line between actions
      });
      
      console.log('🎯 Summary:');
      console.log(`   Total Actions: ${result.results.length}`);
      console.log(`   Published: ${result.results.filter(a => a.published).length}`);
      console.log(`   Draft: ${result.results.filter(a => !a.published).length}`);
      
    } else {
      console.error('❌ Failed to list workflow actions');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${responseText}`);
      
      try {
        const errorDetails = JSON.parse(responseText);
        if (errorDetails.message) {
          console.error(`   Error: ${errorDetails.message}`);
        }
        if (errorDetails.errors) {
          console.error('   Validation Errors:');
          errorDetails.errors.forEach((error, index) => {
            console.error(`     ${index + 1}. ${error.message || error}`);
          });
        }
      } catch (e) {
        // Error response is not valid JSON
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error listing workflow actions:', error.message);
    process.exit(1);
  }
}

// Execute the list command
listWorkflowActions();