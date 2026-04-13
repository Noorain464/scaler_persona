import React, { useState } from 'react';
import BookingWidget from '../components/booking/BookingWidget';

const BookPage = () => {
  const [successEvent, setSuccessEvent] = useState(null);

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="px-8 py-5 border-b border-gray-100 bg-white">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Direct Booking Portal</h2>
        <p className="text-sm text-gray-500">Secure a spot on Noorain's Google Calendar.</p>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row items-start justify-center p-8 lg:p-16 gap-12 bg-gray-50">
        
        <div className="max-w-md">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">Let's talk about building <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Great Software.</span></h1>
          <p className="text-lg text-gray-600 mb-6">Select a convenient time from my live availability. This is fully synced with my Google Calendar to prevent double bookings.</p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700 mr-4">🤖</div>
              <div>
                <h4 className="font-semibold text-gray-800">Also available by voice</h4>
                <p className="text-sm text-gray-500">Prefer speaking? Call and book entirely through conversation.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm flex shrink-0 justify-center">
          {successEvent ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booked!</h3>
              <p className="text-gray-600 mb-6">Your calendar invite has been dispatched.</p>
              <button 
                onClick={() => setSuccessEvent(null)}
                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
              >
                Book another meeting
              </button>
            </div>
          ) : (
            <div className="transform hover:-translate-y-1 transition-transform duration-300">
               <BookingWidget onBook={(event) => setSuccessEvent(event)} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookPage;
