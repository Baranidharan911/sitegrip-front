import { 
  NotificationConfig, 
  Incident, 
  Monitor, 
  EscalationPolicy, 
  EscalationLevel,
  QuietHoursConfig,
  MaintenanceWindow,
  AutoRemediationConfig,
  AutoRemediationAction,
  AutoRemediationAttempt
} from '../types/uptime';

// ============================
// 🔔 ENHANCED NOTIFICATION SYSTEM
// ============================

export class EnhancedNotificationSystem {
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map();
  private maintenanceWindows: Map<string, MaintenanceWindow> = new Map();
  private autoRemediationAttempts: Map<string, AutoRemediationAttempt[]> = new Map();

  // ============================
  // 📧 MULTI-CHANNEL NOTIFICATIONS
  // ============================

  async sendNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    if (!notification.enabled) {
      console.log(`🔕 Notification ${notification.type} is disabled`);
      return false;
    }

    // Check quiet hours
    if (this.isInQuietHours(notification, incident)) {
      console.log(`🌙 Quiet hours active, skipping notification ${notification.type}`);
      return false;
    }

    // Check maintenance windows
    if (this.isInMaintenanceWindow(monitor.id)) {
      console.log(`🔧 Maintenance window active for monitor ${monitor.id}, skipping notification`);
      return false;
    }

    try {
      switch (notification.type) {
        case 'email':
          return await this.sendEmailNotification(notification, incident, monitor, message);
        case 'webhook':
          return await this.sendWebhookNotification(notification, incident, monitor, message);
        case 'slack':
          return await this.sendSlackNotification(notification, incident, monitor, message);
        case 'discord':
          return await this.sendDiscordNotification(notification, incident, monitor, message);
        case 'telegram':
          return await this.sendTelegramNotification(notification, incident, monitor, message);
        case 'sms':
          return await this.sendSMSNotification(notification, incident, monitor, message);
        case 'teams':
          return await this.sendTeamsNotification(notification, incident, monitor, message);
        case 'whatsapp':
          return await this.sendWhatsAppNotification(notification, incident, monitor, message);
        case 'pagerduty':
          return await this.sendPagerDutyNotification(notification, incident, monitor, message);
        case 'opsgenie':
          return await this.sendOpsGenieNotification(notification, incident, monitor, message);
        default:
          console.error(`❌ Unknown notification type: ${notification.type}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ Failed to send ${notification.type} notification:`, error);
      return false;
    }
  }

  private async sendEmailNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    const config = notification.config.email;
    if (!config?.addresses?.length) return false;

    const subject = `[${incident.severity.toUpperCase()}] ${incident.title} - ${monitor.name}`;
    const body = this.generateEmailBody(incident, monitor, message);

