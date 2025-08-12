#!/usr/bin/env node

/**
 * Unified HubSpot App Management Script
 * Uses JSON configuration files instead of environment variables
 * 
 * Usage:
 *   npm run hubspot -- register date-formatter dev
 *   npm run hubspot -- update url-shortener prod
 *   npm run hubspot -- list date-formatter dev
 *   npm run hubspot -- delete date-formatter dev 12345
 * 
 * Commands:
 *   register <app> <env>     - Register a new workflow action
 *   update <app> <env>       - Update an existing workflow action  
 *   list <app> <env>         - List all workflow actions for app
 *   delete <app> <env> <id>  - Delete a workflow action by ID
 * 
 * Apps: date-formatter, url-shortener
 * Environments: dev, prod
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration loading - replace config-helper with direct JSON loading
function loadConfig(environment) {
  const configPath = path.join(__dirname, '..', 'config', 'credentials', `${environment}.json`);
  
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Configuration file not found: ${configPath}`);
    console.log('Please ensure the configuration file exists.');
    process.exit(1);
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } catch (error) {
    console.error(`❌ Failed to parse configuration file: ${error.message}`);
    process.exit(1);
  }
}

function getAppConfig(appName, environment) {
  const config = loadConfig(environment);
  const appConfig = config.hubspot.apps[appName];
  
  if (!appConfig) {
    console.error(`❌ No configuration found for app: ${appName}`);
    console.log(`Available apps: ${Object.keys(config.hubspot.apps).join(', ')}`);
    process.exit(1);
  }

  return {
    appId: appConfig.appId,
    clientId: appConfig.clientId,
    clientSecret: appConfig.clientSecret,
    developerApiKey: config.hubspot.shared.developerApiKey,
    redirectUri: config.hubspot.shared.redirectUri,
    nextjsUrl: config.application.nextjsUrl
  };
}

// Parse command line arguments
const args = process.argv.slice(2);
const [command, appName, environment, actionId] = args;

if (!command || !appName || !environment) {
  console.error('❌ Missing required arguments');
  console.log('Usage: node scripts/hubspot-app.mjs <command> <app> <env> [action-id]');
  console.log('');
  console.log('Commands:');
  console.log('  register <app> <env>     - Register a new workflow action');
  console.log('  update <app> <env>       - Update an existing workflow action');
  console.log('  list <app> <env>         - List all workflow actions for app');
  console.log('  delete <app> <env> <id>  - Delete a workflow action by ID');
  console.log('');
  console.log('Apps: date-formatter, url-shortener');
  console.log('Environments: dev, prod');
  console.log('');
  console.log('Examples:');
  console.log('  npm run hubspot -- register date-formatter dev');
  console.log('  npm run hubspot -- list url-shortener prod');
  console.log('  npm run hubspot -- delete date-formatter dev 12345');
  process.exit(1);
}

if (!['register', 'update', 'list', 'delete'].includes(command)) {
  console.error(`❌ Invalid command: ${command}`);
  console.log('Valid commands: register, update, list, delete');
  process.exit(1);
}

if (!['dev', 'prod'].includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.log('Valid environments: dev, prod');
  process.exit(1);
}

// Load app configuration
const hubspotConfig = getAppConfig(appName, environment);
console.log(`🔧 Using ${environment.toUpperCase()} environment configuration`);

// Load apps.json for webhook path and definition file
const appsConfigPath = path.join(__dirname, '..', 'config', 'apps.json');
const appsConfig = JSON.parse(fs.readFileSync(appsConfigPath, 'utf8'));
const appMetadata = appsConfig[appName];

if (!appMetadata) {
  console.error(`❌ App metadata not found for: ${appName}`);
  console.log(`Available apps: ${Object.keys(appsConfig).join(', ')}`);
  process.exit(1);
}

// Command implementations
async function registerAction() {
  // Load workflow action definition
  const definitionPath = path.join(__dirname, '..', appMetadata.definitionFile);
  let workflowActionDefinition;

  try {
    workflowActionDefinition = JSON.parse(fs.readFileSync(definitionPath, 'utf8'));
  } catch (error) {
    console.error(`❌ Failed to load workflow definition from ${definitionPath}:`, error.message);
    process.exit(1);
  }

  // Configure action URL
  workflowActionDefinition.actionUrl = `${hubspotConfig.nextjsUrl}${appMetadata.webhookPath}`;

  // Generate action name with version and conditional timestamp
  const baseActionName = workflowActionDefinition.labels.en.actionName;
  const version = 'v1.0.0';
  const isDevMode = hubspotConfig.nextjsUrl.includes('localhost') || 
                    hubspotConfig.nextjsUrl.includes('ngrok') || 
                    hubspotConfig.nextjsUrl.includes('127.0.0.1');

  let finalActionName = `${baseActionName} ${version}`;
  let finalDescription = workflowActionDefinition.labels.en.actionDescription;

  // Only add timestamp in development mode
  if (isDevMode) {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
    const envLabel = hubspotConfig.nextjsUrl.includes('localhost') ? 'Dev' : 'Dev-Tunnel';
    
    finalActionName = `${baseActionName} ${version} (${envLabel} - ${timestamp})`;
    finalDescription = `${workflowActionDefinition.labels.en.actionDescription} (${version}) - Registered: ${timestamp}`;
  } else {
    finalDescription = `${workflowActionDefinition.labels.en.actionDescription} (${version})`;
  }

  workflowActionDefinition.labels.en.actionName = finalActionName;
  workflowActionDefinition.labels.en.actionDescription = finalDescription;

  console.log(`🚀 Registering ${finalActionName} with HubSpot...`);
  console.log(`   App: ${appName}`);
  console.log(`   App ID: ${hubspotConfig.appId}`);
  console.log(`   Action URL: ${workflowActionDefinition.actionUrl}`);

  const apiUrl = `https://api.hubapi.com/automation/v4/actions/${hubspotConfig.appId}?hapikey=${hubspotConfig.developerApiKey}`;

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
      console.log(`   Original Name: ${baseActionName}`);
      console.log(`   Action ID: ${result.id || result.actionDefinitionId}`);
      console.log(`   Status: ${result.published ? 'Published' : 'Draft'}`);
      console.log(`   Action URL: ${result.actionUrl}`);
      console.log(`   Input Fields: ${result.inputFields?.length || 0}`);
      console.log(`   Output Fields: ${result.outputFields?.length || 0}`);
      console.log(`   Registered Name: ${finalActionName}`);
      
      console.log('\n🎯 Next Steps:');
      console.log('1. Go to your HubSpot account');
      console.log('2. Navigate to Automation → Workflows');
      console.log('3. Create a new workflow or edit existing one');
      console.log(`4. Look for "${finalActionName}" in Custom Actions`);
      
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

async function updateAction() {
  console.log('🔄 Updating existing workflow action...');
  
  // First, list existing actions to find the one to update
  const listResult = await listActionsQuiet();
  
  if (!listResult.results || listResult.results.length === 0) {
    console.log('❌ No existing actions found to update');
    console.log('💡 Register a new action instead:');
    console.log(`   npm run hubspot -- register ${appName} ${environment}`);
    return;
  }
  
  // For now, update the first (most recent) action found
  const actionToUpdate = listResult.results[0];
  const actionId = actionToUpdate.id || actionToUpdate.actionDefinitionId;
  
  console.log(`📝 Updating action: ${actionToUpdate.labels?.en?.actionName || 'Unnamed'} (ID: ${actionId})`);
  
  // Load the action definition from config file
  const actionDefPath = path.join(__dirname, '..', 'config', 'workflow-actions', `${appName}.json`);
  
  if (!fs.existsSync(actionDefPath)) {
    console.error(`❌ Action definition file not found: ${actionDefPath}`);
    process.exit(1);
  }

  const actionDefinition = JSON.parse(fs.readFileSync(actionDefPath, 'utf8'));
  
  // Add runtime properties to the definition
  const now = new Date();
  const envLabel = environment.toUpperCase();
  const timestamp = environment === 'dev' 
    ? ` (Dev-Tunnel - ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')})`
    : '';

  // Store original name for output
  const originalActionName = actionDefinition.labels.en.actionName;
  const baseActionName = originalActionName.split(' v')[0];
  
  actionDefinition.labels.en.actionName = `${baseActionName} v1.0.0${timestamp}`;
  actionDefinition.actionUrl = actionDefinition.actionUrl.replace('https://your-domain.vercel.app', hubspotConfig.nextjsUrl);

  const apiUrl = `https://api.hubapi.com/automation/v4/actions/${hubspotConfig.appId}/${actionId}?hapikey=${hubspotConfig.developerApiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'PATCH', // Try PATCH first, fallback to PUT if needed
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(actionDefinition)
    });

    const responseText = await response.text();

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ Workflow action updated successfully!');
      console.log('📋 Updated Action Details:');
      console.log(`   Original Name: ${originalActionName}`);
      console.log(`   Action ID: ${result.id || result.actionDefinitionId || actionId}`);
      console.log(`   Status: ${result.published ? 'Published' : 'Draft'}`);
      console.log(`   Action URL: ${result.actionUrl || actionDefinition.actionUrl}`);
      console.log(`   Input Fields: ${result.inputFields?.length || actionDefinition.inputFields?.length || 0}`);
      console.log(`   Output Fields: ${result.outputFields?.length || actionDefinition.outputFields?.length || 0}`);
      console.log(`   Updated Name: ${result.labels?.en?.actionName || actionDefinition.labels.en.actionName}`);
      console.log('');
      console.log('🎯 Next Steps:');
      console.log('1. Go to your HubSpot account');
      console.log('2. Navigate to Automation → Workflows');
      console.log('3. Create a new workflow or edit existing one');
      console.log(`4. Look for "${result.labels?.en?.actionName || actionDefinition.labels.en.actionName}" in Custom Actions`);
    } else if (response.status === 405 && !response.url.includes('PUT')) {
      // Method not allowed, try PUT instead
      console.log('🔄 PATCH not supported, trying PUT method...');
      
      const putResponse = await fetch(apiUrl.replace('PATCH', 'PUT'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(actionDefinition)
      });

      const putResponseText = await putResponse.text();

      if (putResponse.ok) {
        const result = JSON.parse(putResponseText);
        console.log('✅ Workflow action updated successfully (using PUT)!');
        console.log('📋 Updated Action Details:');
        console.log(`   Original Name: ${originalActionName}`);
        console.log(`   Action ID: ${result.id || result.actionDefinitionId || actionId}`);
        console.log(`   Status: ${result.published ? 'Published' : 'Draft'}`);
        console.log(`   Action URL: ${result.actionUrl || actionDefinition.actionUrl}`);
        console.log(`   Input Fields: ${result.inputFields?.length || actionDefinition.inputFields?.length || 0}`);
        console.log(`   Output Fields: ${result.outputFields?.length || actionDefinition.outputFields?.length || 0}`);
        console.log(`   Updated Name: ${result.labels?.en?.actionName || actionDefinition.labels.en.actionName}`);
      } else {
        throw new Error(`PUT method also failed: ${putResponse.status} ${putResponse.statusText}\n${putResponseText}`);
      }
    } else {
      console.error('❌ Failed to update workflow action');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${responseText}`);
      
      if (response.status === 404) {
        console.error('\n💡 This might mean:');
        console.error('   1. The action ID is incorrect');
        console.error('   2. The action has been deleted');
        console.error('   3. Update API endpoint has changed');
        console.error('\n🔄 Falling back to delete and recreate:');
        console.log(`   npm run hubspot -- delete ${appName} ${environment} ${actionId}`);
        console.log(`   npm run hubspot -- register ${appName} ${environment}`);
      } else if (response.status === 405) {
        console.error('\n💡 Update method not supported by API');
        console.error('🔄 Use delete and recreate instead:');
        console.log(`   npm run hubspot -- delete ${appName} ${environment} ${actionId}`);
        console.log(`   npm run hubspot -- register ${appName} ${environment}`);
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error updating workflow action:', error.message);
    console.error('\n🔄 Falling back to delete and recreate:');
    console.log(`   npm run hubspot -- delete ${appName} ${environment} ${actionId}`);
    console.log(`   npm run hubspot -- register ${appName} ${environment}`);
    process.exit(1);
  }
}

async function listActionsQuiet() {
  const apiUrl = `https://api.hubapi.com/automation/v4/actions/${hubspotConfig.appId}?hapikey=${hubspotConfig.developerApiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();

    if (response.ok) {
      return JSON.parse(responseText);
    } else {
      throw new Error(`Failed to list actions: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(`Error listing workflow actions: ${error.message}`);
  }
}

async function listActions() {
  console.log(`📋 Listing workflow actions for ${appName} (${environment})...`);
  console.log(`   App ID: ${hubspotConfig.appId}`);

  const apiUrl = `https://api.hubapi.com/automation/v4/actions/${hubspotConfig.appId}?hapikey=${hubspotConfig.developerApiKey}`;

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
      
      if (result.results && result.results.length > 0) {
        console.log(`\n✅ Found ${result.results.length} workflow action(s):`);
        console.log('');
        
        result.results.forEach((action, index) => {
          console.log(`📌 Action ${index + 1}:`);
          console.log(`   ID: ${action.id || action.actionDefinitionId}`);
          console.log(`   Name: ${action.labels?.en?.actionName || 'N/A'}`);
          console.log(`   Status: ${action.published ? '✅ Published' : '⚠️ Draft'}`);
          console.log(`   Created: ${action.createdAt ? new Date(action.createdAt).toLocaleString() : 'N/A'}`);
          console.log(`   Updated: ${action.updatedAt ? new Date(action.updatedAt).toLocaleString() : 'N/A'}`);
          console.log(`   Action URL: ${action.actionUrl || 'N/A'}`);
          console.log('');
        });
        
        console.log('💡 Management Commands:');
        result.results.forEach((action) => {
          const actionId = action.id || action.actionDefinitionId;
          console.log(`   Delete "${action.labels?.en?.actionName}": npm run hubspot -- delete ${appName} ${environment} ${actionId}`);
        });
      } else {
        console.log('📭 No workflow actions found for this app');
        console.log('\n💡 Register a new action:');
        console.log(`   npm run hubspot -- register ${appName} ${environment}`);
      }
      
      return result;
    } else {
      console.error('❌ Failed to list workflow actions');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${responseText}`);
      
      if (response.status === 404) {
        console.error('\n💡 This might mean:');
        console.error('   1. The app ID is incorrect');
        console.error('   2. No actions have been registered for this app yet');
        console.error('   3. The developer API key doesn\'t have access to this app');
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error listing workflow actions:', error.message);
    process.exit(1);
  }
}

async function deleteAction() {
  if (!actionId) {
    console.error('❌ Action ID is required for delete command');
    console.log(`Usage: npm run hubspot -- delete ${appName} ${environment} <action-id>`);
    console.log('\n💡 List actions to find IDs:');
    console.log(`   npm run hubspot -- list ${appName} ${environment}`);
    process.exit(1);
  }

  console.log(`🗑️  Deleting workflow action ${actionId} for ${appName} (${environment})...`);

  const apiUrl = `https://api.hubapi.com/automation/v4/actions/${hubspotConfig.appId}/${actionId}?hapikey=${hubspotConfig.developerApiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Workflow action deleted successfully!');
      console.log(`   Action ID: ${actionId}`);
      console.log('\n💡 You can now register a new version:');
      console.log(`   npm run hubspot -- register ${appName} ${environment}`);
    } else {
      const responseText = await response.text();
      console.error('❌ Failed to delete workflow action');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${responseText}`);
      
      if (response.status === 404) {
        console.error('\n💡 Action not found. Check the action ID:');
        console.log(`   npm run hubspot -- list ${appName} ${environment}`);
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error deleting workflow action:', error.message);
    process.exit(1);
  }
}

// Execute the requested command
switch (command) {
  case 'register':
    await registerAction();
    break;
  case 'update':
    await updateAction();
    break;
  case 'list':
    await listActions();
    break;
  case 'delete':
    await deleteAction();
    break;
}