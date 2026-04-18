import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

const Home = () => {
  const { showModal } = useModal();
  const triggered = useRef(false);

  // Proactive modal
  useEffect(() => {
    const triggerModal = () => {
      if (sessionStorage.getItem('proactiveModalShown')) return;
      if (triggered.current) return;
      triggered.current = true;
      showModal('CHOICE');
      sessionStorage.setItem('proactiveModalShown', 'true');
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timerId);
    };
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage > 25) triggerModal();
    };
    const timerId = setTimeout(triggerModal, 7000);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timerId);
    };
  }, [showModal]);

  // Reveal animation & Parallax
  useEffect(() => {
    const heroContent = document.getElementById('hero-content');
    if (heroContent) {
      const lines = heroContent.querySelectorAll('span, div, h1 span');
      lines.forEach(el => {
        el.classList.remove('translate-y-full', 'translate-y-4', 'opacity-0');
      });
    }

    const revealCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };
    const revealObserver = new IntersectionObserver(revealCallback, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    const parallaxBg = document.querySelector('#hero-parallax img');
    const scrollHandler = () => {
      const scrollY = window.scrollY;
      if (parallaxBg && scrollY < window.innerHeight) {
        parallaxBg.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };
    window.addEventListener('scroll', scrollHandler);

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('scroll', scrollHandler);
    }
  }, []);

  return (
    <>
      <style>{`
        /* Removed tc-bleed as App.jsx no longer adds padding/margin to main wrapping element */
        
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        .silk-gradient {
            background: linear-gradient(135deg, #00050d 0%, #121f2c 100%);
        }
        .glass-panel {
            background: rgba(250, 249, 248, 0.7);
            backdrop-filter: blur(20px);
        }
        
        /* Reveal Animation Base */
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.21, 1.02, 0.49, 1);
        }
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }

        /* Collage Animation */
        @keyframes collageReveal {
            0% { opacity: 0; transform: scale(1.05) translateY(20px); filter: grayscale(100%) brightness(50%); }
            100% { opacity: 1; transform: scale(1) translateY(0); filter: grayscale(20%) brightness(85%); }
        }
        .collage-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            animation: collageReveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            border-radius: 0.5rem;
        }

        /* Image Hover Effect */
        .image-container {
            overflow: hidden;
            position: relative;
        }
        .image-container img {
            transition: transform 1s cubic-bezier(0.2, 0, 0.2, 1);
        }
        .image-container:hover img {
            transform: scale(1.08);
        }
        .image-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 5, 13, 0);
            transition: background 0.4s ease;
        }
        .image-container:hover .image-overlay {
            background: rgba(0, 5, 13, 0.15);
        }
      `}</style>

      <div className="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-primary w-full overflow-hidden">
        <main className="w-full">
          {/* Hero Section */}
          <section className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center pt-24 pb-16 md:py-32 px-4 overflow-hidden bg-surface">
            
            <div className="absolute inset-0 z-0" id="hero-parallax">
              {/* Collage Grid - Responsive */}
              <div className="absolute top-[-10%] w-full h-[120%] grid grid-cols-2 md:grid-cols-4 grid-rows-4 md:grid-rows-3 gap-2 md:gap-4 p-2 md:p-4 opacity-75">
                <div className="col-span-1 row-span-1 md:row-span-2 overflow-hidden shadow-2xl">
                  <img className="collage-img" style={{ animationDelay: '0.2s' }} src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&q=80" alt="Gala" />
                </div>
                <div className="col-span-1 md:col-span-2 row-span-1 overflow-hidden shadow-2xl md:mt-12">
                  <img className="collage-img" style={{ animationDelay: '0.5s' }} src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80" alt="Outdoor" />
                </div>
                <div className="col-span-2 md:col-span-1 row-span-2 overflow-hidden shadow-2xl">
                  <img className="collage-img" style={{ animationDelay: '0.8s' }} src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&q=80" alt="Dining" />
                </div>
                <div className="col-span-2 md:col-span-2 row-span-2 md:row-span-1 overflow-hidden shadow-2xl md:mb-12">
                  <img className="collage-img object-center" style={{ animationDelay: '1.2s' }} src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80" alt="Concert" />
                </div>
                <div className="col-span-1 row-span-1 overflow-hidden shadow-2xl">
                  <img className="collage-img" style={{ animationDelay: '1.6s' }} src="https://images.unsplash.com/photo-1478147427282-58a87a433117?w=1000&q=80" alt="Catering" />
                </div>
                <div className="col-span-1 row-span-1 overflow-hidden shadow-2xl md:mt-8">
                  <img className="collage-img" style={{ animationDelay: '2.0s' }} src="https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1000&q=80" alt="Decor" />
                </div>
              </div>
              
              {/* Overlays to ensure text readability without hiding images */}
              <div className="absolute inset-0 bg-surface/10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-transparent to-surface/80"></div>
            </div>

            <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
              <div id="hero-content" className="flex flex-col items-center w-full">
                <span className="inline-block font-label text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-6 reveal">
                  Established 2024 — Premiere Curation
                </span>
                
                <h1 className="font-headline text-5xl sm:text-6xl md:text-8xl font-black text-primary leading-[1.05] tracking-tight mb-8 z-20 reveal" style={{ transitionDelay: '100ms' }}>
                  Crafting <span className="italic font-light">Unforgettable</span>
                  <br className="hidden md:block" /> Moments
                </h1>
                
                <p className="max-w-2xl text-base md:text-lg text-on-surface-variant font-medium mb-12 leading-relaxed reveal" style={{ transitionDelay: '200ms' }}>
                  We transcend traditional event planning, offering an editorial approach to experience design. For those who demand the immaculate.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full sm:w-auto reveal" style={{ transitionDelay: '300ms' }}>
                  <Link to="/events" className="silk-gradient text-on-primary px-10 py-4 rounded-lg font-label text-xs md:text-sm font-extrabold uppercase tracking-widest shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                    Inquire Now
                  </Link>
                  <Link to="/dashboard" className="group flex items-center justify-center gap-3 font-label text-xs md:text-sm font-bold uppercase tracking-widest text-primary w-full sm:w-auto">
                    View Portfolio 
                    <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-16 md:py-32 bg-surface-container-low px-4 sm:px-8 md:px-12">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 gap-6 md:gap-8 reveal">
                <div className="max-w-2xl">
                  <h2 className="font-headline text-3xl sm:text-4xl md:text-6xl font-bold text-primary mb-4 md:mb-8 leading-tight">Mastery in Every <br className="hidden sm:block"/>Detail</h2>
                  <p className="text-on-surface-variant text-base md:text-lg leading-relaxed font-light max-w-lg">
                    We transcend traditional event planning, offering an editorial approach to experience design. From heritage venues to avant-garde gastronomy.
                  </p>
                </div>
                <div className="pb-2">
                  <div className="h-[1px] w-32 bg-primary mb-4 opacity-20"></div>
                  <span className="font-label text-xs uppercase tracking-widest text-primary font-bold">Our Expertise</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                {/* Service 1 */}
                <div className="flex flex-col group cursor-default reveal" style={{ transitionDelay: '100ms' }}>
                  <div className="aspect-[4/5] rounded-xl mb-6 md:mb-8 bg-surface-container image-container">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy-T9tzA0hvVh5QUxNA4PFFUMXN1pIMUvdrluGs8WB5EnQd9yjcid8P9oNKzCOnEDZfQG-KldXp2Yu2IL09AXfjMBOwI9sDuy8lwLlaJRFIp3uFnw2NqSvVVp2HP1Ofm_hZHf7WtIz3oGxs4xwLxZ4RdFmjq3SJhc8oG4LctPVtValvJLY4GaYv7I6na0w1V_QGKOcDHvFKJhP9VbXOFNP0ZplwOGbZqxCVgMS0Ak5_ITC-P0_4p391Qi8tzJZ0YyN8lhENg4Pww" alt="Service 1"/>
                    <div className="image-overlay"></div>
                  </div>
                  <h3 className="font-headline text-xl md:text-2xl font-bold mb-3 md:mb-4 text-primary">Seamless Event Planning</h3>
                  <p className="text-on-surface-variant font-light leading-relaxed mb-4 md:mb-6 text-sm md:text-base">Logistical precision meets creative intuition. We manage the complex so you can inhabit the moment.</p>
                  <span className="text-primary font-label text-xs font-bold uppercase tracking-widest border-b border-primary/20 pb-1 w-fit group-hover:border-primary transition-colors">Explore Planning</span>
                </div>
                
                {/* Service 2 */}
                <div className="flex flex-col group cursor-default md:mt-24 reveal" style={{ transitionDelay: '300ms' }}>
                  <div className="aspect-[4/5] rounded-xl mb-6 md:mb-8 bg-surface-container image-container">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5D-DqXeEI0fiPQoIv3A7QyIQSl71s3uLWTd4XmMx3PRxH_2-FSFMPK2Ldgrt1l-Q0rN8lWWjk3LAsoccGSPwYvUaF1zrWX_FbvoBwtV8HehUfLpV6jfd9jZre9GH4NBCtTQBErCe34qBUb-CO96Qoz9Fl0k6IUCSmS-cZFHfjWbeT_Fbtb7YaFnoxwf6KWivQS6LlaGrGdprOi1v6ePRlXzP3WleuOzhkwXqV6qUOSUFCUfZBhtdXwYUYQNgE_yLaZI5ojOQfAA" alt="Service 2"/>
                    <div className="image-overlay"></div>
                  </div>
                  <h3 className="font-headline text-xl md:text-2xl font-bold mb-3 md:mb-4 text-primary">Exquisite Catering</h3>
                  <p className="text-on-surface-variant font-light leading-relaxed mb-4 md:mb-6 text-sm md:text-base">A sensory journey tailored to your palate. Michelin-standard menus served with effortless grace.</p>
                  <span className="text-primary font-label text-xs font-bold uppercase tracking-widest border-b border-primary/20 pb-1 w-fit group-hover:border-primary transition-colors">View Menus</span>
                </div>
                
                {/* Service 3 */}
                <div className="flex flex-col group cursor-default reveal" style={{ transitionDelay: '500ms' }}>
                  <div className="aspect-[4/5] rounded-xl mb-6 md:mb-8 bg-surface-container image-container">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9sbdC-Fe-lbTT0HtQVyaTSySom3FtRZAXr5S0foCPAiLU_5Bf6tmLr2eLg4cDAyLsDD4wm8getdrFDSlSuxcDTcMszdtq-7HcHehEYqfUMwhpyOUaOFuZJWlDMHul6dNf7686bf4GSZo4oUGnQUQHnMU6jcnFFDFO87XbkIfWg7ADMAgpAs8MI7TNGcunApvtiJxH2jDRJs24YKN-BVBj_yAEl9cbfcXxtUhUoNUcgQBDJt33hM8wM5FWhz-3Ta5BfuintoYvgQ" alt="Service 3"/>
                    <div className="image-overlay"></div>
                  </div>
                  <h3 className="font-headline text-xl md:text-2xl font-bold mb-3 md:mb-4 text-primary">Immersive Experiences</h3>
                  <p className="text-on-surface-variant font-light leading-relaxed mb-4 md:mb-6 text-sm md:text-base">Atmospheric design that lingers in memory. We create worlds that tell your unique story.</p>
                  <span className="text-primary font-label text-xs font-bold uppercase tracking-widest border-b border-primary/20 pb-1 w-fit group-hover:border-primary transition-colors">Discover Magic</span>
                </div>
              </div>
            </div>
          </section>

          {/* Portfolio Section */}
          <section className="py-16 md:py-32 bg-surface">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-5 order-2 md:order-1 reveal">
                  <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed-variant px-4 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6 inline-block">The Portfolio</span>
                  <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 md:mb-8 leading-[1.1]">Elite Events <br/>Curated by Hand</h2>
                  <p className="text-on-surface-variant text-base md:text-lg mb-6 md:mb-10 leading-relaxed font-light">
                    From private island retreats to metropolitan heritage galas, our portfolio represents the pinnacle of intentional celebration.
                  </p>
                  <Link to="/events" className="bg-surface-container-high text-on-surface px-8 md:px-10 py-3 md:py-4 rounded-lg font-label text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors inline-block">
                    Request Access
                  </Link>
                </div>
                
                <div className="md:col-span-7 order-1 md:order-2 grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-3 md:space-y-4">
                    <div className="image-container rounded-xl reveal" style={{ transitionDelay: '200ms' }}>
                      <img className="w-full aspect-[3/4] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSW2Y5-0cKlCc1TGKdWwXVnu17F3roE0us3CFoQ-M40EO240e0S0bcxb37TFgCU9S6RBfMTGs_KyuFl_kNuGGP72cZjqT-wPBD3vlwGFIvfOuAEGbmCMMGf4wuvj6w4hARXqW0T4ErpFs0hMEkVytiQYOJSgfUwGTJi_Ujx5bjxXBeHr1cpSIzIQIRTr5DbbhyeHyohZf22ONUTXagFYb5wZ2C8QLWkj_HQlPjU9Jl_-YDQfGFoa1yqurlLol_h2vY0bx_A_kOVA" alt="Portfolio 1"/>
                      <div className="image-overlay"></div>
                    </div>
                    <div className="image-container rounded-xl reveal" style={{ transitionDelay: '400ms' }}>
                      <img className="w-full aspect-square object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvMuUc8ecU9yyYOpyZ7xW690CSWHhOSl4M-AYYsZ5QaOaEkZ9a0zIW-Jm7ecm3oVGpYRg3BtEQXgeXX5EfDqETUrL76_TmO_IkLeX5RqTWGfHaf52IbmsD8SStZkfwGdxeJyYKvK-PIHOKJIMh24GaGdgk8Pu9aPbN_G4qXP55ixbnh8wUN8feJLtosGh-5l_vSK27DxfZKn4mR0SXR_k_4YFyEwc57TaMKOgPjdD9XZY-BsCY5T7L7o3m6zyUlB1CBvxpRWt7fA" alt="Portfolio 2"/>
                      <div className="image-overlay"></div>
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4 pt-8 md:pt-12">
                    <div className="image-container rounded-xl reveal" style={{ transitionDelay: '300ms' }}>
                      <img className="w-full aspect-square object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHXygQeoDjIIXtrgyV46-fy7yusFp0LQBYM9zT0ZeqpURzvZJ7iQg7Jbn_gEXqO_DtxvjfNpjwoaArcAu_vMByvafGMNSydbcDJ_6zgBcxRQbGA_dymsyXZW9UmuiocrMf-jH81W08QaF71bPHddFGsYzEf0ecRPZrMZk_nxeRitP9e9XHU0N4oLH-bHzJjzZ5PP47YFCiZ94F4fK2aiXPXQ2iWStKySpuU9RmnpGjGh7oTnp9SmsOU_y6tlomuB7tcKGV2l2TMA" alt="Portfolio 3"/>
                      <div className="image-overlay"></div>
                    </div>
                    <div className="image-container rounded-xl reveal" style={{ transitionDelay: '500ms' }}>
                      <img className="w-full aspect-[3/4] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCks2XV2m2L7SYClKHRVmi1jxn5CuwCqtZegO1nI7e37YwoxQYA-Kt87PmdpnNYJEXpScpf0F3vdwUtAu8ROJyVfxDLI-wh9zVafla-GPVxKpXLBhZ_kGd42DJrhILZej55mP6Rexky-LRy0EA5uJvBi48EXiKCE0DOqV1YAoPQKsP9z1k2MpFlq2qtRYcQqTcnPgUCr5Bk2RNO0Gr4S0zcfWfHSCIpe00E2srJsqu-nn2TFu24lSq7rlZz2SI0XMRgInsNOmCQtQ" alt="Portfolio 4"/>
                      <div className="image-overlay"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Inquiry Section */}
          <section className="py-16 md:py-32 bg-surface-container-low relative overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img className="w-full h-full object-cover opacity-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHqm12l51Ta93qn8cD70PhrRMeyEP5uXyLwZ37A7EH0iwokZNQIy8LIlS1UJ32VTl3Ly9ivkHeFG322liRqVij7y9qoNnI2r30bXveCL66MLu3of_sF7FJxoMuSScXsamSvyNzbu4nBbCP50mYp-GzdUBla9rdjGA0zIaPKXTiL-N8s5msSvkRxq5UiCjH88ob02otUtQt-kLjv98zTq02RXCYyIyk0uWX5nzjjUG91t41WkCSON-PQeclSylVEJyzUR8DC7WwXA" alt="Background Texture"/>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 reveal">
              <div className="glass-panel p-8 sm:p-12 md:p-20 rounded-xl shadow-sm border border-outline-variant/10">
                <div className="text-center mb-10 md:mb-16">
                  <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4 text-primary">Start the Curation</h2>
                  <p className="text-on-surface-variant font-light text-sm md:text-base">Inquire about our availability for your next marquee event.</p>
                </div>
                
                <form action="#" className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10" onSubmit={(e) => { e.preventDefault(); showModal('CHOICE'); }}>
                  <div className="flex flex-col gap-2 text-left">
                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Full Name</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-all py-3 px-0 font-light placeholder:text-outline-variant text-sm md:text-base" placeholder="Julian Vane" type="text"/>
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Email Address</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-all py-3 px-0 font-light placeholder:text-outline-variant text-sm md:text-base" placeholder="julian@vane.com" type="email"/>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2 text-left">
                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Event Concept</label>
                    <input className="bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-all py-3 px-0 font-light placeholder:text-outline-variant text-sm md:text-base" placeholder="Briefly describe your vision..." type="text"/>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-center mt-4 md:mt-8">
                    <button className="silk-gradient text-on-primary px-10 md:px-16 py-4 md:py-5 rounded-lg font-label text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] shadow-lg group w-full sm:w-auto">
                      Send Inquiry
                      <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-y-[-2px] transition-transform">send</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  );
};

export default Home;