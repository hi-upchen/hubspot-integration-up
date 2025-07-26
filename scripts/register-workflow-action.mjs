/**
 * HubSpot Workflow Action Registration Script
 * 
 * This script registers workflow actions with HubSpot using the Automation v4 API.
 * It uses separate JSON configuration files for better maintainability.
 * 
 * Usage: 
 *   node scripts/register-workflow-action.js date-formatter [register|update]
 *   node scripts/register-workflow-action.js url-shortener [register|update]
 * 
 * Required environment variables for each app:
 * - HUBSPOT_DEVELOPER_API_KEY: Developer API key from HubSpot Developer Portal
 * - HUBSPOT_DATE_FORMATTER_APP_ID: App ID for Date Formatter app
 * - HUBSPOT_URL_SHORTENER_APP_ID: App ID for URL Shortener app (future)
 * - NEXTJS_URL: Your deployed application URL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ConfigManager } from '../src/lib/config/config-manager.ts';

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get app name from command line arguments
const args = process.argv.slice(2);
const appName = args[0];
const command = args[1] || 'register';


if (!appName) {
  console.error('❌ App name is required');
  console.log('Usage: node scripts/register-workflow-action.js <app-name> [register|update]');
  console.log('Available apps: date-formatter, url-shortener');
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

// Load workflow action definition
const definitionPath = path.join(__dirname, '..', appConfig.definitionFile);
let workflowActionDefinition;

try {
  workflowActionDefinition = JSON.parse(fs.readFileSync(definitionPath, 'utf8'));
} catch (error) {
  console.error(`❌ Failed to load workflow definition from ${definitionPath}:`, error.message);
  process.exit(1);
}

// Get environment-specific configuration
const environment = ConfigManager.getCurrentEnvironment();
const hubspotConfig = ConfigManager.getHubSpotConfig();

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

// Get webhook URL for the current environment
const NEXTJS_URL = environment === 'dev' 
  ? (process.env.NEXTJS_URL || process.env.DEV_NEXTJS_URL || 'http://localhost:3000')
  : (process.env.PROD_NEXTJS_URL || process.env.NEXTJS_URL);

if (!NEXTJS_URL) {
  console.error('❌ Webhook base URL is required');
  console.error('Set DEV_NEXTJS_URL for development or PROD_NEXTJS_URL for production');
  process.exit(1);
}

// Add runtime configuration to the workflow action definition
workflowActionDefinition.actionUrl = `${NEXTJS_URL}${appConfig.webhookPath}`;

// Generate action name with version and conditional timestamp
const baseActionName = workflowActionDefinition.labels.en.actionName;
const version = 'v1.0.0';
const isDevMode = NEXTJS_URL.includes('localhost') || NEXTJS_URL.includes('ngrok') || NEXTJS_URL.includes('127.0.0.1');

let finalActionName = `${baseActionName} ${version}`;
let finalDescription = workflowActionDefinition.labels.en.actionDescription;

// Only add timestamp and environment info in development mode
if (isDevMode) {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace('T', ' '); // 2025-01-25 14:30
  const envLabel = NEXTJS_URL.includes('localhost') ? 'Dev' : 'Dev-Tunnel';
  
  finalActionName = `${baseActionName} ${version} (${envLabel} - ${timestamp})`;
  finalDescription = `${workflowActionDefinition.labels.en.actionDescription} (${version}) - Registered: ${timestamp}`;
} else {
  finalDescription = `${workflowActionDefinition.labels.en.actionDescription} (${version})`;
}

// Update the action name and description
workflowActionDefinition.labels.en.actionName = finalActionName;
workflowActionDefinition.labels.en.actionDescription = finalDescription;

async function registerWorkflowAction() {
  
  console.log(`🚀 Registering ${workflowActionDefinition.labels?.en?.actionName || 'workflow action'} with HubSpot...`);
  console.log(`   App: ${appName}`);
  console.log(`   App ID: ${hubspotConfig.dateFormatterAppId}`);
  console.log(`   Action URL: ${workflowActionDefinition.actionUrl}`);
  
  const apiUrl = `https://api.hubapi.com/automation/v4/actions/${hubspotConfig.dateFormatterAppId}?hapikey=${hubspotConfig.developerApiKey}`;
  
  try {
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowActionDefinition)
    });

    const responseText = await response.text();
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      
      console.log('✅ Workflow action registered successfully!');
      console.log('📋 Action Details:');
      console.log(`   Action ID: ${result.id || result.actionDefinitionId}`);
      console.log(`   Status: ${result.published ? 'Published' : 'Draft'}`);
      console.log(`   Action URL: ${result.actionUrl}`);
      console.log(`   Input Fields: ${result.inputFields?.length || 0}`);
      console.log(`   Output Fields: ${result.outputFields?.length || 0}`);
      
      console.log('\n🎯 Next Steps:');
      console.log('1. Go to your HubSpot account');
      console.log('2. Navigate to Automation → Workflows');
      console.log('3. Create a new workflow or edit existing one');
      console.log(`4. Look for "${workflowActionDefinition.labels?.en?.actionName || 'Format Date'}" in Custom Actions`);
      console.log('\n💡 Management Commands:');
      console.log(`   List all actions: node scripts/list-workflow-actions.js ${appName}`);
      console.log(`   Delete this action: node scripts/delete-workflow-action.js ${appName} ${result.id}`);
      
      return result;
    } else {
      console.error('❌ Failed to register workflow action');
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
    console.error('💥 Error registering workflow action:', error.message);
    process.exit(1);
  }
}

async function updateWorkflowAction() {
  console.log(`🔄 Updating existing ${workflowActionDefinition.labels?.en?.actionName || 'workflow action'}...`);
  
  try {
    const response = await fetch(`https://api.hubapi.com/automation/v4/actions/${hubspotConfig.dateFormatterAppId}/${workflowActionDefinition.actionDefinitionId}?hapikey=${hubspotConfig.developerApiKey}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowActionDefinition)
    });

    const responseText = await response.text();
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ Workflow action updated successfully!');
      return result;
    } else if (response.status === 404) {
      console.log('ℹ️  Action not found, creating new one...');
      return await registerWorkflowAction();
    } else {
      console.error('❌ Failed to update workflow action');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${responseText}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error updating workflow action:', error.message);
    process.exit(1);
  }
}

// Execute the command
if (command === 'update') {
  updateWorkflowAction();
} else if (command === 'register') {
  registerWorkflowAction();
} else {
  console.log('Usage: node scripts/register-workflow-action.js <app-name> [register|update]');
  console.log('Available apps:', Object.keys(appsConfig).join(', '));
  process.exit(1);
}