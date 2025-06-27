import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does the Google Indexing feature work?',
      answer: 'We connect directly to Google\'s official Indexing API to submit your URLs for faster discovery. When you publish new content or update existing pages, we notify Google immediately, which can reduce indexing time from weeks to hours or even minutes.',
    },
    {
      question: 'Is this safe to use? Will I get penalized by Google?',
      answer: 'Absolutely safe! We use Google\'s official Indexing API, which is the same method Google recommends for notifying them about new or updated content. This is completely white-hat and follows all of Google\'s guidelines.',
    },
    {
      question: 'What if I go over my plan\'s limits?',
      answer: 'If you exceed your plan limits, we\'ll notify you via email. You can either upgrade to a higher plan or wait until the next billing cycle when your limits reset. We never charge overage fees without your explicit consent.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Questions</span>
          </h2>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 shadow-lg hover:shadow-xl"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none group"
              >
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white pr-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">{faq.question}</h3>
                <ChevronRight 
                  className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 group-hover:text-purple-600 dark:group-hover:text-purple-400 ${
                    openIndex === index ? 'rotate-90' : ''
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ; 