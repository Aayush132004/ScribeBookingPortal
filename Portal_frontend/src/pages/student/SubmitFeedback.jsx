import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

const SubmitFeedback = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stars === 0) return setError("Please select a star rating.");

    setLoading(true);
    setError('');

    try {
      // Matches student.controller.js -> submitFeedback
      await api.post('/student/feedback', {
        examRequestId: requestId,
        stars,
        review
      });
      setSubmitted(true);
      setTimeout(() => navigate('/student/requests'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-white p-10 rounded-2xl shadow-sm border">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Thank You!</h2>
        <p className="text-slate-500 mt-2">Your feedback helps us maintain a high-quality community. Redirecting you to your requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Rate Your Scribe</h2>
        <p className="text-slate-500 mb-8">How was your experience with the scribe for this examination?</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border-l-4 border-red-600" role="alert">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Star Rating Section */}
          <div className="text-center">
            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Overall Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStars(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    size={48}
                    className={`${
                      star <= (hover || stars) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Written Review Section */}
          <div className="space-y-2">
            <label htmlFor="review" className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <MessageSquare size={16} /> Write a Review (Optional)
            </label>
            <textarea
              id="review"
              rows="4"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us more about the scribe's punctuality, behavior, and assistance..."
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || stars === 0}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Submit Feedback</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitFeedback;