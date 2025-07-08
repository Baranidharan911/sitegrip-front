import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

const schemaTemplates: Record<string, (fields: any) => any> = {
  Organization: (fields: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: fields.name || '',
    url: fields.url || '',
    logo: fields.logo || '',
    sameAs: fields.sameAs || [],
  }),
  Article: (fields: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: fields.headline || '',
    author: fields.author || '',
    datePublished: fields.datePublished || '',
    image: fields.image || '',
    publisher: fields.publisher || '',
    mainEntityOfPage: fields.mainEntityOfPage || '',
  }),
  Product: (fields: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: fields.name || '',
    image: fields.image || '',
    description: fields.description || '',
    sku: fields.sku || '',
    brand: fields.brand || '',
    offers: fields.offers || {},
  }),
};

function validateJsonLd(json: any): string[] {
  const errors: string[] = [];
  if (!json['@context'] || !json['@type']) {
    errors.push('Missing @context or @type.');
  }
  // Add more validation as needed
  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const { type, fields, pastedJson } = await request.json();
    if (pastedJson) {
      try {
        const json = typeof pastedJson === 'string' ? JSON.parse(pastedJson) : pastedJson;
        const errors = validateJsonLd(json);
        if (errors.length > 0) {
          return NextResponse.json({ valid: false, errors });
        }
        return NextResponse.json({ valid: true, schema: json });
      } catch (e) {
        return NextResponse.json({ valid: false, errors: ['Invalid JSON format.'] });
      }
    }
    if (!type || !schemaTemplates[type]) {
      return NextResponse.json({ error: 'Invalid or unsupported schema type.' }, { status: 400 });
    }
    const schema = schemaTemplates[type](fields || {});
    return NextResponse.json({ valid: true, schema });
  } catch (err: any) {
    console.error('Schema Markup Generator API error:', err);
    return NextResponse.json({ error: 'Failed to generate schema markup.' }, { status: 500 });
  }
} 