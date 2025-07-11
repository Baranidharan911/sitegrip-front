import { useState } from 'react';
import { Star, MessageCircle, Search, Smile, Frown, Meh, X } from 'lucide-react';

const mockReviews = [
  { id: 1, author: 'Jane Doe', date: '2024-06-01', rating: 5, text: 'Amazing service! Highly recommend.', sentiment: 'positive' },
  { id: 2, author: 'John Smith', date: '2024-05-28', rating: 4, text: 'Very good, but could be faster.', sentiment: 'neutral' },
  { id: 3, author: 'Alice Lee', date: '2024-05-20', rating: 2, text: 'Had some issues with support.', sentiment: 'negative' },
  { id: 4, author: 'Bob Brown', date: '2024-05-15', rating: 5, text: 'Quick and professional!', sentiment: 'positive' },
];

const sentimentIcon = {
  positive: <Smile className="w-5 h-5 text-green-500" />,
  neutral: <Meh className="w-5 h-5 text-yellow-500" />,
  negative: <Frown className="w-5 h-5 text-red-500" />,
};

export default function ReviewManagementPage() {
  const [search, setSearch] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [reply, setReply] = useState('');

  const filtered = mockReviews.filter(r =>
    r.author.toLowerCase().includes(search.toLowerCase()) ||
    r.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-3xl mx-auto mt-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <MessageCircle className="w-8 h-8 text-purple-500" /> Review Management
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">View, search, and reply to your latest reviews. Manage your reputation with ease.</p>
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
            placeholder="Search reviews..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-6">
          {filtered.map(r => (
            <div key={r.id} className="bg-white/90 dark:bg-gray-900/80 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2 mb-2 md:mb-0">
                {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400" />)}
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">{r.author}</span>
                <span className="text-xs text-gray-400 ml-2">{r.date}</span>
                <span className="ml-3 flex items-center gap-1 text-xs font-medium">
                  {sentimentIcon[r.sentiment]} {r.sentiment.charAt(0).toUpperCase() + r.sentiment.slice(1)}
                </span>
              </div>
              <div className="flex-1 text-gray-700 dark:text-gray-200 mb-2 md:mb-0">{r.text}</div>
              <button
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow hover:from-purple-600 hover:to-purple-700 transition"
                onClick={() => { setReplyTo(r.id); setReply(''); }}
              >
                Reply
              </button>
            </div>
          ))}
        </div>
        {/* Reply Modal */}
        {replyTo && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setReplyTo(null)}><X /></button>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Reply to Review</h2>
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
                placeholder="Write your reply..."
                value={reply}
                onChange={e => setReply(e.target.value)}
              />
              <button
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow hover:from-purple-600 hover:to-purple-700 transition"
                onClick={() => { setReplyTo(null); setReply(''); }}
              >
                Send Reply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 