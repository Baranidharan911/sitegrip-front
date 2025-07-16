'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  Info, 
  CheckCircle, 
  TrendingUp, 
  Award, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface HowToUseSectionProps {
  title: string;
  description: string;
  steps: {
    title: string;
    description: string;
    icon?: React.ComponentType<any>;
    color?: string;
  }[];
  tips?: {
    title: string;
    content: string;
    icon?: React.ComponentType<any>;
  }[];
  examples?: {
    type: string;
    example: string;
    description: string;
  }[];
  proTip?: string;
}

export default function HowToUseSection({
  title,
  description,
  steps,
  tips = [],
  examples = [],
  proTip
}: HowToUseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          {title}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300">{description}</p>

          {/* Steps */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">How to use this tool:</h4>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    step.color || 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {step.icon ? (
                      <step.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{step.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          {examples.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Examples:</h4>
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-gray-900 dark:text-white">{example.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{example.example}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{example.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What you'll get:</h4>
              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {tip.icon ? (
                        <tip.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{tip.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{tip.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro Tip */}
          {proTip && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Pro Tip</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{proTip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 