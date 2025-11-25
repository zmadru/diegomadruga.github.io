document.addEventListener('DOMContentLoaded', function () {
  // Solo ejecutar si el body tiene la clase 'stars-bg'
  if (!document.body.classList.contains('stars-bg')) {
    return;
  }

  // Crear el contenedor de estrellas si no existe
  let starsContainer = document.querySelector('.stars-container');
  if (!starsContainer) {
    starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    document.body.insertAdjacentElement('afterbegin', starsContainer);
  }

  // Crear estrellas titilantes
  const numStars = 150;
  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 2 + 1; // Tamaño entre 1px y 3px
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 2}s`; // Retraso aleatorio
    star.style.animationDuration = `${Math.random() * 2 + 2}s`; // Duración aleatoria
    starsContainer.appendChild(star);
  }

  // Crear meteoros
  const numMeteors = 5;
  for (let i = 0; i < numMeteors; i++) {
    const meteor = document.createElement('div');
    meteor.classList.add('meteor');
    
    const startX = Math.random() * 200 - 100; // -100vw a 100vw
    const startY = Math.random() * 100 - 50;  // -50vh a 50vh
    meteor.style.top = `${startY}vh`;
    meteor.style.left = `${startX}vw`;

    const duration = Math.random() * 5 + 5; // Duración entre 5s y 10s
    const delay = Math.random() * 10; // Retraso entre 0s y 10s
    meteor.style.animationName = 'fall';
    meteor.style.animationDuration = `${duration}s`;
    meteor.style.animationDelay = `${delay}s`;
    starsContainer.appendChild(meteor);
  }
});