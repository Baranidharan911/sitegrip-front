'use client';

const CompanyLogos = () => (
  <section className="bg-gray-100 dark:bg-gray-950 py-16 md:py-24">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-2xl md:text-4xl font-bold mb-12 text-gray-800 dark:text-gray-200">
        Trusted by startups and enterprises worldwide
      </h2>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-75">
        {['Stripe', 'Figma', 'Shopify', 'Netflix', 'Notion', 'Coinbase'].map((company) => (
          <div
            key={company}
            className="relative group grayscale hover:grayscale-0 transition-all duration-500 transform hover:scale-105"
          >
            <img
              src={`https://placehold.co/150x70/222831/9DB2BF?text=${company}`}
              alt={company}
              className="h-10 md:h-12"
            />
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CompanyLogos;
