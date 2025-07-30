/**
 * HubSpot Workflow Action Update Script
 * 
 * This script updates existing workflow actions by finding the latest action
 * of the same type and updating it with new configuration.
 * 
 * Usage: 
 *   node scripts/update-workflow-action.js date-formatter
 *   node scripts/update-workflow-action.js date-formatter <action-id>
 * 
 * Required environment variables:
 * - HUBSPOT_DEVELOPER_API_KEY: Developer API key from HubSpot Developer Portal
 * - HUBSPOT_DATE_FORMATTER_APP_ID: App ID for Date Formatter app
 * - HUBSPOT_URL_SHORTENER_APP_ID: App ID for URL Shortener app (future)
 * - NEXTJS_URL: Your deployed application URL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getCurrentEnvironment, getHubSpotConfig, getWebhookBaseUrl, isDevelopmentMode } from './config-helper.mjs';

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get app name and optional action ID from command line arguments
const args = process.argv.slice(2);
const appName = args[0];
const specificActionId = args[1];

if (!appName) {
  console.error('❌ App name is required');
  console.log('Usage: node scripts/update-workflow-action.js <app-name> [action-id]');
  console.log('Available apps: date-formatter, url-shortener');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/update-workflow-action.js date-formatter              # Update latest action');
  console.log('  node scripts/update-workflow-action.js date-formatter 218268439   # Update specific action');
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
const environment = getCurrentEnvironment();
const hubspotConfig = getHubSpotConfig();
// Get webhook URL for the current environment
const NEXTJS_URL = environment === 'dev' 
  ? (process.env.NEXTJS_URL || process.env.DEV_NEXTJS_URL || 'http://localhost:3000')
  : (process.env.PROD_NEXTJS_URL || process.env.NEXTJS_URL);

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
  const environment = NEXTJS_URL.includes('localhost') ? 'Dev' : 'Dev-Tunnel';
  
  finalActionName = `${baseActionName} ${version} (${environment} - ${timestamp})`;
  finalDescription = `${workflowActionDefinition.labels.en.actionDescription} (${version}) - Updated: ${timestamp}`;
} else {
  finalDescription = `${workflowActionDefinition.labels.en.actionDescription} (${version})`;
}

// Update the action name and description
workflowActionDefinition.labels.en.actionName = finalActionName;
workflowActionDefinition.labels.en.actionDescription = finalDescription;

async function getExistingActions() {
  console.log(`🔍 Finding existing workflow actions for ${appName}...`);
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
      const actions = result.results || [];
      
      // Display all actions
      if (actions.length === 0) {
        console.log('📝 No workflow actions found for this app.');
      } else {
        console.log(`\n✅ Found ${actions.length} workflow action(s):\n`);
        
        actions.forEach((action, index) => {
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
        console.log(`   Total Actions: ${actions.length}`);
        console.log(`   Published: ${actions.filter(a => a.published).length}`);
        console.log(`   Draft: ${actions.filter(a => !a.published).length}`);
      }
      
      return actions;
    } else {
      console.error('❌ Failed to fetch existing actions');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${responseText}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error fetching existing actions:', error.message);
    process.exit(1);
  }
}

function findTargetAction(actions, appName, specificActionId) {
  // If specific action ID provided, find that exact action
  if (specificActionId) {
    const action = actions.find(a => a.id === specificActionId);
    if (!action) {
      console.error(`❌ Action with ID ${specificActionId} not found`);
      process.exit(1);
    }
    return action;
  }

  // Filter actions by app type (check if action name contains the app's base name)
  const appTypeActions = actions.filter(action => {
    const actionName = action.labels?.en?.actionName || '';
    // Check if action name starts with the expected base name for this app type
    if (appName === 'date-formatter') {
      return actionName.toLowerCase().includes('format date') || actionName.toLowerCase().includes('date format');
    } else if (appName === 'url-shortener') {
      return actionName.toLowerCase().includes('url') || actionName.toLowerCase().includes('shorten');
    }
    return false;
  });

  if (appTypeActions.length === 0) {
    console.log(`ℹ️  No existing ${appName} actions found. Consider registering a new one.`);
    console.log(`   Run: node scripts/register-workflow-action.js ${appName}`);
    process.exit(0);
  }

  // Sort by creation time and get the latest (most recent)
  appTypeActions.sort((a, b) => {
    // If we have revisionId, use that for sorting (higher revision = newer)
    if (a.revisionId && b.revisionId) {
      return parseInt(b.revisionId) - parseInt(a.revisionId);
    }
    // Fallback to ID comparison (higher ID usually means newer)
    return parseInt(b.id) - parseInt(a.id);
  });

  const latestAction = appTypeActions[0];
  
  console.log(`\n📍 Found ${appTypeActions.length} ${appName} action(s), selecting latest for update:`);
  console.log(`   ID: ${latestAction.id}`);
  console.log(`   Name: ${latestAction.labels?.en?.actionName}`);
  console.log(`   Revision: ${latestAction.revisionId}`);
  
  return latestAction;
}

async function updateWorkflowAction(existingAction) {
  console.log(`\n🔄 Updating workflow action...`);
  console.log(`   Action ID: ${existingAction.id}`);
  console.log(`   Current Name: ${existingAction.labels?.en?.actionName}`);
  console.log(`   New Name: ${workflowActionDefinition.labels.en.actionName}`);
  
  // Prepare update payload - merge new definition with existing action metadata
  const updatePayload = {
    ...workflowActionDefinition,
    id: existingAction.id,
    revisionId: existingAction.revisionId
  };
  
  const apiUrl = `https://api.hubspot.com/automation/v4/actions/${hubspotConfig.dateFormatterAppId}/${existingAction.id}?hapikey=${hubspotConfig.developerApiKey}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    const responseText = await response.text();
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      
      console.log('✅ Workflow action updated successfully!');
      console.log('📋 Updated Action Details:');
      console.log(`   Action ID: ${result.id}`);
      console.log(`   Revision: ${result.revisionId}`);
      console.log(`   Status: ${result.published ? 'Published' : 'Draft'}`);
      console.log(`   Action URL: ${result.actionUrl}`);
      console.log(`   Input Fields: ${result.inputFields?.length || 0}`);
      console.log(`   Output Fields: ${result.outputFields?.length || 0}`);
      
      console.log('\n🎯 Next Steps:');
      console.log('1. Existing workflows using this action will automatically use the updated version');
      console.log('2. Test the action in a workflow to ensure it works as expected');
      
      console.log('\n💡 Management Commands:');
      console.log(`   List all actions: node scripts/list-workflow-actions.js ${appName}`);
      console.log(`   Delete this action: node scripts/delete-workflow-action.js ${appName} ${result.id}`);
      
      return result;
    } else {
      console.error('❌ Failed to update workflow action');
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
    console.error('💥 Error updating workflow action:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    // Get all existing actions
    const existingActions = await getExistingActions();
    
    if (existingActions.length === 0) {
      console.log('ℹ️  No existing actions found. Consider registering a new one.');
      console.log(`   Run: node scripts/register-workflow-action.js ${appName}`);
      return;
    }
    
    // Find the target action to update
    const targetAction = findTargetAction(existingActions, appName, specificActionId);
    
    // Update the action
    await updateWorkflowAction(targetAction);
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Execute the update
main();