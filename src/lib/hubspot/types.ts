/**
 * HubSpot API response types
 */

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