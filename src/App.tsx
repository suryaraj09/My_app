/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Search, MapPin, Briefcase, Loader2, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [skills, setSkills] = useState('');
  const [locations, setLocations] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
  };

  const handleSearch = async () => {
    if (!skills.trim()) {
      setError("Please enter your skills.");
      return;
    }
    
    const activeLocations = locations.filter(l => l.trim());
    if (activeLocations.length === 0) {
      setError("Please enter at least one preferred location.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const locationString = activeLocations.join(", ");
      const prompt = `
        Find active job openings and internships for a candidate with these skills: ${skills}.
        Preferred locations: ${locationString}.
        
        Please use Google Search to find REAL, CURRENT listings.
        
        Format the output as a clean Markdown list. For each job, provide:
        
        ### [Job Title] at [Company Name]
        - **Location:** [Location]
        - **CTC/Salary:** [Salary/Stipend if available, else "Not disclosed"]
        - **Contact/Apply:** [Link or Email]
        - **Brief:** [One sentence summary]
        
        Find at least 5 relevant opportunities.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setResult(response.text || "No results found. Please try again.");
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      setError(err.message || "An error occurred while fetching jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-black selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white shadow-sm border border-black/5">
            <Briefcase className="w-6 h-6 mr-2 text-emerald-600" />
            <span className="font-mono text-sm font-medium text-gray-600 tracking-tight">JOB HUNTER AI</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-gray-900 mb-4">
            Find your next <span className="text-emerald-600">dream role</span>.
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Enter your skills and preferred locations. We'll scour the web to find the best active opportunities for you.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-black/5 p-8 mb-8"
        >
          <div className="grid gap-8 md:grid-cols-2">
            
            {/* Skills Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-emerald-500" />
                Your Skills
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, TypeScript, UI Design, Python..."
                className="w-full h-40 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none text-gray-800 placeholder:text-gray-400"
              />
            </div>

            {/* Locations Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                Top 3 Locations
              </label>
              <div className="space-y-3">
                {locations.map((loc, index) => (
                  <input
                    key={index}
                    type="text"
                    value={loc}
                    onChange={(e) => handleLocationChange(index, e.target.value)}
                    placeholder={`Location ${index + 1} (e.g. Remote, NYC)`}
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-medium text-white transition-all duration-200 bg-gray-900 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching the web...
                </>
              ) : (
                <>
                  Find Opportunities
                  <Search className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-sm border border-black/5 p-8 md:p-10"
            >
              <div className="flex items-center mb-8 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                  <Send className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Search Results</h2>
              </div>
              
              <div className="prose prose-emerald max-w-none prose-headings:font-semibold prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-li:marker:text-emerald-500">
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-medium hover:underline decoration-emerald-500/30 underline-offset-4 transition-colors" />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center" />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul {...props} className="space-y-2 my-4" />
                    ),
                    li: ({ node, ...props }) => (
                      <li {...props} className="text-gray-600" />
                    )
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

