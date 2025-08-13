/**
 * Environment Type Definition
 * Simple type export for environment detection
 */

export type Environment = 'dev' | 'prod';

/**
 * This file used to contain environment variable loading logic.
 * That functionality has been moved to ConfigLoader and config/credentials JSON files.
 * Only the Environment type is still used by ConfigManager.
 */