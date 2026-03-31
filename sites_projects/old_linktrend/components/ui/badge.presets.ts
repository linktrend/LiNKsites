// Centralized badge class presets and domain mappings

export type PresetKey =
  | 'success.soft'
  | 'success.solid'
  | 'warning.soft'
  | 'warning.solid'
  | 'danger.soft'
  | 'danger.solid'
  | 'info.soft'
  | 'outline'
  // Domains
  | 'status.completed' | 'status.healthy' | 'status.online' | 'status.active'
  | 'status.degraded' | 'status.pending' | 'status.expiring'
  | 'status.failed' | 'status.error' | 'status.blocked' | 'status.suspended'
  | 'status.draft' | 'status.scheduled' | 'status.archived'
  | 'job.queued' | 'job.running' | 'job.completed' | 'job.failed' | 'job.canceled' | 'job.paused'
  | 'errors.severity.critical' | 'errors.severity.error' | 'errors.severity.warning' | 'errors.severity.info'
  | 'log.level.error' | 'log.level.warn' | 'log.level.info' | 'log.level.debug'
  | 'security.active' | 'security.inactive' | 'security.suspended' | 'security.role' | 'security.permission'
  | 'env.production' | 'env.staging' | 'env.development'
  | 'http.get' | 'http.post' | 'http.put' | 'http.patch' | 'http.delete'
  | 'feature.enabled' | 'feature.disabled'
  | 'billing.tier' | 'billing.subscription.trial' | 'billing.subscription.active' | 'billing.subscription.past_due' | 'billing.subscription.canceled'
  | 'billing.invoice.paid' | 'billing.invoice.pending' | 'billing.invoice.failed' | 'billing.invoice.refunded'
  | 'deployment.success' | 'deployment.in_progress' | 'deployment.failed'
  | 'priority.low' | 'priority.normal' | 'priority.high' | 'priority.urgent'
  | 'boolean.yes' | 'boolean.no'
  | 'tag' | 'source' | 'service';

const BASE = {
  successSoft: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  successSolid: 'bg-green-600 text-white dark:bg-green-500 dark:text-zinc-950',
  warningSoft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  warningSolid: 'bg-yellow-600 text-white dark:bg-yellow-500 dark:text-zinc-950',
  dangerSoft: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  dangerSolid: 'bg-red-600 text-white dark:bg-red-500 dark:text-zinc-950',
  infoSoft: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  outline: 'border border-zinc-200 text-zinc-950 dark:border-zinc-800 dark:text-zinc-50',
  graySoft: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100',
};

export function getBadgeClasses(use: PresetKey): string {
  switch (use) {
    // Base mappings
    case 'success.soft': return BASE.successSoft;
    case 'success.solid': return BASE.successSolid;
    case 'warning.soft': return BASE.warningSoft;
    case 'warning.solid': return BASE.warningSolid;
    case 'danger.soft': return BASE.dangerSoft;
    case 'danger.solid': return BASE.dangerSolid;
    case 'info.soft': return BASE.infoSoft;
    case 'outline': return BASE.outline;

    // Status (generic)
    case 'status.completed':
    case 'status.healthy':
    case 'status.online':
    case 'status.active':
      return BASE.successSoft;
    case 'status.degraded':
    case 'status.pending':
    case 'status.expiring':
      return BASE.warningSoft;
    case 'status.failed':
    case 'status.error':
    case 'status.blocked':
    case 'status.suspended':
      return BASE.dangerSoft;
    case 'status.draft':
    case 'status.scheduled':
    case 'status.archived':
      return BASE.infoSoft;

    // Job/Queue
    case 'job.queued': return BASE.warningSoft;
    case 'job.running': return BASE.graySoft;
    case 'job.completed': return BASE.successSoft;
    case 'job.failed':
    case 'job.canceled':
    case 'job.paused':
      return BASE.dangerSoft;

    // Errors & Logs
    case 'errors.severity.critical': return BASE.dangerSolid;
    case 'errors.severity.error': return BASE.dangerSolid;
    case 'errors.severity.warning': return BASE.warningSoft;
    case 'errors.severity.info': return BASE.infoSoft;

    case 'log.level.error': return BASE.dangerSoft;
    case 'log.level.warn': return BASE.warningSoft;
    case 'log.level.info':
    case 'log.level.debug':
      return BASE.infoSoft;

    // Security & Access
    case 'security.active': return BASE.successSoft;
    case 'security.inactive': return BASE.dangerSoft;
    case 'security.suspended': return BASE.warningSolid;
    case 'security.role': return BASE.outline;
    case 'security.permission': return BASE.infoSoft;

    // Environments
    case 'env.production': return BASE.successSoft;
    case 'env.staging': return BASE.warningSoft;
    case 'env.development': return BASE.infoSoft;

    // HTTP
    case 'http.get':
    case 'http.post':
    case 'http.put':
    case 'http.patch':
      return BASE.infoSoft;
    case 'http.delete': return BASE.dangerSoft;

    // Feature Flags
    case 'feature.enabled': return BASE.successSoft;
    case 'feature.disabled': return BASE.dangerSoft;

    // Plans & Billing
    case 'billing.tier': return BASE.infoSoft;
    case 'billing.subscription.trial': return BASE.infoSoft;
    case 'billing.subscription.active': return BASE.successSoft;
    case 'billing.subscription.past_due': return BASE.warningSolid;
    case 'billing.subscription.canceled': return BASE.dangerSoft;
    case 'billing.invoice.paid': return BASE.successSoft;
    case 'billing.invoice.pending': return BASE.warningSoft;
    case 'billing.invoice.failed': return BASE.dangerSolid;
    case 'billing.invoice.refunded': return BASE.infoSoft;

    // Deployment
    case 'deployment.success': return BASE.successSoft;
    case 'deployment.in_progress': return BASE.warningSoft;
    case 'deployment.failed': return BASE.dangerSoft;

    // Priority
    case 'priority.low': return BASE.successSoft;
    case 'priority.normal': return BASE.warningSoft;
    case 'priority.high': return BASE.dangerSoft;
    case 'priority.urgent': return BASE.dangerSolid;

    // Boolean
    case 'boolean.yes': return BASE.successSoft;
    case 'boolean.no': return BASE.dangerSoft;

    // Tags / sources / services
    case 'tag':
    case 'source':
    case 'service':
      return BASE.infoSoft;

    default:
      return BASE.outline;
  }
}

// Only exception where an icon is allowed
export function getGeneratingBadge(): string {
  return BASE.infoSoft;
}


