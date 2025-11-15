// Pequeñas interacciones para la plantilla
document.addEventListener('DOMContentLoaded',function(){
  // Placeholder: aquí puedes añadir comportamiento (p. ej. menú móvil)
  console.log('Portfolio cargado');

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
});