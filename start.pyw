import os
import webview
import threading
import subprocess
from flask import Flask, request, render_template, send_file, jsonify
from flask_cors import CORS
from ffmpeg_utils import compress_media, get_file_size, format_size, estimate_compressed_size, convert_video, convert_image
import yt_dlp as youtube_dl
import zipfile
import mimetypes

app = Flask(__name__)
CORS(app)

def clean_youtube_url(url):
    return url.split('&')[0]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compress', methods=['POST'])
def compress():
    file = request.files['file']
    crf = int(request.form['crf'])
    filename = file.filename
    filepath = os.path.join('Загрузки', filename)
    file.save(filepath)

    output_path = os.path.join('Сжатые', filename)
    compress_media(filepath, output_path, crf)

    os.remove(filepath)  # Удаление исходного файла
    open_folder(output_path)
    return send_file(output_path, as_attachment=True)

@app.route('/estimate', methods=['POST'])
def estimate():
    file = request.files['file']
    crf = int(request.form['crf'])
    filename = file.filename
    filepath = os.path.join('Загрузки', filename)
    file.save(filepath)

    estimated_size = estimate_compressed_size(filepath, crf)
    return jsonify({'estimated_size': format_size(estimated_size)})

@app.route('/convert', methods=['POST'])
def convert():
    file = request.files['file']
    output_format = request.form['format']
    filename = file.filename
    filepath = os.path.join('Загрузки', filename)
    file.save(filepath)

    output_path = os.path.join('Обработанные', os.path.splitext(filename)[0] + '.' + output_format)
    if output_format in ['gif', 'mp3', 'mp4', 'avi', 'mov', 'webm']:
        output_path = convert_video(filepath, output_format)
    else:
        output_path = convert_image(filepath, output_format)

    os.remove(filepath)  # Удаление исходного файла
    open_folder(output_path)
    return send_file(output_path, as_attachment=True)

@app.route('/file_info', methods=['POST'])
def file_info():
    file = request.files['file']
    filename = file.filename
    filepath = os.path.join('Загрузки', filename)
    file.save(filepath)
    
    mime_type, _ = mimetypes.guess_type(filepath)
    if mime_type.startswith('video/'):
        file_type = 'video'
        formats = ['gif', 'mp3', 'mp4', 'avi', 'mov', 'webm']
    elif mime_type.startswith('image/'):
        file_type = 'image'
        formats = ['png', 'jpg', 'jpeg']
    else:
        file_type = 'unknown'
        formats = []

    return jsonify({'file_type': file_type, 'formats': formats, 'filename': filename, 'size': format_size(get_file_size(filepath))})

@app.route('/preview', methods=['GET'])
def preview():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    clean_url = clean_youtube_url(url)

    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'force_generic_extractor': True,
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(clean_url, download=False)
            return jsonify({
                'title': info.get('title'),
                'thumbnail': info.get('thumbnail')
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/download', methods=['POST'])
def download():
    data = request.get_json()
    links = data.get('links', [])
    format = data.get('format', 'mp4')

    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',
        'outtmpl': 'Загрузки/%(title)s.%(ext)s',
        'quiet': True,
        'merge_output_format': 'mp4',
    }

    download_paths = []

    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        for link in links:
            clean_link = clean_youtube_url(link)
            try:
                result = ydl.extract_info(clean_link)
                download_paths.append(ydl.prepare_filename(result))
            except Exception as e:
                return jsonify({'error': str(e)}), 500

    zip_path = 'Загрузки/videos.zip'
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for path in download_paths:
            if format == 'mp3':
                mp3_path = path.replace('.mp4', '.mp3')
                ffmpeg_command = f'ffmpeg -i "{path}" -q:a 0 -map a "{mp3_path}"'
                subprocess.run(ffmpeg_command, shell=True, check=True)
                path = mp3_path
            
            if os.path.exists(path):
                zipf.write(path, os.path.basename(path))
            else:
                return jsonify({'error': f'File not found: {path}'}), 500

    open_folder(zip_path)
    return send_file(zip_path, as_attachment=True)

def open_folder(path):
    folder_path = os.path.dirname(path)
    if os.name == 'nt':
        os.startfile(folder_path)
    elif os.name == 'posix':
        subprocess.Popen(['xdg-open', folder_path])
    else:
        raise OSError(f'Unsupported OS: {os.name}')

def start_flask():
    os.makedirs('Загрузки', exist_ok=True)
    os.makedirs('Сжатые', exist_ok=True)
    os.makedirs('Обработанные', exist_ok=True)
    app.run(debug=False, use_reloader=False)

if __name__ == '__main__':
    flask_thread = threading.Thread(target=start_flask)
    flask_thread.daemon = True
    flask_thread.start()
    webview.create_window('Компрессор медиафайлов', 'http://127.0.0.1:5000', width=1000, height=800)
    webview.start()
