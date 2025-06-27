import React from 'react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "Site Grip's indexing feature is a game-changer. We got our client's new landing page indexed and ranking within 24 hours. Unbelievable!",
      author: 'Jane Smith',
      role: 'Head of SEO, Growthify',
      avatar: 'JS',
      avatarColor: 'bg-purple-500',
    },
    {
      quote: "The uptime monitoring saved us during a server migration. We were alerted instantly about a misconfiguration and fixed it before any customers noticed.",
      author: 'Mark Stevens',
      role: 'Lead Developer, Tech Solutions',
      avatar: 'MS',
      avatarColor: 'bg-blue-500',
    },
  ];

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Trusted by <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Developers & Marketers</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust Site Grip.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/90 dark:bg-gray-900/30 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-8 lg:p-10 hover:bg-white/95 dark:hover:bg-gray-900/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg dark:shadow-2xl"
            >
              <blockquote className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center space-x-6">
                <div className={`w-16 h-16 rounded-full ${testimonial.avatarColor} flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-xl">{testimonial.avatar}</span>
                </div>
                <div>
                  <div className="text-gray-900 dark:text-white font-semibold text-xl mb-1">{testimonial.author}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-lg">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 