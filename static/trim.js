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
