'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SitemapNode {
  url: string;
  children?: SitemapNode[]; // Make children optional
}

interface VisualSitemapProps {
  tree: SitemapNode;
}

interface TreeNodeProps {
  node: SitemapNode;
  level: number;
  isExpandedProp?: boolean; // Optional prop to control initial expansion for root
}

const getLabel = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Use the hostname for the root label, otherwise the last part of the pathname
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (parsed.pathname === '/' && parsed.hostname) {
        return parsed.hostname.replace('www.', ''); // Use hostname for root
    }
    return pathParts.length > 0 ? decodeURIComponent(pathParts[pathParts.length - 1].replace(/-/g, ' ')) : 'Home'; // Fallback for deep paths
  } catch {
    return url;
  }
};

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, isExpandedProp }) => {
  const hasChildren = node.children && node.children.length > 0;
  // Initialize isExpanded based on isExpandedProp, defaulting to false if not provided
  const [isExpanded, setIsExpanded] = useState(isExpandedProp !== undefined ? isExpandedProp : false);

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded((prev) => !prev);
    }
  };

  const nodeVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const colors = [
    'from-indigo-500 to-purple-600',
    'from-blue-400 to-indigo-500',
    'from-green-400 to-teal-500',
    'from-yellow-400 to-orange-500',
    'from-red-400 to-pink-500',
    'from-purple-400 to-fuchsia-500',
  ];

  const darkColors = [
    'from-indigo-800 to-purple-900',
    'from-blue-700 to-indigo-800',
    'from-green-700 to-teal-800',
    'from-yellow-700 to-orange-800',
    'from-red-700 to-pink-800',
    'from-purple-700 to-fuchsia-800',
  ];

  const borderColor = [
    'border-indigo-400 dark:border-indigo-700', // Level 1+
    'border-blue-300 dark:border-blue-600',    // Level 2+
    'border-green-300 dark:border-green-600',  // Level 3+
    'border-yellow-300 dark:border-yellow-600',
    'border-red-300 dark:border-red-600',
    'border-purple-300 dark:border-purple-600',
  ];

  // Adjust styling based on level for visual hierarchy
  const gradientClass = `bg-gradient-to-r ${colors[(level - 1) % colors.length]} dark:${darkColors[(level - 1) % darkColors.length]}`;
  const buttonCommonClasses = "px-6 py-2 rounded-full text-sm font-bold shadow-md hover:scale-[1.03] transition-all";
  const linkCommonClasses = "px-6 py-2 rounded-full text-sm shadow hover:shadow-lg transition";

  let buttonClasses = "";
  let linkClasses = "";
  let childrenContainerClasses = "";
  let textClass = "text-gray-900 dark:text-white"; // Default text color for inner nodes

  // Styling for child nodes (level 1 and deeper)
  if (hasChildren) {
    // For expandable nodes, use gradient if level is 1, otherwise default indigo
    buttonClasses = `${buttonCommonClasses} ${level === 1 ? gradientClass + ' text-white' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-white'}`;
    if (level === 1) textClass = "text-white"; // Text white for level 1 gradient buttons
  } else {
    // For leaf nodes
    linkClasses = `${linkCommonClasses} border border-indigo-300 dark:border-indigo-600 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800`;
  }

  // Children container classes for vertical stacking
  childrenContainerClasses = `ml-6 mt-2 pl-4 border-l-[2px] border-dashed ${borderColor[(level - 1) % borderColor.length]} space-y-4`;


  return (
    <motion.div
      variants={nodeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`relative rounded-3xl transition-all duration-300`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)', // Apply glass effect for all TreeNode instances
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className={`flex items-center gap-2 mb-2`}>
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 ${buttonClasses}`}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className={textClass}>{getLabel(node.url)}</span>
          </button>
        ) : (
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 ${linkClasses}`}
          >
            <LinkIcon className="w-4 h-4 opacity-70" />
            <span>{getLabel(node.url)}</span>
          </a>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`overflow-hidden ${childrenContainerClasses}`}
          >
            {node.children!.map((child, idx) => (
              <TreeNode key={idx} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const VisualSitemap: React.FC<VisualSitemapProps> = ({ tree }) => {
  const rootLabel = getLabel(tree.url);
  // Set rootExpanded to false initially so only the root node is visible
  const [rootExpanded, setRootExpanded] = useState(false);

  const colors = [ // Re-define colors here for root node styling
    'from-indigo-500 to-purple-600',
    'from-blue-400 to-indigo-500',
    'from-green-400 to-teal-500',
    'from-yellow-400 to-orange-500',
    'from-red-400 to-pink-500',
    'from-purple-400 to-fuchsia-500',
  ];
  const darkColors = [
    'from-indigo-800 to-purple-900',
    'from-blue-700 to-indigo-800',
    'from-green-700 to-teal-800',
    'from-yellow-700 to-orange-800',
    'from-red-700 to-pink-800',
    'from-purple-700 to-fuchsia-800',
  ];

  return (
    <div className="relative mt-6 p-6 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Website Mind Map Structure</h2>

      <div className="flex flex-col items-center justify-center gap-8 py-4">
        {/* Central Root Node */}
        <button
          onClick={() => setRootExpanded(!rootExpanded)}
          className={`flex items-center gap-2 px-8 py-3 rounded-full text-lg font-bold shadow-xl hover:scale-[1.05] transition-all
          bg-gradient-to-r ${colors[0]} dark:${darkColors[0]} text-white
          `}
        >
          {rootExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          <span>{rootLabel}</span>
        </button>

        <AnimatePresence>
          {rootExpanded && tree.children && tree.children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden flex flex-wrap justify-center gap-8 py-4"
            >
              {tree.children.map((child, idx) => (
                // Render immediate children with level 1, and they will be collapsed by default
                // because isExpandedProp is not passed (or explicitly set to false).
                <TreeNode key={idx} node={child} level={1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisualSitemap;
