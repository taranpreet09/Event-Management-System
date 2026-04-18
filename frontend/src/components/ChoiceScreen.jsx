import React from 'react';
import { useModal } from '../context/ModalContext';

const ChoiceScreen = () => {
  const { showModal } = useModal();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Visual Pillar: The Gala Aesthetic */}
      <div className="relative hidden lg:block bg-primary overflow-hidden min-h-[420px]">
        <img 
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80" 
          alt="Elegant gala setting"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8">
          <span className="font-label uppercase tracking-[0.2em] text-xs font-bold text-tertiary-fixed-dim">Membership</span>
          <h2 className="text-2xl font-headline text-on-primary mt-3 leading-tight">
            Step into the <br/>
            <span className="italic text-tertiary-fixed-dim">inner circle</span>.
          </h2>
          <p className="text-on-primary/60 mt-4 font-body text-sm leading-relaxed max-w-xs">
            Gain access to exclusive venues, artisan networks, and the most anticipated events of the season.
          </p>
        </div>
      </div>

      {/* Form Pillar */}
      <div className="p-8 sm:p-10 flex flex-col justify-center">
        <div className="mb-8">
          <div className="font-headline text-xl tracking-tighter text-primary mb-1">The Curator</div>
          <p className="font-body text-on-surface-variant text-sm">Select your gateway to excellence.</p>
        </div>

        <div className="space-y-4">
          {/* Option: Login as User */}
          <div 
            className="group cursor-pointer"
            onClick={() => showModal('USER_LOGIN')}
          >
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl group-hover:bg-surface-container-high transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">person</span>
                </div>
                <div>
                  <h3 className="font-headline text-base text-primary">Login as User</h3>
                  <p className="text-[10px] font-label text-on-surface-variant font-medium mt-0.5 uppercase tracking-widest">Attendees & Connoisseurs</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform text-lg">arrow_forward</span>
            </div>
          </div>

          {/* Option: Register as Organisation */}
          <div 
            className="group cursor-pointer"
            onClick={() => showModal('ORG_REGISTER')}
          >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 hover:bg-surface-container-lowest transition-all duration-300 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed-dim flex items-center justify-center text-on-tertiary-fixed flex-shrink-0">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
                </div>
                <div>
                  <h3 className="font-headline text-base text-primary">Register as Organisation</h3>
                  <p className="text-[10px] font-label text-on-surface-variant font-medium mt-0.5 uppercase tracking-widest">Curators & Venue Partners</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform text-lg">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-on-surface-variant font-body">
            Organisation login?{' '}
            <button 
              onClick={() => showModal('USER_LOGIN')} 
              className="text-primary font-semibold hover:opacity-60 transition-opacity"
            >
              Click here.
            </button>
          </p>
          <div className="flex items-center space-x-4 text-[10px] font-label uppercase tracking-widest font-bold text-primary">
            <a className="hover:opacity-60 transition-opacity" href="#">Privacy</a>
            <a className="hover:opacity-60 transition-opacity" href="#">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoiceScreen;