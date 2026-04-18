import React, { useState } from 'react';
import api from '../utils/auth.js'; 
import { toast } from 'react-toastify'; 
import { useAuth } from '../context/AuthContext';

const BroadcastPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', text: '' });
  const [isSending, setIsSending] = useState(false);

  const { title, text } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title || !text) return toast.error('Please fill in both fields.');
    
    setIsSending(true);
    try {
      await api.post('/broadcast', formData);
      toast.success('Broadcast dispatched successfully!');
      setFormData({ title: '', text: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to send broadcast.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-12 items-start">
      {/* Left Column: Contextual Messaging */}
      <div className="md:col-span-5 flex flex-col gap-8 mb-10 md:mb-0">
        <div className="flex flex-col gap-3">
          <span className="font-label uppercase tracking-widest text-[10px] text-on-tertiary-fixed-variant bg-tertiary-fixed-dim/30 px-3 py-1 self-start rounded-sm">
            Communication Suite
          </span>
          <h1 className="font-headline text-4xl md:text-5xl text-primary tracking-tight">
            Broadcast
          </h1>
          <p className="font-headline italic text-base text-on-surface-variant leading-relaxed opacity-80">
            Send a real-time announcement to all active users as <span className="font-bold not-italic">{user?.name}</span>.
          </p>
        </div>

        <div className="hidden md:block">
          <div className="bg-surface-container-low p-6 rounded-lg flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <div>
                <p className="font-label text-[10px] uppercase tracking-wider text-on-surface font-bold mb-1">Curation Policy</p>
                <p className="text-xs text-on-surface-variant leading-snug">Ensure all broadcast communications align with the event's aesthetic standards and identity.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full aspect-[4/5] hidden md:block overflow-hidden rounded-lg group">
          <img 
            alt="Ethereal architectural detail" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQu3GuDKKGZLeXbm2S_4j1XduK1vPPJKwhhaZU-gMnbgoYu0uuFMfGgcgeiwy4ArVfEG_YHALqOm7MBcl9b6u4-aqodrudK_mpgwTqULPsl8yol3RwVV_cWWsqMmXBtEXQz44Q69FB2QVdUWKCVO6n6n2QEe0nTW7Tuv55qqpGxJzT8AqJc-ZMQVFSP9IsWTC8hdMXH7CRlg8ux2shRYjR1aOJ1QRkCR4moTOxHZfZ4MBiA5cYCosvHt8zsvcZdhHTEFcGbZjgRw"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
        </div>
      </div>

      {/* Right Column: The Form */}
      <div className="md:col-span-7 w-full">
        <div className="bg-surface-container-lowest p-8 md:p-10 rounded-xl shadow-[0_32px_64px_-12px_rgba(26,28,28,0.06)] relative">
          <form onSubmit={onSubmit} className="flex flex-col gap-10">
            <div className="group flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold" htmlFor="title">
                Announcement Title
              </label>
              <input 
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/30 py-3 px-0 font-headline text-xl text-primary placeholder:text-outline-variant/40 transition-all focus:border-primary focus:ring-0" 
                id="title" name="title" placeholder="A Prelude to the Evening" type="text" required
                value={title} onChange={onChange}
              />
            </div>

            <div className="group flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold" htmlFor="text">
                Detailed Message
              </label>
              <textarea 
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/30 py-3 px-0 font-body text-sm text-on-surface placeholder:text-outline-variant/40 resize-none transition-all focus:border-primary focus:ring-0" 
                id="text" name="text" rows="5" required
                placeholder="Distinguished guests, we invite you to join us for an exclusive preview..."
                value={text} onChange={onChange}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-2">
              <div className="flex-1 bg-surface-container-low p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">groups</span>
                  <span className="font-label text-[10px] uppercase tracking-wider font-semibold">Active Users</span>
                </div>
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                disabled={isSending}
                className="silk-gradient text-white font-label text-[10px] uppercase tracking-[0.2em] font-bold py-5 px-10 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50" 
                type="submit"
              >
                {isSending ? 'Dispatching...' : 'Send Broadcast Now'}
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
              <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60">
                Immediate delivery to all curated terminals
              </p>
            </div>
          </form>

          <div className="absolute top-0 right-0 p-4">
            <span className="material-symbols-outlined text-outline-variant/20 text-3xl">flare</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastPage;