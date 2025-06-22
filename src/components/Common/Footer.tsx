'use client';

const Footer = () => (
  <footer className="bg-gray-100 dark:bg-gray-900 py-10 md:py-16">
    <div className="container mx-auto px-6 text-center text-gray-700 dark:text-gray-400">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 md:mb-0">
          WebWatch Pro
        </div>
        <div className="flex space-x-6 md:space-x-10 text-lg">
          {['Privacy Policy', 'Terms of Service', 'Support', 'Careers'].map((item) => (
            <a
              key={item}
              href="#"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
      <p className="text-sm">
        &copy; {new Date().getFullYear()} WebWatch Pro. All rights reserved.
      </p>
      <p className="text-xs mt-2 text-gray-500 dark:text-gray-600">
        Built with passion for a better web.
      </p>
    </div>
  </footer>
);

export default Footer;
