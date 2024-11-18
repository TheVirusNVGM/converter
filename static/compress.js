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

document.getElementById('compress-form').addEventListener('submit', async function(event) {
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
