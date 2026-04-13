import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Target, Phone, Calendar } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-5xl mx-auto px-8 py-16 lg:py-24">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Vapi + RAG Architecture Live</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Meet Noorain's AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Representative.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Ask me about my resume, open-source work, projects, and availability for a conversation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/chat" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center px-8 py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all">
              <Bot className="mr-2" size={20} /> Let's Chat
            </Link>
            <Link to="/book" className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-semibold flex items-center justify-center px-8 py-4 rounded-xl shadow-sm transition-all">
              <Calendar className="mr-2 text-indigo-600" size={20} /> Direct Booking
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {/* Card 1 */}
          <div className="bg-gray-50 border border-gray-100 p-8 rounded-3xl hover:shadow-md transition-shadow">
            <div className="bg-white w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mb-6">
              <Target className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Grounded in RAG</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Answers are not hallucinated. The AI pulls directly from structured resume data and GitHub portfolio summaries.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-50 border border-gray-100 p-8 rounded-3xl hover:shadow-md transition-shadow">
            <div className="bg-white w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mb-6">
              <Calendar className="text-emerald-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Scheduling</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Connected via Google APIs to parse busy times and intelligently project exactly 3 optimal interview slots.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-50 border border-gray-100 p-8 rounded-3xl hover:shadow-md transition-shadow">
            <div className="bg-white w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mb-6">
              <Phone className="text-purple-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">VAPI Voice Integrated</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              An inbound phone number routes directly to the agent, granting it full access to tools over phone calls.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
