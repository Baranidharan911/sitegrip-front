'use client';
import { ArrowRight } from 'lucide-react';

const CallToAction = () => (
  <section className="bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-800 dark:to-indigo-800 py-20 md:py-24 text-center rounded-t-[40px] shadow-2xl">
    <div className="container mx-auto px-6">
      <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
        Ready to Supercharge Your Website?
      </h2>
      <p className="text-lg md:text-xl text-purple-100 dark:text-purple-200 mb-10 max-w-3xl mx-auto">
        Join thousands of satisfied users who are already boosting their online presence with Site Grip.
      </p>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        <button className="bg-white text-purple-700 font-bold py-3.5 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 text-lg">
          Get Started Free Today
        </button>
        <button className="bg-transparent border-2 border-white text-white font-bold py-3.5 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 text-lg">
          <span className="flex items-center justify-center">
            View Demo <ArrowRight className="ml-2 w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  </section>
);

export default CallToAction;
