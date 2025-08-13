/**
 * HubSpot-related types
 */

import type { AppType } from '@/lib/shared/types';

// HubSpot business entities
export interface HubSpotInstallation {
  id: string;
  hubId: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scope: string;
  appType: AppType;
  createdAt: string;
  updatedAt: string;
}

export interface PortalInfo {
  portalId: number;
  name: string;
  domain: string;
  userEmail: string | null;
  userName: string | null;
  organization: string | null;
  createdAt: string;
  updatedAt: string;
}

// HubSpot OAuth types
export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface HubSpotOAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// HubSpot Webhook types
export interface WorkflowRequest {
  callbackId?: string;
  origin: {
    portalId: number;
    actionDefinitionId?: number;
  };
  inputFields?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface WorkflowResponse {
  outputFields: Record<string, unknown>;
}

// HubSpot API response types
export interface HubSpotAccessTokenResponse {
  token: string;
  user: string;
  hub_domain: string;
  scopes: string[];
  token_type: string;
  user_id: number;
  app_id: number;
  hub_id: number;
  is_private_distribution: boolean;
  signed_access_token: {
    expiresAt: number;
    scopes: string;
    hubId: number;
    userId: number;
    appId: number;
    signature: string;
    scopeToScopeGroupPks: string;
    newSignature: string;
    hublet: string;
    trialScopes: string;
    trialScopeToScopeGroupPks: string;
    isUserLevel: boolean;
    installingUserId: number;
    isServiceAccount: boolean;
    isPrivateDistribution: boolean;
  };
  expires_in: number;
}