    // In a real implementation, you'd use a proper email service
    console.log(`📧 Sending email to ${config.addresses.join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  }

  private async sendWebhookNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    const config = notification.config.webhook;
    if (!config?.url) return false;

    const payload = {
      incident: {
        id: incident.id,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        startTime: incident.startTime,
        endTime: incident.endTime
      },
      monitor: {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        type: monitor.type
      },
      message,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(config.url, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: config.body || JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook notification failed:', error);
      return false;
    }
  }

  private async sendSlackNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    const config = notification.config.slack;
    if (!config?.webhookUrl) return false;

    const color = this.getSeverityColor(incident.severity);
    const payload = {
      username: config.username || 'WebWatch Monitor',
      icon_emoji: config.icon || ':warning:',
      channel: config.channel,
      attachments: [{
        color,
        title: incident.title,
        text: incident.description,
        fields: [
          {
            title: 'Monitor',
            value: monitor.name,
            short: true
          },
          {
            title: 'Severity',
            value: incident.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Status',
            value: incident.status,
            short: true
          },
          {
            title: 'URL',
            value: monitor.url,
            short: true
          }
        ],
        footer: 'WebWatch Monitoring',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Slack notification failed:', error);
      return false;
    }
  }

  private async sendDiscordNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    const config = notification.config.discord;
    if (!config?.webhookUrl) return false;

    const color = this.getSeverityColorDecimal(incident.severity);
    const payload = {
      username: config.username || 'WebWatch Monitor',
      avatar_url: config.avatar,
      embeds: [{
        title: incident.title,
        description: incident.description,
        color,
        fields: [
          {
            name: 'Monitor',
            value: monitor.name,
            inline: true
          },
          {
            name: 'Severity',
            value: incident.severity.toUpperCase(),
            inline: true
          },
          {
            name: 'Status',
            value: incident.status,
            inline: true
          },
          {
            name: 'URL',
            value: monitor.url,
            inline: true
          }
        ],
        footer: {
          text: 'WebWatch Monitoring'
        },
        timestamp: new Date().toISOString()
      }]
    };

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Discord notification failed:', error);
      return false;
    }
  }

  private async sendTelegramNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    const config = notification.config.telegram;
    if (!config?.botToken || !config?.chatId) return false;

    const text = `🚨 *${incident.title}*\n\n` +
                 `📊 *Monitor:* ${monitor.name}\n` +
                 `🔴 *Severity:* ${incident.severity.toUpperCase()}\n` +
                 `📝 *Status:* ${incident.status}\n` +
                 `🌐 *URL:* ${monitor.url}\n\n` +
                 `${incident.description}`;

    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text,
          parse_mode: 'Markdown'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Telegram notification failed:', error);
      return false;
    }
  }

  private async sendSMSNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    const config = notification.config.sms;
    if (!config?.phoneNumbers?.length) return false;

    const text = `[${incident.severity.toUpperCase()}] ${incident.title} - ${monitor.name}: ${message}`;

    // In a real implementation, you'd use Twilio, AWS SNS, or similar
    console.log(`📱 Sending SMS to ${config.phoneNumbers.join(', ')}`);
    console.log(`Message: ${text}`);

    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  }

  private async sendTeamsNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    const config = notification.config.teams;
    if (!config?.webhookUrl) return false;

    const payload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": this.getSeverityColor(incident.severity),
      "summary": incident.title,
      "sections": [{
        "activityTitle": incident.title,
        "activitySubtitle": monitor.name,
        "facts": [
          {
            "name": "Severity",
            "value": incident.severity.toUpperCase()
          },
          {
            "name": "Status",
            "value": incident.status
          },
          {
            "name": "URL",
            "value": monitor.url
          },
          {
            "name": "Description",
            "value": incident.description
          }
        ]
      }]
    };

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Teams notification failed:', error);
      return false;
    }
  }

  private async sendWhatsAppNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    const config = notification.config.whatsapp;
    if (!config?.phoneNumbers?.length) return false;

    const text = `🚨 *${incident.title}*\n\n` +
                 `📊 Monitor: ${monitor.name}\n` +
                 `🔴 Severity: ${incident.severity.toUpperCase()}\n` +
                 `📝 Status: ${incident.status}\n` +
                 `🌐 URL: ${monitor.url}\n\n` +
                 `${incident.description}`;

    // In a real implementation, you'd use WhatsApp Business API
    console.log(`📱 Sending WhatsApp message to ${config.phoneNumbers.join(', ')}`);
    console.log(`Message: ${text}`);

    // Simulate WhatsApp sending
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return true;
  }

  private async sendPagerDutyNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    const config = notification.config.pagerduty;
    if (!config?.apiKey || !config?.serviceId) return false;

    const payload = {
      routing_key: config.apiKey,
      event_action: 'trigger',
      payload: {
        summary: incident.title,
        source: monitor.url,
        severity: incident.severity,
        custom_details: {
          monitor_name: monitor.name,
          description: incident.description,
          status: incident.status
        }
      }
    };

    try {
      const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('PagerDuty notification failed:', error);
      return false;
    }
  }

  private async sendOpsGenieNotification(
    notification: NotificationConfig,
    incident: Incident,
    monitor: Monitor,
    message: string
  ): Promise<boolean> {
    const config = notification.config.opsgenie;
    if (!config?.apiKey) return false;

    const payload = {
      message: incident.title,
      description: incident.description,
      alias: incident.id,
      priority: this.mapSeverityToPriority(incident.severity),
      tags: [monitor.name, incident.severity, 'webwatch'],
      details: {
        monitor_name: monitor.name,
        monitor_url: monitor.url,
        incident_status: incident.status,
        severity: incident.severity
      }
    };

    try {
      const response = await fetch('https://api.opsgenie.com/v2/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `GenieKey ${config.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('OpsGenie notification failed:', error);
      return false;
    }
  }

