import { sendGTMEvent } from '@next/third-parties/google';

export enum EventCategory {
  APP_INSTALLATION = 'app_installation',
  WEBHOOK_USAGE = 'webhook_usage',
  DASHBOARD = 'dashboard',
  ERROR = 'error',
  USER_ACTION = 'user_action',
  API_KEY = 'api_key'
}

export enum EventAction {
  INSTALL_SUCCESS = 'install_success',
  INSTALL_ERROR = 'install_error',
  DATE_FORMATTER_REQUEST = 'date_formatter_request',
  URL_SHORTENER_REQUEST = 'url_shortener_request',
  DASHBOARD_VIEW = 'dashboard_view',
  API_KEY_CONFIGURED = 'api_key_configured',
  API_KEY_TESTED = 'api_key_tested',
  WEBHOOK_ERROR = 'webhook_error',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit'
}

interface GTMEventParams {
  event: string;
  category?: EventCategory;
  action?: EventAction;
  label?: string;
  value?: number | string;
  portal_id?: number;
  app_type?: string;
  error_code?: string;
  [key: string]: unknown;
}

export function trackEvent(params: GTMEventParams): void {
  try {
    const { event, category, action, label, value, portal_id, app_type, error_code, ...rest } = params;
    sendGTMEvent({
      event: event || 'custom_event',
      event_category: category,
      event_action: action,
      event_label: label,
      event_value: value,
      portal_id,
      app_type,
      error_code,
      ...rest
    });
  } catch (error) {
    console.error('Failed to send GTM event:', error);
  }
}

export function trackAppInstallation(portalId: number, appType: string, success: boolean): void {
  trackEvent({
    event: 'app_installation',
    category: EventCategory.APP_INSTALLATION,
    action: success ? EventAction.INSTALL_SUCCESS : EventAction.INSTALL_ERROR,
    label: appType,
    value: 1,
    portal_id: portalId,
    app_type: appType
  });
}

export function trackWebhookUsage(portalId: number, appType: string, success: boolean, responseTime?: number): void {
  const actionMap = {
    'date-formatter': EventAction.DATE_FORMATTER_REQUEST,
    'url-shortener': EventAction.URL_SHORTENER_REQUEST
  } as const;

  trackEvent({
    event: 'webhook_usage',
    category: EventCategory.WEBHOOK_USAGE,
    action: actionMap[appType as keyof typeof actionMap] || 'webhook_request',
    label: success ? 'success' : 'error',
    value: responseTime || 0,
    portal_id: portalId,
    app_type: appType,
    success
  });
}

export function trackDashboardView(portalId?: number, section?: string): void {
  trackEvent({
    event: 'dashboard_view',
    category: EventCategory.DASHBOARD,
    action: EventAction.DASHBOARD_VIEW,
    label: section || 'main',
    portal_id: portalId
  });
}

export function trackApiKeyConfig(portalId: number, service: string, action: 'configured' | 'tested'): void {
  trackEvent({
    event: 'api_key_config',
    category: EventCategory.API_KEY,
    action: action === 'configured' ? EventAction.API_KEY_CONFIGURED : EventAction.API_KEY_TESTED,
    label: service,
    portal_id: portalId
  });
}

export function trackError(errorCode: string, errorMessage: string, context?: Record<string, unknown>): void {
  trackEvent({
    event: 'error',
    category: EventCategory.ERROR,
    action: EventAction.WEBHOOK_ERROR,
    label: errorCode,
    error_code: errorCode,
    error_message: errorMessage,
    ...context
  });
}

export function trackButtonClick(buttonName: string, context?: Record<string, unknown>): void {
  trackEvent({
    event: 'button_click',
    category: EventCategory.USER_ACTION,
    action: EventAction.BUTTON_CLICK,
    label: buttonName,
    ...context
  });
}

export function trackFormSubmit(formName: string, context?: Record<string, unknown>): void {
  trackEvent({
    event: 'form_submit',
    category: EventCategory.USER_ACTION,
    action: EventAction.FORM_SUBMIT,
    label: formName,
    ...context
  });
}