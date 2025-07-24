export interface HubSpotInstallation {
  id: string;
  hubId: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scope: string[];
  createdAt: string;
  updatedAt: string;
}

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

export interface HubSpotClientConfig {
  accessToken: string;
  basePath?: string;
}

export interface WorkflowRequest {
  actionDefinitionId: string;
  callbackId: string;
  portalId: number;
  object: {
    objectId: string;
    objectType: string;
    properties: Record<string, any>;
  };
  inputFields: Record<string, any>;
}

export interface WorkflowResponse {
  outputFields: Record<string, any>;
}

export interface DateFormatterInput {
  sourceDateProperty: string;
  targetFormat: string;
}

export interface DateFormatterOutput {
  formattedDate: string;
  originalDate: string;
  format: string;
}

export type DateFormat = 
  | 'US_STANDARD'    // MM/DD/YYYY
  | 'UK_STANDARD'    // DD/MM/YYYY
  | 'ISO_STANDARD'   // YYYY-MM-DD
  | 'US_WRITTEN'     // January 15, 2025
  | 'EU_WRITTEN';    // 15 January 2025