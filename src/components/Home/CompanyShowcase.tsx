import React from 'react';

const CompanyShowcase: React.FC = () => {
  const companies = [
    { name: 'Samsung', logo: 'SAMSUNG' },
    { name: 'Coca-Cola', logo: 'Coca-Cola' },
    { name: 'Sony', logo: 'SONY.' },
    { name: 'Johnson & Johnson', logo: 'Johnson & Johnson' },
    { name: 'Citi', logo: 'citi' },
    { name: 'Spotify', logo: 'Spotify' },
    { name: 'Toyota', logo: 'TOYOTA' }
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Minimalist Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50 dark:from-[#0a0b1e] dark:via-[#0a0b1e] dark:to-purple-900/20">
        {/* Abstract dot pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full"></div>
          <div className="absolute top-32 left-40 w-1 h-1 bg-purple-300 rounded-full"></div>
          <div className="absolute top-16 left-60 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
          <div className="absolute top-40 left-80 w-1 h-1 bg-purple-300 rounded-full"></div>
          <div className="absolute top-24 left-96 w-2 h-2 bg-purple-400 rounded-full"></div>
          
          <div className="absolute top-60 right-20 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
          <div className="absolute top-80 right-40 w-1 h-1 bg-purple-300 rounded-full"></div>
          <div className="absolute top-72 right-60 w-2 h-2 bg-purple-400 rounded-full"></div>
          <div className="absolute top-96 right-80 w-1 h-1 bg-purple-300 rounded-full"></div>
          
          {/* Add more dots in a grid pattern */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-300 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Powering Text Section */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
            POWERING THE WEB'S FASTEST-GROWING SITES
          </h2>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light">
            fixdeol lorolli kninp
          </p>
        </div>

        {/* Company Showcase Banner */}
        <div className="bg-gray-800 dark:bg-gray-900 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              YOU'RE IN
            </h3>
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              GOOD COMPANY
            </h3>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {companies.map((company, index) => (
              <div
                key={company.name}
                className="flex flex-col items-center group transition-transform duration-300 hover:scale-110"
              >
                <div className="text-white text-center">
                  {company.name === 'Samsung' && (
                    <span className="text-xl font-bold tracking-wider">SAMSUNG</span>
                  )}
                  {company.name === 'Coca-Cola' && (
                    <span className="text-2xl font-serif italic">Coca-Cola</span>
                  )}
                  {company.name === 'Sony' && (
                    <span className="text-xl font-bold">SONY.</span>
                  )}
                  {company.name === 'Johnson & Johnson' && (
                    <span className="text-lg font-serif">Johnson & Johnson</span>
                  )}
                  {company.name === 'Citi' && (
                    <span className="text-xl font-bold italic">citi</span>
                  )}
                  {company.name === 'Spotify' && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <span className="text-lg font-bold">Spotify</span>
                    </div>
                  )}
                  {company.name === 'Toyota' && (
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-white rounded-full mb-1 flex items-center justify-center">
                        <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                      </div>
                      <span className="text-lg font-bold">TOYOTA</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyShowcase;
