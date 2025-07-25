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


export interface WorkflowRequest {
  callbackId: string;
  origin: {
    portalId: number;
    userId: number | null;
    actionDefinitionId: number;
    actionDefinitionVersion: number;
    actionExecutionIndexIdentifier: {
      enrollmentId: number;
      actionExecutionIndex: number;
    };
    extensionDefinitionVersionId: number;
    extensionDefinitionId: number;
  };
  context: {
    workflowId: number;
    actionId: number;
    actionExecutionIndexIdentifier: {
      enrollmentId: number;
      actionExecutionIndex: number;
    };
    source: string;
  };
  object: {
    objectId: number;
    objectType: string;
  };
  fields: Record<string, string>;
  inputFields: Record<string, string>;
  typedInputs: Record<string, {
    value: string;
    type: string;
  }>;
}

export interface WorkflowResponse {
  outputFields: Record<string, string>;
}


export type DateFormat = 
  | 'US_STANDARD'    // MM/DD/YYYY
  | 'UK_STANDARD'    // DD/MM/YYYY
  | 'ISO_STANDARD'   // YYYY-MM-DD
  | 'US_WRITTEN'     // January 15, 2025
  | 'EU_WRITTEN'     // 15 January 2025
  | 'TAIWAN_STANDARD' // 2025年01月15日
  | 'HONG_KONG_STANDARD' // 15/01/2025
  | 'KOREA_STANDARD' // 2025년 01월 15일
  | 'CUSTOM';        // Custom format pattern