  // ============================
  // ⚡ ESCALATION POLICIES
  // ============================

  async handleEscalation(
    incident: Incident,
    monitor: Monitor,
    notifications: NotificationConfig[]
  ): Promise<void> {
    const escalationPolicy = notifications.find(n => n.escalationPolicy?.enabled)?.escalationPolicy;
    
    if (!escalationPolicy) {
      // Send immediate notifications without escalation
      await Promise.all(
        notifications.map(notification => 
          this.sendNotification(notification, incident, monitor, this.generateIncidentMessage(incident, monitor))
        )
      );
      return;
    }

    console.log(`⚡ Starting escalation for incident ${incident.id}`);

    // Start escalation timer for first level
    this.startEscalationTimer(incident.id, 0, escalationPolicy, incident, monitor);
  }

  private startEscalationTimer(
    incidentId: string,
    level: number,
    escalationPolicy: EscalationPolicy,
    incident: Incident,
    monitor: Monitor
  ): void {
    const escalationLevel = escalationPolicy.levels.find(l => l.level === level);
    
    if (!escalationLevel || level >= escalationPolicy.maxEscalations) {
      console.log(`⚡ Escalation complete for incident ${incidentId}`);
      return;
    }

    const timerId = setTimeout(async () => {
      console.log(`⚡ Escalating incident ${incidentId} to level ${level}`);

      // Send notifications for this level
      await Promise.all(
        escalationLevel.notifications.map(notification =>
          this.sendNotification(notification, incident, monitor, 
            `ESCALATED: ${this.generateIncidentMessage(incident, monitor)}`)
        )
      );

      // Execute escalation actions
      await this.executeEscalationActions(escalationLevel.actions, incident, monitor);

      // Start next escalation level
      this.startEscalationTimer(incidentId, level + 1, escalationPolicy, incident, monitor);
    }, escalationLevel.delay * 60 * 1000); // Convert minutes to milliseconds

    this.escalationTimers.set(`${incidentId}-${level}`, timerId);
  }

  private async executeEscalationActions(
    actions: string[],
    incident: Incident,
    monitor: Monitor
  ): Promise<void> {
    for (const action of actions) {
      try {
        console.log(`⚡ Executing escalation action: ${action}`);
        
        switch (action) {
          case 'notify_manager':
            await this.notifyManager(incident, monitor);
            break;
          case 'create_ticket':
            await this.createSupportTicket(incident, monitor);
            break;
          case 'page_oncall':
            await this.pageOnCall(incident, monitor);
            break;
          case 'scale_up':
            await this.scaleUpService(monitor);
            break;
          default:
            console.warn(`⚠️ Unknown escalation action: ${action}`);
        }
      } catch (error) {
        console.error(`❌ Failed to execute escalation action ${action}:`, error);
      }
    }
  }

  // ============================
  // 🌙 QUIET HOURS
  // ============================

