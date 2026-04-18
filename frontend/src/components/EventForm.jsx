import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/events';
import { toast } from 'react-toastify';

const EventForm = ({ existingEvent = null, onSubmit: onUpdate, isEditing = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    type: 'in_person',
    category: '',
    date: '',
    registrationDeadline: '',
    location: '',
    coverImageUrl: '',
    capacity: '',
    gallery: [], 
  });
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (isEditing && existingEvent) {
      const formattedDate = existingEvent.date ? new Date(existingEvent.date).toISOString().slice(0, 16) : '';
      const formattedDeadline = existingEvent.registrationDeadline
        ? new Date(existingEvent.registrationDeadline).toISOString().slice(0, 16)
        : '';
      setFormData({
        title: existingEvent.title || '',
        shortDescription: existingEvent.shortDescription || '',
        description: existingEvent.description || '',
        type: existingEvent.type || 'in_person',
        category: existingEvent.category || '',
        date: formattedDate,
        registrationDeadline: formattedDeadline,
        location: existingEvent.location || '',
        coverImageUrl: existingEvent.coverImageUrl || '',
        capacity: existingEvent.capacity != null ? String(existingEvent.capacity) : '',
        gallery: existingEvent.gallery || [],
      });
    }
  }, [existingEvent, isEditing]);

  const { title, shortDescription, description, type, category, date, registrationDeadline, location, coverImageUrl, capacity, gallery } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addGalleryItem = () => {
    setFormData({ ...formData, gallery: [...gallery, { imageUrl: '', tagline: '' }] });
  };

  const removeGalleryItem = (index) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery: newGallery });
  };

  const handleGalleryChange = (index, field, value) => {
    const newGallery = [...gallery];
    newGallery[index][field] = value;
    setFormData({ ...formData, gallery: newGallery });
  };

  const uploadImage = async (file, fieldName = 'coverImageUrl', index = null) => {
    setImageUploading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1111';
      const data = new FormData();
      data.append('image', file);

      const res = await fetch(`${baseUrl}/api/uploads/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: data,
      });

      if (!res.ok) throw new Error('Image upload failed.');
      const json = await res.json();
      
      if (index !== null) {
        const newGallery = [...formData.gallery];
        newGallery[index].imageUrl = json.url;
        setFormData((prev) => ({ ...prev, gallery: newGallery }));
      } else {
        setFormData((prev) => ({ ...prev, [fieldName]: json.url }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setImageUploading(false);
    }
  };

  const finalOnSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title || !shortDescription || !description || !type || !category || !date || !registrationDeadline || !location || !coverImageUrl || !capacity) {
      toast.error('All primary fields and Primary Cover Frame are required.');
      return;
    }

    const submissionData = { ...formData, capacity: Number(capacity) };
    if (isEditing) {
      onUpdate(submissionData);
    } else {
      handleCreate(submissionData);
    }
  };

  const handleCreate = async (submissionData) => {
    try {
      await createEvent(submissionData);
      toast.success('Experience published successfully!');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to create experience.';
      toast.error(errorMsg);
    }
  };

  const inputUnderline = "w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/30 px-2 py-3 focus:ring-0 focus:border-primary transition-all";
  const labelKicker = "block font-label text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant mb-2 px-2";

  return (
    <div className="w-full">
      {/* Hero Section */}
      <header className="mb-12 md:mb-16">
        <p className="font-label uppercase tracking-[0.3em] text-[10px] font-bold text-on-surface-variant mb-4">Drafting a Masterpiece</p>
        <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-primary mb-6">
          {isEditing ? 'Refine Experience' : 'Experience Orchestration'}
        </h1>
        <div className="h-px w-32 bg-primary"></div>
      </header>

      <form onSubmit={finalOnSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Identity & Narrative */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Section: Identity */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-headline italic opacity-20 text-on-surface">01</span>
              <h2 className="text-2xl font-body font-bold tracking-tight text-on-surface">Identity</h2>
            </div>

            <div className="space-y-10">
              <div className="group">
                <label className={labelKicker}>Experience Title</label>
                <input 
                  type="text" name="title" value={title} onChange={onChange} required
                  className={`${inputUnderline} text-2xl md:text-3xl font-headline italic text-primary placeholder:opacity-40`} 
                  placeholder="The Midnight Vernissage" 
                />
              </div>

              <div className="group">
                <label className={labelKicker}>Short Preview / Editorial Clip</label>
                <textarea 
                  name="shortDescription" value={shortDescription} onChange={onChange} required rows="2" maxLength="200"
                  className={`${inputUnderline} text-lg md:text-xl font-headline italic text-on-surface placeholder:opacity-40 resize-none`} 
                  placeholder="A brief, evocative sentence that lingers in the guest's mind..." 
                />
              </div>

              <div className="group">
                <label className={labelKicker}>The Narrative</label>
                <textarea 
                  name="description" value={description} onChange={onChange} required rows="8"
                  className={`${inputUnderline} text-base leading-relaxed text-on-surface-variant placeholder:opacity-40 resize-none font-light`} 
                  placeholder="Tell the story of this event. Describe the atmosphere, the sensory details, and the intended emotional arc of the evening." 
                />
              </div>
            </div>
          </section>

          {/* Section: Gallery */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-headline italic opacity-20 text-on-surface">02</span>
              <h2 className="text-2xl font-body font-bold tracking-tight text-on-surface">Cinematic Gallery</h2>
            </div>
            
            <div className="mb-8">
              <label className={labelKicker}>Primary Cover Frame *</label>
              {coverImageUrl ? (
                <div className="relative w-full aspect-video md:aspect-[21/9] rounded-lg overflow-hidden group">
                  <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <label className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <span className="material-symbols-outlined text-4xl mb-2">change_circle</span>
                    <span className="uppercase tracking-widest text-[10px] font-bold">Replace Cover</span>
                    <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="w-full aspect-video md:aspect-[21/9] bg-surface-container border border-dashed border-outline-variant/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors text-on-surface-variant/40 hover:text-on-surface-variant group">
                  <span className="material-symbols-outlined text-4xl mb-2 group-hover:scale-110 transition-transform">upload_file</span>
                  <p className="text-xs font-bold uppercase tracking-widest">Upload Hero Image</p>
                  <input type="file" accept="image/*" required={!isEditing} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} className="hidden" />
                </label>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className={labelKicker}>Supplementary Gallery Rooms (Optional)</label>
                <button type="button" onClick={addGalleryItem} className="text-primary font-label text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <span className="material-symbols-outlined text-sm">add</span> Add Frame
                </button>
              </div>

              {gallery.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 relative group shadow-sm hover:shadow-md transition-shadow">
                  <button type="button" onClick={() => removeGalleryItem(index)} className="absolute top-4 right-4 text-outline hover:text-error">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                  
                  <div className="md:col-span-1">
                    {item.imageUrl ? (
                      <div className="w-full aspect-[4/5] rounded-lg overflow-hidden relative group/img">
                        <img src={item.imageUrl} alt="gallery" className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-primary/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                           <span className="material-symbols-outlined">edit</span>
                           <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], null, index)} className="hidden" />
                        </label>
                      </div>
                    ) : (
                      <label className="w-full aspect-[4/5] bg-surface-container rounded-lg border border-dashed border-outline-variant/30 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors text-on-surface-variant/40 hover:text-on-surface-variant cursor-pointer">
                        <span className="material-symbols-outlined text-2xl mb-2">add_a_photo</span>
                        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], null, index)} className="hidden" />
                      </label>
                    )}
                  </div>
                  
                  <div className="md:col-span-3 flex flex-col justify-center">
                    <label className={labelKicker}>Frame Tagline</label>
                    <textarea 
                      value={item.tagline} onChange={(e) => handleGalleryChange(index, 'tagline', e.target.value)} 
                      rows="3" className={`${inputUnderline} text-sm font-headline italic resize-none`} placeholder="An evocative description..." 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {imageUploading && <p className="text-[10px] font-label uppercase tracking-widest text-primary mt-4 animate-pulse italic">Processing Media Asset...</p>}
          </section>
        </div>

        {/* Right Column: Logistics (Sticky) */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-28 bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-headline italic opacity-20 text-on-surface">03</span>
              <h2 className="text-xl font-body font-bold tracking-tight text-on-surface">Logistics</h2>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelKicker}>Format</label>
                  <select name="type" value={type} onChange={onChange} required className={`${inputUnderline} text-sm font-bold bg-transparent text-primary cursor-pointer`}>
                    <option className="bg-surface" value="in_person">In-Person</option>
                    <option className="bg-surface" value="online">Digital Simulcast</option>
                  </select>
                </div>
                <div>
                  <label className={labelKicker}>Category</label>
                  <select name="category" value={category} onChange={onChange} required className={`${inputUnderline} text-sm font-bold bg-transparent text-primary cursor-pointer`}>
                    <option className="bg-surface" value="">Select...</option>
                    <option className="bg-surface" value="Fine Arts">Fine Arts</option>
                    <option className="bg-surface" value="Gala">Gala</option>
                    <option className="bg-surface" value="Intellectual Salon">Intellectual Salon</option>
                    <option className="bg-surface" value="Workshop">Workshop</option>
                    <option className="bg-surface" value="Exhibition">Exhibition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelKicker}>Commencement</label>
                <div className="flex items-center gap-3 border-b border-outline-variant/40 py-2">
                  <span className="material-symbols-outlined text-sm opacity-60">calendar_today</span>
                  <input type="datetime-local" name="date" value={date} onChange={onChange} required className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full font-bold text-primary" />
                </div>
              </div>

              <div>
                <label className={labelKicker}>RSVP Deadline</label>
                <div className="flex items-center gap-3 border-b border-outline-variant/40 py-2">
                  <span className="material-symbols-outlined text-sm opacity-60">hourglass_top</span>
                  <input type="datetime-local" name="registrationDeadline" value={registrationDeadline} onChange={onChange} required className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full font-bold text-primary" />
                </div>
              </div>

              <div>
                <label className={labelKicker}>Location / Venue</label>
                <div className="flex items-center gap-3 border-b border-outline-variant/40 py-2">
                  <span className="material-symbols-outlined text-sm opacity-60">location_on</span>
                  <input type="text" name="location" value={location} onChange={onChange} required className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full font-bold text-primary placeholder:text-on-surface-variant/30 placeholder:font-light" placeholder={type === 'online' ? 'Digital Link/Platform' : 'The Glass Atrium, 5th Ave'} />
                </div>
              </div>

              <div>
                <label className={labelKicker}>Guest Limit</label>
                <div className="flex items-center gap-3 border-b border-outline-variant/40 py-2">
                  <span className="material-symbols-outlined text-sm opacity-60">group</span>
                  <input type="number" name="capacity" value={capacity} onChange={onChange} required min="1" className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full font-bold text-primary placeholder:text-on-surface-variant/30 placeholder:font-light" placeholder="50" />
                </div>
                <p className="text-[10px] text-tertiary-fixed-dim/80 mt-2 font-headline italic">*A limited guest count ensures intimacy.</p>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-outline-variant/20">
              <button disabled={imageUploading} type="submit" className="w-full silk-gradient text-white py-5 rounded-lg flex items-center justify-center gap-3 group transition-transform active:scale-95 shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50">
                <span className="uppercase tracking-[0.2em] text-[10px] md:text-xs font-black">
                  {isEditing ? 'Commit Changes' : 'Publish Experience'}
                </span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">{isEditing ? 'done' : 'arrow_right_alt'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventForm;