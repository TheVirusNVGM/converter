document.getElementById('crf').addEventListener('input', function() {
    document.getElementById('crf-value').textContent = this.value;
});

const clickSound = document.getElementById('click-sound');
const completeSound = document.getElementById('complete-sound');

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        clickSound.play();
    });
});

document.getElementById('upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const response = await fetch('/compress', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = document.getElementById('file').files[0].name;
        link.click();
        URL.revokeObjectURL(url);
        showNotification('Сжатие успешно завершено!');
        completeSound.play();
    } else {
        showNotification('Ошибка сжатия.', true);
    }
});

document.getElementById('convert-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const response = await fetch('/convert', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = document.getElementById('convert-file').files[0].name.split('.').slice(0, -1).join('.') + '.' + document.getElementById('format').value;
        link.click();
        URL.revokeObjectURL(url);
        showNotification('Конвертация успешно завершена!');
        completeSound.play();
    } else {
        showNotification('Ошибка конвертации.', true);
    }
});

document.getElementById('convert-file').addEventListener('change', async function() {
    const file = this.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/file_info', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const data = await response.json();
        const formatSelect = document.getElementById('format');
        formatSelect.innerHTML = '';
        data.formats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = format.toUpperCase();
            formatSelect.appendChild(option);
        });
    } else {
        showNotification('Ошибка получения информации о файле.', true);
    }
});

document.getElementById('trim-file').addEventListener('change', function() {
    const file = this.files[0];
    const url = URL.createObjectURL(file);
    const video = document.getElementById('video-preview');
    video.src = url;
    video.onloadedmetadata = function() {
        setupTimeline(video.duration);
    };
});

document.getElementById('trimForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const segments = getSegments();
    formData.append('segments', JSON.stringify(segments));

    const response = await fetch('/trim', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = formData.get('file').name;
        link.click();
        URL.revokeObjectURL(url);
        showNotification('Видео успешно обрезано!');
        completeSound.play();
    } else {
        showNotification('Ошибка обрезки видео.', true);
    }
});

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

// Функции для работы с таймлайном обрезки видео
function setupTimeline(duration) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = ''; // Очистить предыдущие сегменты
    const startMarker = createMarker('start', 0);
    const endMarker = createMarker('end', 100);
    timeline.appendChild(startMarker);
    timeline.appendChild(endMarker);

    startMarker.onmousedown = function(event) {
        document.onmousemove = function(event) {
            const rect = timeline.getBoundingClientRect();
            let percent = (event.clientX - rect.left) / rect.width * 100;
            percent = Math.max(0, Math.min(percent, parseFloat(endMarker.style.left)));
            startMarker.style.left = percent + '%';
            startMarker.setAttribute('data-time', (percent / 100 * duration).toFixed(2));
        };
        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };

    endMarker.onmousedown = function(event) {
        document.onmousemove = function(event) {
            const rect = timeline.getBoundingClientRect();
            let percent = (event.clientX - rect.left) / rect.width * 100;
            percent = Math.max(parseFloat(startMarker.style.left), Math.min(percent, 100));
            endMarker.style.left = percent + '%';
            endMarker.setAttribute('data-time', (percent / 100 * duration).toFixed(2));
        };
        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };

    document.getElementById('cut-button').onclick = function() {
        const startPercent = parseFloat(startMarker.style.left);
        const endPercent = parseFloat(endMarker.style.left);
        const segment = createSegment(startPercent, endPercent);
        timeline.appendChild(segment);
        startMarker.style.left = endPercent + '%';
        startMarker.setAttribute('data-time', (endPercent / 100 * duration).toFixed(2));
        endMarker.style.left = '100%';
        endMarker.setAttribute('data-time', duration);
    };
}

function createMarker(id, leftPercent) {
    const marker = document.createElement('div');
    marker.id = id + '-marker';
    marker.className = 'marker';
    marker.style.left = leftPercent + '%';
    marker.setAttribute('data-time', leftPercent);
    return marker;
}

function createSegment(startPercent, endPercent) {
    const segment = document.createElement('div');
    segment.className = 'segment';
    segment.style.left = startPercent + '%';
    segment.style.width = (endPercent - startPercent) + '%';
    segment.onclick = function(event) {
        if (event.button === 2) { // Правый клик для удаления сегмента
            segment.remove();
        }
    };
    return segment;
}

function getSegments() {
    const segments = [];
    document.querySelectorAll('.segment').forEach(segment => {
        const start = parseFloat(segment.style.left);
        const width = parseFloat(segment.style.width);
        segments.push({
            start: start,
            end: start + width
        });
    });
    return segments;
}

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});