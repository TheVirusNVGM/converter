function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('error');
    if (isError) {
        notification.classList.add('error');
    }
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    document.body.appendChild(particle);

    requestAnimationFrame(() => {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 100 + 50;
        const destinationX = x + radius * Math.cos(angle);
        const destinationY = y + radius * Math.sin(angle);
        const duration = Math.random() * 2 + 1;

        particle.style.transition = `transform ${duration}s ease-out, opacity ${duration}s ease-out`;
        particle.style.transform = `translate(${destinationX - x}px, ${destinationY - y}px)`;
        particle.style.opacity = 0;

        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    });
}

function addParticleEffect(element) {
    element.addEventListener('mouseover', function(event) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + (rect.width / 2);
        const y = rect.top + (rect.height / 2);
        for (let i = 0; i < 7; i++) {
            createParticle(x, y);
        }
    });
}

document.querySelectorAll('.title, .subtitle').forEach(addParticleEffect);

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
}

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    document.getElementById(sectionId).style.display = 'block';
}

// Показать главную секцию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    showSection('compress-section');  // или любую другую секцию по умолчанию
});
