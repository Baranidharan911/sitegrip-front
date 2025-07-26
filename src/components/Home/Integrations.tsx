'use client';
import React from 'react';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  Play,
  Star,
  Users,
  Clock,
  Award,
  Sparkles,
  Search,
  BarChart3,
  Settings
} from 'lucide-react';

const Integrations = () => {
  const integrations = [
    {
      name: 'WordPress',
      description: 'Seamless plugin integration for instant SEO optimization',
      icon: 'W',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badge: 'Popular'
    },
    {
      name: 'Shopify',
      description: 'Direct e-commerce optimization and performance tracking',
      icon: 'S',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      badge: 'New'
    },
    {
      name: 'Slack',
      description: 'Real-time alerts and notifications for your team',
      icon: 'S',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      name: 'Zapier',
      description: 'Connect with 5000+ apps and automate workflows',
      icon: 'Z',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      name: 'Analytics',
      description: 'Advanced reporting and data visualization',
      icon: 'A',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      name: 'GSC',
      description: 'Google Search Console integration for SEO insights',
      icon: 'G',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 Type II certified with end-to-end encryption',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Monitoring',
      description: '24/7 uptime monitoring with instant alerts',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Globe,
      title: 'Global CDN',
      description: 'Lightning-fast performance worldwide',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Unlimited team members and role-based access',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <section className="relative py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header Section - Google Style */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Enterprise Integration Platform
          </div>
          
          <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-6 leading-tight">
            Works With Your
            <span className="block text-blue-600 font-medium">
              Existing Tools
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Seamlessly integrate SiteGrip with your existing tech stack. No disruption, 
            no learning curve—just powerful SEO optimization that works with what you already have.
          </p>
        </div>

        {/* Main Content Grid - Google Style Layout */}
        <div className="grid lg:grid-cols-2 gap-20 items-start mb-20">
          {/* Left Side - Integrations */}
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-normal text-gray-900 mb-3">Popular Integrations</h3>
              <p className="text-gray-600 font-light">Connect with the tools your team already uses and loves.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {integrations.map((integration, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Badge */}
                  {integration.badge && (
                    <div className="absolute -top-2 -right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        integration.badge === 'Popular' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {integration.badge}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center mb-4`}>
                    <span className="text-white font-medium text-sm">
                      {integration.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <h4 className="font-medium text-gray-900 mb-2 text-base">
                    {integration.name}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-light">
                    {integration.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Button - Google Style */}
            <div className="mt-8">
              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                Explore All Integrations
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-6">
            <div className="mb-8">
              <h3 className="text-2xl font-normal text-gray-900 mb-3">Enterprise Features</h3>
              <p className="text-gray-600 font-light">Built for scale, security, and performance.</p>
            </div>
            
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 text-base">{feature.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed font-light">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section - Google Style */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-normal text-gray-900 mb-1">99.9%</div>
              <div className="text-gray-600 text-sm font-light">Uptime SLA</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-normal text-gray-900 mb-1">24/7</div>
              <div className="text-gray-600 text-sm font-light">Support</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-normal text-gray-900 mb-1">5000+</div>
              <div className="text-gray-600 text-sm font-light">Integrations</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mx-auto mb-3">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-normal text-gray-900 mb-1">4.9/5</div>
              <div className="text-gray-600 text-sm font-light">Customer Rating</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section - Google Style */}
        <div className="text-center">
          <div className="bg-blue-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-normal mb-4">Ready to Get Started?</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto font-light">
              Join thousands of businesses optimizing their SEO with SiteGrip. 
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
                <Play className="w-4 h-4" />
                Start Free Trial
              </button>
              <button className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors duration-200">
                <Users className="w-4 h-4" />
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
