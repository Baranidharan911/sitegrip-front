import React from 'react';
import { Zap, Shield, Users, BarChart3, Globe, Settings, CheckCircle, ArrowRight } from 'lucide-react';

const Integrations: React.FC = () => {
  const integrations = [
    {
      name: 'WordPress',
      description: 'Seamless integration with your WordPress site',
      icon: 'W',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      badge: 'Popular'
    },
    {
      name: 'Shopify',
      description: 'Connect your e-commerce store effortlessly',
      icon: 'S',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      name: 'Slack',
      description: 'Get instant alerts and notifications',
      icon: 'S',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      badge: 'New'
    },
    {
      name: 'Zapier',
      description: 'Connect to thousands of apps automatically',
      icon: 'Z',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      name: 'Analytics',
      description: 'Track performance with detailed insights',
      icon: 'A',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
    },
    {
      name: 'GSC',
      description: 'Google Search Console integration',
      icon: 'G',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-800'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 compliant with end-to-end encryption',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Manage access with granular permissions',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Monitor performance with detailed insights',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Globe,
      title: 'Global Infrastructure',
      description: '99.9% uptime with worldwide CDN',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section className="relative z-10 px-6 py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-blue-200/10 via-transparent to-transparent rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm mb-6">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Enterprise Integrations
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Works With Your{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Existing Tools
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
            Site Grip integrates seamlessly with the platforms you already use and love. 
            Get uptime alerts in Slack, trigger indexing from WordPress, and connect to thousands of apps with Zapier.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-start">
          {/* Left Column - Integration Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {integrations.map((integration, index) => (
                <div
                  key={index}
                  className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${integration.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Badge */}
                  {integration.badge && (
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        integration.badge === 'Popular' 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                          : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                      }`}>
                        {integration.badge}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                    <span className="text-white font-bold text-xl">
                      {integration.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {integration.description}
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center pt-6">
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group">
                <span>Explore All Integrations</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column - Features Grid */}
          <div className="space-y-6">
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Enterprise-Grade Features
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Built for teams that demand reliability, security, and performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/40 dark:border-slate-700/40 rounded-xl p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/20 dark:border-blue-800/20">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">99.9%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">24/7</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Connect your existing tools and start monitoring your SEO performance in minutes. 
              No complex setup required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                Start Free Trial
              </button>
              <button className="px-8 py-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold rounded-xl transition-all duration-300 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-800/80">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations; 
