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
