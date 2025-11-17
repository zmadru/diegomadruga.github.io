// Pequeñas interacciones para la plantilla
document.addEventListener('DOMContentLoaded',function(){
  // Placeholder: aquí puedes añadir comportamiento (p. ej. menú móvil)
  console.log('Portfolio cargado');

  // Insertar botón de menú hamburguesa si no existe (para no editar todos los headers)
  try{
    const headerContainers = document.querySelectorAll('.site-header .container');
    headerContainers.forEach(container => {
      if(container.querySelector('.nav-toggle')) return; // ya existe
      const btn = document.createElement('button');
      btn.className = 'nav-toggle';
      btn.setAttribute('aria-label','Abrir menú');
      btn.setAttribute('aria-expanded','false');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      // Insertar antes del nav para que quede a la derecha en flex layout
      const nav = container.querySelector('.main-nav');
      if(nav) container.insertBefore(btn, nav);

      btn.addEventListener('click', ()=>{
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        if(nav){
          nav.classList.toggle('open');
        }
      });
    });
  }catch(e){console.warn('Error inicializando nav-toggle', e)}

  // Marcar el enlace de navegación activo según la ruta completa normalizada
  try{
    const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
    const normalize = (pathname) => {
      // Reemplaza '/index.html' por '/' y elimina la barra final (salvo la raíz)
      let p = pathname.replace(/\/index\.html$/,'/');
      if(p !== '/') p = p.replace(/\/$/, '');
      return p;
    };
    const current = normalize(window.location.pathname);
    navLinks.forEach(a=>{
      const href = a.getAttribute('href') || a.href;
      const url = new URL(href, window.location.href);
      const linkPath = normalize(url.pathname);
      if(linkPath === current){
        a.classList.add('active');
        a.setAttribute('aria-current','page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      }
    });
  }catch(e){
    console.warn('Error marcando nav activa', e);
  }

  // Image sliders: initialize all .image-slider instances on the page
  try{
    const sliderEls = Array.from(document.querySelectorAll('.image-slider .slider'));
    sliderEls.forEach(sliderEl => {
      const slidesViewport = sliderEl.querySelector('.slides');
      const slidesContainer = sliderEl.querySelector('.track');
      if(!slidesContainer) return;
      const slides = Array.from(slidesContainer.querySelectorAll('img'));
      if(slides.length === 0) return;

      let index = 0;
      const total = slides.length;
      let animating = false;
      const update = () => {
        const offset = -index * 100;
        slidesContainer.style.transform = `translateX(${offset}%)`;
      };

      // Ensure images are flex children: set widths relative
      slides.forEach(img=> img.style.minWidth = '100%');

      const next = ()=>{ if(animating) return; index = (index+1)%total; update(); };
      const prev = ()=>{ if(animating) return; index = (index-1+total)%total; update(); };

      // Buttons
      const btnNext = sliderEl.querySelector('.slider-btn.next');
      const btnPrev = sliderEl.querySelector('.slider-btn.prev');
      if(btnNext) btnNext.addEventListener('click', ()=>{ next(); resetTimer(); });
      if(btnPrev) btnPrev.addEventListener('click', ()=>{ prev(); resetTimer(); });

      // Autoplay per slider
      let timer = setInterval(next, 4500);
      const resetTimer = ()=>{ clearInterval(timer); timer = setInterval(next, 4500); };

      // Pause on hover over the visible viewport (slidesViewport)
      if(slidesViewport){
        slidesViewport.addEventListener('mouseenter', ()=> clearInterval(timer));
        slidesViewport.addEventListener('mouseleave', ()=> { clearInterval(timer); timer = setInterval(next,4500); });
      }
    });
  }catch(e){ console.warn('Error inicializando sliders', e) }
});