import React from 'react';
import { Home, Twitter, Github, Linkedin } from 'lucide-react';

const NewFooter: React.FC = () => {
  return (
    <footer className="relative z-10 px-6 py-20 border-t border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-gray-900/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg shadow-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Site Grip</span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mb-8">
              The ultimate all-in-one platform for rapid indexing, in-depth SEO audits, and reliable website uptime monitoring.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/10">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/10">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/10">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6">Product</h3>
            <ul className="space-y-4">
              <li><a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:underline">Features</a></li>
              <li><a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:underline">Pricing</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:underline">API</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:underline">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6">Support</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:underline">Documentation</a></li>
              <li><a href="#faq" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:underline">FAQ</a></li>
              <li><a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:underline">Contact</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:underline">Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-gray-200/50 dark:border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            © 2025 Site Grip. All rights reserved.
          </p>
          <div className="flex items-center space-x-8 mt-6 md:mt-0">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter; 
