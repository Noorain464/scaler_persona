import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Loader } from 'lucide-react';
import { getAvailableSlots, bookSlot } from '../../services/bookingService';

const BookingWidget = ({ onBook }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, booking, success, error
  const [errorHeader, setErrorHeader] = useState('');
  
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    // Fetch tomorrow's slots for quick demo
    const fetchSlots = async () => {
      try {
        const d = new Date();
        d.setDate(d.getDate() + 1); // Tomorrow
        const dateStr = d.toISOString().split('T')[0];
        
        const res = await getAvailableSlots(dateStr);
        if (res.success && res.data.availableSlots) {
          // Limit to exactly 3 optimal slots as per recruiter-friendly requirements
          setSlots(res.data.availableSlots.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !formData.name || !formData.email) return;
    
    setBookingStatus('booking');
    try {
      const res = await bookSlot({
        name: formData.name,
        email: formData.email,
        slotStart: selectedSlot.start,
        slotEnd: selectedSlot.end
      });
      if (res.success) {
        setBookingStatus('success');
        if (onBook) onBook(res.eventDetails);
      } else {
        setBookingStatus('error');
        setErrorHeader('Booking failed.');
      }
    } catch (err) {
      setBookingStatus('error');
      setErrorHeader(err.response?.data?.error || 'Server error occurred.');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <div className="flex items-center text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-100"><Loader className="animate-spin mr-2" size={16}/> Finding best slots...</div>;
  }

  if (bookingStatus === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl shadow-sm">
        <h4 className="font-semibold flex items-center mb-1"><Calendar size={16} className="mr-2"/> Interview Scheduled!</h4>
        <p className="text-sm">A calendar invite has been sent to {formData.email}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-indigo-100 shadow-sm rounded-xl overflow-hidden w-full max-w-sm">
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
        <h4 className="font-semibold text-indigo-900 text-sm flex items-center"><Calendar size={16} className="mr-2"/> Select an Interview Time</h4>
        <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-medium">Auto-Booker</span>
      </div>
      
      <div className="p-4">
        {slots.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">No slots available right now. Please ask the agent to check another day.</p>
        ) : (
          <form onSubmit={handleBook}>
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available Slots ({formatDate(slots[0].start)})</p>
              <div className="space-y-2">
                {slots.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center transition-all ${
                      selectedSlot === slot 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' 
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Clock size={14} className="mr-2 opacity-70" />
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </button>
                ))}
              </div>
            </div>

            {selectedSlot && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="Your Work Email"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                
                {bookingStatus === 'error' && (
                  <p className="text-xs text-red-600">{errorHeader}</p>
                )}
                
                <button
                  type="submit"
                  disabled={bookingStatus === 'booking'}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors flex justify-center items-center"
                >
                  {bookingStatus === 'booking' ? <Loader size={16} className="animate-spin" /> : 'Confirm Booking'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingWidget;
