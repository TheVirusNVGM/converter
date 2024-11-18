document.getElementById('generate-links').addEventListener('click', function() {
    const numVideos = parseInt(document.getElementById('num-videos').value);
    const linkContainer = document.getElementById('link-container');
    linkContainer.innerHTML = '';

    for (let i = 0; i < numVideos; i++) {
        const linkInputContainer = document.createElement('div');
        linkInputContainer.classList.add('link-input-container');

        const linkInput = document.createElement('input');
        linkInput.type = 'text';
        linkInput.placeholder = 'Введите ссылку на видео YouTube';
        linkInput.classList.add('youtube-link');
        linkInputContainer.appendChild(linkInput);

        linkInput.addEventListener('input', function() {
            const url = linkInput.value;
            if (url) {
                const cleanUrl = cleanYoutubeUrl(url);
                showPreview(cleanUrl, linkInputContainer);
            }
        });

        linkContainer.appendChild(linkInputContainer);
    }

    document.getElementById('download-form').style.display = 'block';
});

document.getElementById('download-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const links = Array.from(document.getElementsByClassName('youtube-link')).map(input => cleanYoutubeUrl(input.value));
    const format = document.getElementById('download-format').value;
    const quality = document.getElementById('download-quality').value;

    const response = await fetch('/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ links, format, quality })
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'videos.zip';
        link.click();
        URL.revokeObjectURL(url);
        showNotification('Видео успешно скачано!');
        completeSound.play();
    } else {
        showNotification('Ошибка скачивания видео.', true);
    }
});

async function showPreview(url, container) {
    const response = await fetch(`/preview?url=${encodeURIComponent(url)}`);
    if (response.ok) {
        const data = await response.json();
        let previewContainer = container.querySelector('.preview-container');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.classList.add('preview-container');
            container.appendChild(previewContainer);
        }
        previewContainer.innerHTML = `
            <img src="${data.thumbnail}" alt="Превью">
            <div>
                <p>${data.title}</p>
                <label for="format">Формат:</label>
                <select id="download-format" name="format" required>
                    <option value="mp4">MP4</option>
                    <option value="mp3">MP3</option>
                </select>
                <label for="quality">Качество:</label>
                <select id="download-quality" name="quality" required>
                    <option value="2160">2160p (4K)</option>
                    <option value="1440">1440p (2K)</option>
                    <option value="1080">1080p</option>
                    <option value="720">720p</option>
                    <option value="480">480p</option>
                    <option value="360">360p</option>
                    <option value="240">240p</option>
                </select>
            </div>
        `;
    } else {
        showNotification('Ошибка получения информации о видео.', true);
    }
}

function cleanYoutubeUrl(url) {
    return url.split('&')[0];
}

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
