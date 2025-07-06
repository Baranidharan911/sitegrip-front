import { frontendUptimeApi } from './frontendUptimeApi';
import { CreateMonitorRequest, Monitor } from '../types/uptime';

const DEMO_MONITORS: CreateMonitorRequest[] = [
  {
    name: 'Google Search',
    url: 'https://www.google.com',
    type: 'http',
    interval: 60,
    timeout: 10,
    retries: 3,
    tags: ['search', 'google'],
    notifications: [],
    description: 'Monitor Google search availability',
    isActive: true,
    expectedStatusCode: 200,
    retryInterval: 30,
    threshold: {
      responseTime: 2000,
      statusCode: 200
    }
  },
  {
    name: 'GitHub',
    url: 'https://github.com',
    type: 'http',
    interval: 60,
    timeout: 10,
    retries: 3,
    tags: ['development', 'git'],
    notifications: [],
    description: 'Monitor GitHub platform status',
    isActive: true,
    expectedStatusCode: 200,
    retryInterval: 30,
    threshold: {
      responseTime: 3000,
      statusCode: 200
    }
  },
  {
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    type: 'http',
    interval: 120,
    timeout: 15,
    retries: 2,
    tags: ['qa', 'community'],
    notifications: [],
    description: 'Monitor Stack Overflow community platform',
    isActive: true,
    expectedStatusCode: 200,
    retryInterval: 60,
    threshold: {
      responseTime: 4000,
      statusCode: 200
    }
  },
  {
    name: 'Netflix',
    url: 'https://www.netflix.com',
    type: 'http',
    interval: 180,
    timeout: 20,
    retries: 2,
    tags: ['streaming', 'entertainment'],
    notifications: [],
    description: 'Monitor Netflix streaming service',
    isActive: true,
    expectedStatusCode: 200,
    retryInterval: 90,
    threshold: {
      responseTime: 5000,
      statusCode: 200
    }
  },
  {
    name: 'Spotify',
    url: 'https://open.spotify.com',
    type: 'http',
    interval: 120,
    timeout: 15,
    retries: 2,
    tags: ['music', 'streaming'],
    notifications: [],
    description: 'Monitor Spotify music streaming service',
    isActive: true,
    expectedStatusCode: 200,
    retryInterval: 60,
    threshold: {
      responseTime: 4000,
      statusCode: 200
    }
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com',
    type: 'http',
    interval: 90,
    timeout: 15,
    retries: 3,
    tags: ['social', 'twitter'],
    notifications: [],
    description: 'Monitor Twitter social platform',
    isActive: true,
    expectedStatusCode: 200,
    retryInterval: 45,
    threshold: {
      responseTime: 3000,
      statusCode: 200
    }
  },
  {
    name: 'Reddit',
    url: 'https://www.reddit.com',
    type: 'http',
    interval: 120,
    timeout: 15,
    retries: 2,
    tags: ['social', 'community'],
    notifications: [],
    description: 'Monitor Reddit community platform',
    isActive: true,
    expectedStatusCode: 200,
    retryInterval: 60,
    threshold: {
      responseTime: 4000,
      statusCode: 200
    }
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com',
    type: 'http',
    interval: 180,
    timeout: 20,
    retries: 2,
    tags: ['video', 'streaming'],
    notifications: [],
    description: 'Monitor YouTube video platform',
    isActive: true,
    expectedStatusCode: 200,
    retryInterval: 90,
    threshold: {
      responseTime: 5000,
      statusCode: 200
    }
  },
  {
    name: 'Amazon',
    url: 'https://www.amazon.com',
    type: 'http',
    interval: 120,
    timeout: 15,
    retries: 3,
    tags: ['ecommerce', 'shopping'],
    notifications: [],
    description: 'Monitor Amazon e-commerce platform',
    isActive: true,
    expectedStatusCode: 200,
    retryInterval: 60,
    threshold: {
      responseTime: 4000,
      statusCode: 200
    }
  },
  {
    name: 'Microsoft',
    url: 'https://www.microsoft.com',
    type: 'http',
    interval: 180,
    timeout: 15,
    retries: 2,
    tags: ['tech', 'software'],
    notifications: [],
    description: 'Monitor Microsoft corporate website',
    isActive: true,
    expectedStatusCode: 200,
    retryInterval: 90,
    threshold: {
      responseTime: 3000,
      statusCode: 200
    }
  }
];

export const initializeDemoData = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing demo data...');
    
    // Check if demo data already exists
    const existingMonitors = await frontendUptimeApi.getAllMonitors();
    
    if (existingMonitors.length > 0) {
      console.log('📊 Demo data already exists, skipping initialization');
      return;
    }

    console.log('📝 Creating demo monitors...');
    
    // Create demo monitors
    const createdMonitors: Monitor[] = [];
    for (const monitorData of DEMO_MONITORS) {
      try {
        const monitor = await frontendUptimeApi.createMonitor(monitorData);
        createdMonitors.push(monitor);
        console.log(`✅ Created demo monitor: ${monitor.name}`);
        
        // Small delay between creations to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to create demo monitor ${monitorData.name}:`, error);
      }
    }

    console.log(`🎉 Demo data initialization complete! Created ${createdMonitors.length} monitors`);
    
    // Show a welcome message
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        console.log(`
🎉 Welcome to WebWatch Uptime Monitoring!

📊 Demo monitors have been created for popular websites:
${createdMonitors.map(m => `• ${m.name} (${m.url})`).join('\n')}

🔄 Real-time monitoring is now active and will check these sites automatically.
📈 You can view uptime statistics, response times, and incident history.
🔧 Feel free to add, edit, or remove monitors as needed.

Happy monitoring! 🚀
        `);
      }, 1000);
    }

  } catch (error) {
    console.error('❌ Failed to initialize demo data:', error);
  }
};

export const clearDemoData = async (): Promise<void> => {
  try {
    console.log('🗑️ Clearing demo data...');
    
    const monitors = await frontendUptimeApi.getAllMonitors();
    
    for (const monitor of monitors) {
      try {
        await frontendUptimeApi.deleteMonitor(monitor.id);
        console.log(`✅ Deleted monitor: ${monitor.name}`);
      } catch (error) {
        console.error(`❌ Failed to delete monitor ${monitor.name}:`, error);
      }
    }
    
    console.log('🎉 Demo data cleared successfully!');
  } catch (error) {
    console.error('❌ Failed to clear demo data:', error);
  }
};

export const getDemoStats = () => {
  return {
    totalMonitors: DEMO_MONITORS.length,
    categories: ['search', 'development', 'social', 'streaming', 'ecommerce', 'tech'],
    averageInterval: Math.round(DEMO_MONITORS.reduce((sum, m) => sum + (m.interval || 60), 0) / DEMO_MONITORS.length),
    averageTimeout: Math.round(DEMO_MONITORS.reduce((sum, m) => sum + (m.timeout || 10), 0) / DEMO_MONITORS.length),
  };
}; 