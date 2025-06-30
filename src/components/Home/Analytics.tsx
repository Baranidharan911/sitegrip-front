import React from 'react';

const Analytics: React.FC = () => {
  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            From <span className="text-red-500">Invisible</span> to <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Unmissable</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See the tangible impact of getting indexed quickly.
          </p>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="bg-white/90 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-gray-100/80 dark:bg-gray-800/50 px-8 py-6 border-b border-gray-200/50 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold">
                    BEFORE SITE GRIP
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">7 DAYS USING MEDIAN</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>
            
            <div className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Load Time vs Bounce Rate Chart */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg">LOAD TIME VS BOUNCE RATE</h3>
                    <button className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-gray-300">OPTIONS</button>
                  </div>
                  
                  <div className="relative h-56 bg-gray-100/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-6">
                    {/* Simulated chart bars */}
                    <div className="flex items-end justify-between h-full space-x-1">
                      {[65, 45, 30, 25, 20, 15, 10, 8, 5, 3, 2, 1].map((height, i) => (
                        <div
                          key={i}
                          className="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${height}%`, width: '6%' }}
                        />
                      ))}
                    </div>
                    <div className="absolute top-6 right-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200/50 dark:border-white/10">
                      <span className="text-gray-800 dark:text-gray-200 font-bold text-xl">57.1%</span>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Bounce Rate</div>
                    </div>
                  </div>
                  
                  <div className="text-blue-400 font-medium">
                    • Median Page Load (LUX): 2.058s
                  </div>
                </div>

                {/* Start Render vs Bounce Rate Chart */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg">START RENDER VS BOUNCE RATE</h3>
                    <button className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-gray-300">OPTIONS</button>
                  </div>
                  
                  <div className="relative h-56 bg-gray-100/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-6">
                    {/* Simulated chart bars */}
                    <div className="flex items-end justify-between h-full space-x-1">
                      {[70, 55, 40, 35, 30, 25, 20, 15, 12, 8, 5, 3].map((height, i) => (
                        <div
                          key={i}
                          className="bg-cyan-500 rounded-t transition-all duration-300 hover:bg-cyan-600"
                          style={{ height: `${height}%`, width: '6%' }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-cyan-400 font-medium">
                    • Start Render (LUX) — Bounce Rate
                  </div>
                </div>
              </div>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 mt-12 pt-12 border-t border-gray-200/50 dark:border-white/10">
                <div className="text-center">
                  <div className="text-blue-400 text-3xl font-bold mb-2">0.7s</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Page Load (LUX)</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 text-3xl font-bold mb-2">2.7Mpvs</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Page Views (LUX)</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-400 text-3xl font-bold mb-2">40.6%</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Bounce Rate (LUX)</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 text-3xl font-bold mb-2">479K</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Sessions (LUX)</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 text-3xl font-bold mb-2">17min</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Session Length (LUX)</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 text-3xl font-bold mb-2">2pvs</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">PVs Per Session (LUX)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analytics; 
