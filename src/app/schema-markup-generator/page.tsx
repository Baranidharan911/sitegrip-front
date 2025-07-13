'use client';
import React, { useState } from 'react';
import { Code, Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { saveToFirebase } from '@/lib/firebase.js';

export const dynamic = 'force-dynamic';

const schemaTypes = [
  { value: 'Organization', label: 'Organization' },
  { value: 'Article', label: 'Article' },
  { value: 'Product', label: 'Product' },
];

const fieldTemplates: Record<string, { label: string; name: string; type: string; placeholder?: string }[]> = {
  Organization: [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'URL', name: 'url', type: 'url' },
    { label: 'Logo URL', name: 'logo', type: 'url' },
    { label: 'SameAs (comma separated URLs)', name: 'sameAs', type: 'text' },
  ],
  Article: [
    { label: 'Headline', name: 'headline', type: 'text' },
    { label: 'Author', name: 'author', type: 'text' },
    { label: 'Date Published', name: 'datePublished', type: 'date' },
    { label: 'Image URL', name: 'image', type: 'url' },
    { label: 'Publisher', name: 'publisher', type: 'text' },
    { label: 'Main Entity Of Page', name: 'mainEntityOfPage', type: 'url' },
  ],
  Product: [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Image URL', name: 'image', type: 'url' },
    { label: 'Description', name: 'description', type: 'text' },
    { label: 'SKU', name: 'sku', type: 'text' },
    { label: 'Brand', name: 'brand', type: 'text' },
    { label: 'Offers (JSON)', name: 'offers', type: 'text', placeholder: '{ "@type": "Offer", ... }' },
  ],
};

export default function SchemaMarkupGeneratorPage() {
  const [type, setType] = useState('Organization');
  const [fields, setFields] = useState<any>({});
  const [pastedJson, setPastedJson] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [valid, setValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setValid(null);
    try {
      let sendFields = { ...fields };
      if (type === 'Organization' && sendFields.sameAs) {
        sendFields.sameAs = sendFields.sameAs.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (type === 'Product' && sendFields.offers) {
        try {
          sendFields.offers = JSON.parse(sendFields.offers);
        } catch {
          setError('Offers must be valid JSON.');
          setLoading(false);
          return;
        }
      }
      const response = await fetch('/api/schema-markup-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, fields: sendFields })
      });
      const data = await response.json();
      if (!response.ok || !data.valid) {
        setError(data.error || (data.errors && data.errors.join(', ')) || 'Failed to generate schema');
        setValid(false);
      } else {
        setResult(data.schema);
        setValid(true);

        // Save to Firebase if user is logged in
        if (user) {
          try {
            const result = await saveToFirebase('schemaMarkupGeneration', {
              userId: user.uid,
              type: type,
              fields: sendFields,
              schema: data.schema,
              timestamp: new Date().toISOString()
            });
            if (result) {
              console.log('✅ Schema saved to Firebase');
            } else {
              console.warn('⚠️ Schema not saved (Firebase unavailable)');
            }
          } catch (firebaseError) {
            console.error('Failed to save to Firebase:', firebaseError);
            // Don't show error to user - Firebase is optional
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setValid(null);
    try {
      const response = await fetch('/api/schema-markup-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pastedJson })
      });
      const data = await response.json();
      if (!data.valid) {
        setError(data.errors ? data.errors.join(', ') : 'Invalid JSON-LD');
        setValid(false);
      } else {
        setResult(data.schema);
        setValid(true);

        // Save validation to Firebase if user is logged in
        if (user) {
          try {
            const result = await saveToFirebase('schemaMarkupValidation', {
              userId: user.uid,
              pastedJson: pastedJson,
              schema: data.schema,
              valid: true,
              timestamp: new Date().toISOString()
            });
            if (result) {
              console.log('✅ Validation saved to Firebase');
            } else {
              console.warn('⚠️ Validation not saved (Firebase unavailable)');
            }
          } catch (firebaseError) {
            console.error('Failed to save to Firebase:', firebaseError);
            // Don't show error to user - Firebase is optional
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/ld+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema-markup-${type.toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Code className="text-white text-xl" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Schema Markup Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Generate and validate JSON-LD schema markup for SEO. Supports Organization, Article, and Product types.
          </p>
        </div>
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
            <h2 className="text-xl font-semibold mb-4">Generate Schema Markup</h2>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Schema Type</label>
              <select
                value={type}
                onChange={e => { setType(e.target.value); setFields({}); setResult(null); setError(''); setValid(null); }}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 mb-3"
              >
                {schemaTypes.map(st => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {fieldTemplates[type].map(field => (
                <div key={field.name}>
                  <label className="block mb-1 text-sm font-medium">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={fields[field.name] || ''}
                    onChange={handleFieldChange}
                    placeholder={field.placeholder || field.label}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400 mb-3"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Code className="mr-2" />
                  Generate
                </>
              )}
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Validate JSON-LD</h2>
            <textarea
              value={pastedJson}
              onChange={e => setPastedJson(e.target.value)}
              placeholder="Paste your JSON-LD here to validate..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 min-h-[100px] text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
            />
            <button
              onClick={handleValidate}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="mr-2" />
                  Validate
                </>
              )}
            </button>
          </div>
        </div>
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
              <AlertCircle className="mr-2" />
              {error}
            </div>
          </div>
        )}
        {result && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Result</h2>
                <div className="flex gap-2">
                  <button onClick={exportJson} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <Download className="mr-1" /> Export
                  </button>
                  <button onClick={handleCopy} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <Copy className="mr-1" /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <pre className="bg-gray-50 rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap text-gray-800">
                {JSON.stringify(result, null, 2)}
              </pre>
              {valid !== null && (
                <div className={`mt-4 flex items-center ${valid ? 'text-green-700' : 'text-red-700'}`}>
                  {valid ? <CheckCircle className="mr-2" /> : <AlertCircle className="mr-2" />}
                  {valid ? 'Valid JSON-LD' : 'Invalid JSON-LD'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 