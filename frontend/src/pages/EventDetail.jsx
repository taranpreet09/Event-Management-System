import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEventById } from "../api/events";
import { motion, AnimatePresence } from "framer-motion";

const EventDetail = () => {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await getEventById(id);
        setEvent(response.data);
      } catch (err) {
        setError("Could not fetch event details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Gallery Slideshow logic
  useEffect(() => {
    if (event?.gallery?.length > 1) {
      const timer = setInterval(() => {
        setActiveFrame((prev) => (prev + 1) % event.gallery.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [event]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary opacity-30">hourglass_top</span>
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">Curating Experience...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
         <div className="text-center p-12 bg-white rounded-xl shadow-xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-4xl text-error mb-4">error</span>
            <p className="font-headline text-2xl italic mb-4">{error || "Experience Not Found"}</p>
            <Link to="/events" className="text-primary font-label text-xs uppercase tracking-widest border-b border-primary">Return to Collection</Link>
         </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const deadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
  const now = new Date();
  
  const formatCountdown = (targetDate) => {
    if (!targetDate) return "00:00:00:00";
    const ms = Math.max(0, targetDate.getTime() - now.getTime());
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const s = Math.floor((ms / 1000) % 60);
    return `${String(d).padStart(2, '0')}:${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const mapLocationUrl = `https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`;

  return (
    <div className="bg-surface selection:bg-tertiary-fixed selection:text-on-tertiary-fixed min-h-screen flex flex-col">
      {/* Immersive Hero Section */}
      <section className="relative h-[65vh] w-full overflow-hidden flex items-end px-8 md:px-12 pb-12">
        <div className="absolute inset-0 z-0">
          <img
            alt={event.title}
            className="w-full h-full object-cover grayscale brightness-[0.6]"
            src={event.coverImageUrl}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80";
              e.target.onerror = null;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed-variant px-2.5 py-0.5 text-[9px] font-label font-bold tracking-[0.2em] uppercase rounded-md">
                {event.category || 'Special'}
              </span>
              <span className="text-white/60 font-label text-[10px] uppercase tracking-widest">{event.type === 'online' ? 'Digital Discovery' : 'Curated Program'}</span>
            </div>
            <h1 className="text-white text-4xl md:text-6xl font-headline italic leading-[1.1] mb-6 tracking-tighter">
              {event.title}
            </h1>
            <p className="text-white/80 font-body text-base max-w-xl leading-relaxed font-light">
              {event.shortDescription}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-xl border border-white/10 min-w-[280px] shadow-2xl">
            <div className="mb-4">
              <span className="text-white/40 font-label text-[9px] uppercase tracking-widest block mb-1">Organized by</span>
              <span className="text-white font-headline text-xl italic">{event.organizer?.name}</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-white">
                <span className="font-label text-[9px] uppercase tracking-widest opacity-60">Starts in</span>
                <span className="font-headline italic text-base tracking-wider">{formatCountdown(eventDate)}</span>
              </div>
              <div className="w-full h-[1px] bg-white/10"></div>
              <div className="flex justify-between items-center text-white">
                <span className="font-label text-[9px] uppercase tracking-widest opacity-60">Reg Closes</span>
                <span className="font-headline italic text-base tracking-wider font-light text-white/50">{formatCountdown(deadline)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-screen-2xl mx-auto px-8 md:px-12 mt-20 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Essential Details */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            <div>
              <h3 className="font-headline text-2xl italic mb-8 border-b border-outline-variant/20 pb-4 text-primary tracking-tight">Experience Overview</h3>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'wght' 200" }}>calendar_today</span>
                  <div>
                    <span className="block font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant mb-1 font-bold">Chronicle</span>
                    <span className="block font-body text-base font-medium text-primary">
                      {eventDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      <br />
                      <span className="opacity-50 text-sm">{eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'wght' 200" }}>location_on</span>
                  <div>
                    <span className="block font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant mb-1 font-bold">Venue</span>
                    <span className="block font-body text-base font-medium text-primary">{event.location}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'wght' 200" }}>group</span>
                  <div>
                    <span className="block font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant mb-1 font-bold">Capacity</span>
                    <span className="block font-body text-base font-medium text-primary">{event.capacity} Exclusive Positions</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
              <h4 className="font-label text-[9px] uppercase tracking-[0.2em] text-primary font-bold mb-6">Metadata</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-body">
                  <span className="opacity-40 uppercase tracking-widest">Entry Created</span>
                  <span className="font-bold text-on-surface-variant">{new Date(event.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-body">
                  <span className="opacity-40 uppercase tracking-widest">Last Orchestrated</span>
                  <span className="font-bold text-on-surface-variant">{new Date(event.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <button className="bg-primary text-white py-4 px-8 rounded-lg font-label font-bold tracking-[0.2em] uppercase hover:bg-tertiary-container hover:text-white transition-all duration-500 shadow-xl shadow-primary/10 text-[10px]">
              Secure Invitation
            </button>
          </div>

          {/* Right Column: Narrative & Visuals */}
          <div className="lg:col-span-8 flex flex-col gap-16">
            
            <div className="space-y-8">
               <h2 className="font-headline text-3xl md:text-4xl font-black text-primary leading-tight tracking-tighter">The Vision</h2>
               <p className="font-body text-base text-on-surface-variant leading-[1.7] whitespace-pre-wrap first-letter:text-4xl first-letter:font-headline first-letter:float-left first-letter:mr-3 first-letter:italic">
                 {event.description}
               </p>
            </div>

            {/* Cinematic Gallery Slideshow */}
            {event.gallery?.length > 0 && (
              <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-surface-container-low group shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFrame}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <img
                      src={event.gallery[activeFrame].imageUrl}
                      alt="Gallery Frame"
                      className="w-full h-full object-cover grayscale brightness-[0.7]"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1518998053901-55d8d3961a00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80";
                        e.target.onerror = null;
                      }}
                    />
                    <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                      <div className="flex items-center gap-4 mb-2">
                        <h4 className="font-headline text-2xl text-white italic tracking-tight">Perspective {activeFrame + 1}</h4>
                        <div className="h-[0.5px] flex-grow bg-white/20"></div>
                      </div>
                      {event.gallery[activeFrame].tagline && (
                        <p className="font-body text-white/70 leading-relaxed text-sm max-w-lg italic font-light">
                          {event.gallery[activeFrame].tagline}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {event.gallery.map((_, i) => (
                    <div key={i} className="w-8 h-[2px] bg-white/20 relative overflow-hidden rounded-full">
                      {i === activeFrame && (
                        <motion.div
                          layoutId="gallery-progress"
                          className="absolute inset-0 bg-white origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 5, ease: "linear" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Section */}
            {event.type === 'in_person' && (
              <div className="bg-surface-container-low rounded-xl overflow-hidden group shadow-lg">
                <div className="relative h-[400px]">
                  <iframe
                    title="Experience Coordinates"
                    src={mapLocationUrl}
                    width="100%"
                    height="100%"
                    className="grayscale contrast-125 brightness-75 hover:grayscale-0 transition-all duration-1000 border-0"
                    loading="lazy"
                  />
                  <div className="absolute bottom-6 right-6">
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white text-primary flex items-center gap-2 px-6 py-4 rounded-full font-label font-bold text-[9px] uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all duration-500"
                    >
                      <span className="material-symbols-outlined text-base">directions</span>
                      Establish Route
                    </a>
                  </div>
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-xl p-4 rounded-lg shadow-xl border border-outline-variant/10">
                    <p className="font-headline italic text-lg leading-tight text-primary">
                      {event.location.split(',')[0]}
                      <br />
                      <span className="text-[10px] font-body not-italic opacity-40 font-bold uppercase tracking-widest">{event.location.split(',').slice(1).join(',')}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Join the Circle / Footer Teaser */}
      <section className="mt-24 border-t border-outline-variant/10 pt-24 bg-surface-container-low w-full">
        <div className="max-w-screen-2xl mx-auto px-8 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-20">
            <div>
               <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-4 block font-bold">Never miss an opening</span>
               <h2 className="font-headline italic text-4xl md:text-6xl tracking-tighter text-primary leading-none">Join the Circle</h2>
            </div>
            <div className="flex gap-4">
              <Link to="/events" className="bg-surface p-6 px-10 rounded-xl font-label font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-500 border border-outline-variant/10">
                Prev Discovery
              </Link>
              <Link to="/events" className="bg-surface p-6 px-10 rounded-xl font-label font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-500 border border-outline-variant/10">
                Next Discovery
              </Link>
            </div>
          </div>
          
          <div className="pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1,2,3].map((i) => (
                <div key={i} className="group bg-surface p-8 rounded-xl border border-outline-variant/10 hover:-translate-y-2 hover:shadow-xl transition-all duration-700">
                   <span className="text-primary font-label font-bold text-[9px] uppercase tracking-[0.2em] block mb-4 opacity-30">Archive</span>
                   <h5 className="font-headline text-xl italic mb-3 group-hover:text-primary transition-colors">Fragmented Realities</h5>
                   <p className="font-body text-xs text-on-surface-variant leading-relaxed opacity-60">A retrospective on reductive design in the 21st century.</p>
                </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetail;