  private isInQuietHours(notification: NotificationConfig, incident: Incident): boolean {
    const quietHours = notification.quietHours;
    
    if (!quietHours?.enabled) return false;

    // Check if this incident is an exception
    if (quietHours.exceptions.includes(incident.id)) return false;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: quietHours.timezone 
    });
    
    const currentDay = now.getDay();
    
    // Check if current day is in quiet hours
    if (!quietHours.daysOfWeek.includes(currentDay)) return false;

    // Check if current time is in quiet hours
    const [startHour, startMin] = quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = quietHours.endTime.split(':').map(Number);
    const [currentHour, currentMin] = currentTime.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  // ============================
  // 🔧 MAINTENANCE WINDOWS
  // ============================

  addMaintenanceWindow(window: MaintenanceWindow): void {
    this.maintenanceWindows.set(window.id, window);
    console.log(`🔧 Added maintenance window: ${window.name}`);
  }

  removeMaintenanceWindow(windowId: string): void {
    this.maintenanceWindows.delete(windowId);
    console.log(`🔧 Removed maintenance window: ${windowId}`);
  }

  private isInMaintenanceWindow(monitorId: string): boolean {
    const now = new Date();
    
    for (const window of Array.from(this.maintenanceWindows.values())) {
      if (window.affectedMonitors.includes(monitorId) &&
          now >= window.startTime && now <= window.endTime) {
        return true;
      }
    }
    
    return false;
  }

  // ============================
  // 🤖 AUTO-REMEDIATION
  // ============================

  async attemptAutoRemediation(
    incident: Incident,
    monitor: Monitor,
    config: AutoRemediationConfig
  ): Promise<AutoRemediationAttempt> {
    if (!config?.enabled) {
      return {
        attempted: false,
        success: false,
        action: 'Auto-remediation disabled',
        timestamp: new Date(),
        result: 'Not attempted'
      };
    }

    const attempts = this.autoRemediationAttempts.get(incident.id) || [];
    
    // Check if we've exceeded max attempts
    if (attempts.length >= config.maxAttempts) {
      return {
        attempted: false,
        success: false,
        action: 'Max attempts exceeded',
        timestamp: new Date(),
        result: `Already attempted ${attempts.length} times`
      };
    }

    // Check cooldown period
    const lastAttempt = attempts[attempts.length - 1];
    if (lastAttempt && 
        Date.now() - lastAttempt.timestamp.getTime() < config.cooldownPeriod * 60 * 1000) {
      return {
        attempted: false,
        success: false,
        action: 'In cooldown period',
        timestamp: new Date(),
        result: 'Waiting for cooldown to expire'
      };
    }

    // Find applicable actions
    const applicableActions = config.actions.filter(action =>
      action.conditions.incidentSeverity.includes(incident.severity)
    );

    if (applicableActions.length === 0) {
      return {
        attempted: false,
        success: false,
        action: 'No applicable actions',
        timestamp: new Date(),
        result: 'No actions configured for this severity'
      };
    }

    // Execute the first applicable action
    const action = applicableActions[0];
    const attempt: AutoRemediationAttempt = {
      attempted: true,
      success: false,
      action: action.name,
      timestamp: new Date(),
      result: '',
      error: ''
    };

    try {
      console.log(`🤖 Attempting auto-remediation: ${action.name}`);
      
      switch (action.type) {
        case 'webhook':
          attempt.result = await this.executeWebhookRemediation(action, incident, monitor);
          break;
        case 'restart_service':
          attempt.result = await this.executeServiceRestart(action, monitor);
          break;
        case 'rollback_deployment':
          attempt.result = await this.executeDeploymentRollback(action, monitor);
          break;
        case 'scale_up':
          attempt.result = await this.executeScaleUp(action, monitor);
          break;
        case 'failover':
          attempt.result = await this.executeFailover(action, monitor);
          break;
        case 'custom_script':
          attempt.result = await this.executeCustomScript(action, incident, monitor);
          break;
        default:
          throw new Error(`Unknown remediation type: ${action.type}`);
      }

      attempt.success = true;
      console.log(`✅ Auto-remediation successful: ${action.name}`);
      
    } catch (error) {
      attempt.success = false;
      attempt.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Auto-remediation failed: ${action.name}`, error);
    }

    // Store attempt
    attempts.push(attempt);
    this.autoRemediationAttempts.set(incident.id, attempts);

    return attempt;
  }

  private async executeWebhookRemediation(
    action: AutoRemediationAction,
    incident: Incident,
    monitor: Monitor
  ): Promise<string> {
    const { url, method = 'POST', headers = {}, body } = action.config;
    
    const payload = body || JSON.stringify({
      incident: incident.id,
      monitor: monitor.id,
      action: action.name,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: payload
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
    }

    return `Webhook executed successfully (${response.status})`;
  }

  private async executeServiceRestart(action: AutoRemediationAction, monitor: Monitor): Promise<string> {
    // In a real implementation, you'd call your infrastructure API
    console.log(`🔄 Restarting service for monitor ${monitor.name}`);
    
    // Simulate service restart
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return 'Service restart initiated';
  }

  private async executeDeploymentRollback(action: AutoRemediationAction, monitor: Monitor): Promise<string> {
    // In a real implementation, you'd call your CI/CD system
    console.log(`🔄 Rolling back deployment for monitor ${monitor.name}`);
    
    // Simulate deployment rollback
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    return 'Deployment rollback completed';
  }

  private async executeScaleUp(action: AutoRemediationAction, monitor: Monitor): Promise<string> {
    // In a real implementation, you'd call your cloud provider API
    console.log(`📈 Scaling up resources for monitor ${monitor.name}`);
    
    // Simulate scale up
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return 'Resources scaled up successfully';
  }

  private async executeFailover(action: AutoRemediationAction, monitor: Monitor): Promise<string> {
    // In a real implementation, you'd call your load balancer API
    console.log(`🔄 Executing failover for monitor ${monitor.name}`);
    
    // Simulate failover
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    return 'Failover completed successfully';
  }

  private async executeCustomScript(action: AutoRemediationAction, incident: Incident, monitor: Monitor): Promise<string> {
    const { script, timeout = 30000 } = action.config;
    
    // In a real implementation, you'd execute the script in a secure environment
    console.log(`📜 Executing custom script for monitor ${monitor.name}`);
    
    // Simulate script execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return 'Custom script executed successfully';
  }

  // ============================
  // 🎨 UTILITY FUNCTIONS
  // ============================

  private generateIncidentMessage(incident: Incident, monitor: Monitor): string {
    return `${incident.title} - ${monitor.name} (${monitor.url}) is ${incident.status}`;
  }

  private generateEmailBody(incident: Incident, monitor: Monitor, message: string): string {
    return `
      <h2>${incident.title}</h2>
      <p><strong>Monitor:</strong> ${monitor.name}</p>
      <p><strong>URL:</strong> ${monitor.url}</p>
      <p><strong>Severity:</strong> ${incident.severity.toUpperCase()}</p>
      <p><strong>Status:</strong> ${incident.status}</p>
      <p><strong>Description:</strong> ${incident.description}</p>
      <p><strong>Started:</strong> ${incident.startTime.toLocaleString()}</p>
      ${incident.endTime ? `<p><strong>Resolved:</strong> ${incident.endTime.toLocaleString()}</p>` : ''}
      <hr>
      <p>${message}</p>
    `;
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6600';
      case 'medium': return '#ffcc00';
      case 'low': return '#00cc00';
      default: return '#666666';
    }
  }

  private getSeverityColorDecimal(severity: string): number {
    switch (severity) {
      case 'critical': return 0xff0000;
      case 'high': return 0xff6600;
      case 'medium': return 0xffcc00;
      case 'low': return 0x00cc00;
      default: return 0x666666;
    }
  }

  private mapSeverityToPriority(severity: string): string {
    switch (severity) {
      case 'critical': return 'P1';
      case 'high': return 'P2';
      case 'medium': return 'P3';
      case 'low': return 'P4';
      default: return 'P5';
    }
  }

  // Placeholder methods for escalation actions
  private async notifyManager(incident: Incident, monitor: Monitor): Promise<void> {
    console.log(`📧 Notifying manager about incident ${incident.id}`);
  }

  private async createSupportTicket(incident: Incident, monitor: Monitor): Promise<void> {
    console.log(`🎫 Creating support ticket for incident ${incident.id}`);
  }

  private async pageOnCall(incident: Incident, monitor: Monitor): Promise<void> {
    console.log(`📱 Paging on-call engineer for incident ${incident.id}`);
  }

  private async scaleUpService(monitor: Monitor): Promise<void> {
    console.log(`📈 Scaling up service for monitor ${monitor.id}`);
  }

  // ============================
  // 🧹 CLEANUP
  // ============================

  clearEscalationTimers(incidentId: string): void {
    for (const [key, timer] of this.escalationTimers.entries()) {
      if (key.startsWith(incidentId)) {
        clearTimeout(timer);
        this.escalationTimers.delete(key);
      }
    }
  }

  getAutoRemediationAttempts(incidentId: string): AutoRemediationAttempt[] {
    return this.autoRemediationAttempts.get(incidentId) || [];
  }
}

// Export singleton instance
export const enhancedNotificationSystem = new EnhancedNotificationSystem(); 