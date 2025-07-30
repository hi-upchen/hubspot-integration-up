/**
 * HubSpot Workflow Action Delete Script
 * 
 * This script deletes a specific workflow action by ID using the Automation v4 API.
 * 
 * Usage: 
 *   node scripts/delete-workflow-action.js date-formatter <action-id>
 *   node scripts/delete-workflow-action.js url-shortener <action-id>
 * 
 * Example:
 *   node scripts/delete-workflow-action.js date-formatter 218240892
 * 
 * Required environment variables:
 * - HUBSPOT_DEVELOPER_API_KEY: Developer API key from HubSpot Developer Portal
 * - HUBSPOT_DATE_FORMATTER_APP_ID: App ID for Date Formatter app
 * - HUBSPOT_URL_SHORTENER_APP_ID: App ID for URL Shortener app (future)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getCurrentEnvironment, getHubSpotConfig } from './config-helper.mjs';

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get app name and action ID from command line arguments
const args = process.argv.slice(2);
const appName = args[0];
const actionId = args[1];

if (!appName || !actionId) {
  console.error('❌ App name and action ID are required');
  console.log('Usage: node scripts/delete-workflow-action.js <app-name> <action-id>');
  console.log('Available apps: date-formatter, url-shortener');
  console.log('');
  console.log('Example: node scripts/delete-workflow-action.js date-formatter 218240892');
  console.log('');
  console.log('💡 Tip: Use list-workflow-actions.js to see all action IDs');
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

// Get environment-specific configuration
const environment = getCurrentEnvironment();
const hubspotConfig = getHubSpotConfig();

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

async function deleteWorkflowAction() {
  console.log(`🗑️  Deleting workflow action...`);
  console.log(`   App: ${appName}`);
  console.log(`   App ID: ${hubspotConfig.dateFormatterAppId}`);
  console.log(`   Action ID: ${actionId}`);
  
  const apiUrl = `https://api.hubspot.com/automation/v4/actions/${hubspotConfig.dateFormatterAppId}/${actionId}?hapikey=${hubspotConfig.developerApiKey}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Workflow action deleted successfully!');
      console.log(`   Deleted Action ID: ${actionId}`);
      
      console.log('\n💡 Tip: Run list-workflow-actions.js to see remaining actions');
      
    } else {
      const responseText = await response.text();
      console.error('❌ Failed to delete workflow action');
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
    console.error('💥 Error deleting workflow action:', error.message);
    process.exit(1);
  }
}

// Execute the delete command
deleteWorkflowAction();