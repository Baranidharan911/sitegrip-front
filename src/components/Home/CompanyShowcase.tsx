import React from 'react';

const CompanyShowcase: React.FC = () => {
  // Massive list of world-class companies (inspired by Qualtrics)
  const companies = [
    // Row 1 - Tech & Automotive Giants
    { name: 'SAMSUNG', category: 'tech' },
    { name: 'PEUGEOT', category: 'automotive' },
    { name: 'Royal Caribbean', category: 'travel' },
    { name: 'CITIGROUP', category: 'finance' },
    { name: 'GOODYEAR', category: 'automotive' },
    { name: 'Zillow', category: 'real-estate' },
    { name: 'Australian Unity', category: 'healthcare' },
    { name: 'Deutsche Bank', category: 'finance' },
    { name: 'David Lloyd Clubs', category: 'fitness' },
    
    // Row 2 - Lifestyle & Entertainment
    { name: 'Weight Watchers', category: 'health' },
    { name: 'SEPHORA', category: 'beauty' },
    { name: 'SB NATION', category: 'sports' },
    { name: 'FANDANGO', category: 'entertainment' },
    { name: 'NBA', category: 'sports' },
    { name: 'Pella', category: 'manufacturing' },
    { name: 'Accenture', category: 'consulting' },
    { name: 'AUTODESK', category: 'tech' },
    { name: 'Chobani', category: 'food' },
    
    // Row 3 - Global Corporations
    { name: 'DELL', category: 'tech' },
    { name: 'AVIS', category: 'travel' },
    { name: 'AT&T', category: 'telecom' },
    { name: 'Uber', category: 'tech' },
    { name: 'MetLife', category: 'insurance' },
    { name: 'Fidelity', category: 'finance' },
    { name: 'DUCATI', category: 'automotive' },
    { name: 'P&G', category: 'consumer' },
    { name: 'Tetra Pak', category: 'packaging' },
    
    // Row 4 - Industry Leaders
    { name: 'IBM', category: 'tech' },
    { name: 'E*TRADE', category: 'finance' },
    { name: 'Spotify', category: 'entertainment' },
    { name: 'Under Armour', category: 'sports' },
    { name: 'SONY', category: 'tech' },
    { name: 'STANCE', category: 'apparel' },
    { name: 'jetBlue', category: 'travel' },
    { name: 'Expedia', category: 'travel' },
    { name: 'Verizon', category: 'telecom' },
    
    // Row 5 - Additional Premium Brands
    { name: 'Microsoft', category: 'tech' },
    { name: 'Nike', category: 'sports' },
    { name: 'Coca-Cola', category: 'beverages' },
    { name: 'McDonald\'s', category: 'food' },
    { name: 'Disney', category: 'entertainment' },
    { name: 'Tesla', category: 'automotive' },
    { name: 'Netflix', category: 'entertainment' },
    { name: 'Amazon', category: 'tech' },
    { name: 'Apple', category: 'tech' },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      tech: 'text-blue-600',
      automotive: 'text-gray-700',
      travel: 'text-green-600',
      finance: 'text-blue-700',
      real_estate: 'text-purple-600',
      healthcare: 'text-red-600',
      fitness: 'text-orange-600',
      health: 'text-pink-600',
      beauty: 'text-purple-500',
      sports: 'text-green-700',
      entertainment: 'text-indigo-600',
      manufacturing: 'text-gray-600',
      consulting: 'text-blue-800',
      food: 'text-orange-500',
      insurance: 'text-blue-900',
      consumer: 'text-purple-700',
      packaging: 'text-gray-500',
      apparel: 'text-red-500',
      telecom: 'text-blue-800',
      beverages: 'text-red-700'
    };
    return colors[category as keyof typeof colors] || 'text-gray-700';
  };

  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#0a0b1e] dark:via-[#0a0b1e] dark:to-gray-900 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3B82F6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8B5CF6 0%, transparent 50%)`,
          backgroundSize: '400px 400px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Hero Heading */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight max-w-5xl mx-auto">
            The world's best brands turn to{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              SiteGrip
            </span>{' '}
            to deliver breakthrough digital experiences
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of leading companies who trust SiteGrip to power their search optimization, 
            website monitoring, and digital performance needs.
          </p>
        </div>

        {/* Massive Company Logo Grid */}
        <div className="relative">
          {/* Grid Container */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-8 md:gap-12 items-center justify-items-center">
            {companies.map((company, index) => (
              <div
                key={company.name}
                className="group relative flex flex-col items-center justify-center w-full max-w-32 transition-all duration-500 hover:scale-110"
              >
                {/* Company Logo Container */}
                <div className="w-full aspect-square flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-700">
                  <div className={`text-center ${getCategoryColor(company.category)}`}>
                    <div className="text-lg md:text-xl font-bold tracking-wide leading-tight">
                      {company.name}
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect - Company Info */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
                    {company.name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute top-1/2 -right-20 w-16 h-16 bg-green-500 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 md:p-12 shadow-2xl border border-blue-100 dark:border-blue-900">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to join the elite?
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Start your journey with the same platform trusted by industry leaders worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start Free Trial
              </button>
              <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyShowcase;
