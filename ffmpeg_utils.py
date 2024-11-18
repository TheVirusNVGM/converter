import ffmpeg
import os
import humanize

def compress_media(input_path, output_path, crf=28):
    input_format = os.path.splitext(input_path)[1].lower()
    if input_format in ['.jpg', '.jpeg', '.png']:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, qscale=3)  # Применяем параметр для сжатия изображения
            .run(overwrite_output=True)
        )
    elif input_format == '.webm':
        (
            ffmpeg
            .input(input_path)
            .output(output_path, vcodec='libvpx-vp9', crf=crf, preset='fast')
            .run(overwrite_output=True)
        )
    else:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, vcodec='h264_nvenc', crf=crf, preset='fast')
            .run(overwrite_output=True)
        )
    return output_path

def get_file_size(file_path):
    return os.path.getsize(file_path)

def format_size(size):
    return humanize.naturalsize(size, binary=True)

def estimate_compressed_size(input_path, crf=28):
    output_path = input_path + "_temp.mp4"
    compress_media(input_path, output_path, crf=crf)
    size = get_file_size(output_path)
    os.remove(output_path)
    return size

def convert_video(input_path, output_format):
    output_path = os.path.join('Обработанные', os.path.splitext(os.path.basename(input_path))[0] + '.' + output_format)
    if output_format == 'gif':
        (
            ffmpeg
            .input(input_path)
            .output(output_path, vf='fps=10,scale=320:-1:flags=lanczos', loop=0)
            .run(overwrite_output=True)
        )
    elif output_format == 'webm':
        (
            ffmpeg
            .input(input_path)
            .output(output_path, vcodec='libvpx-vp9')
            .run(overwrite_output=True)
        )
    else:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, vcodec='h264_nvenc')
            .run(overwrite_output=True)
        )
    return output_path

def convert_image(input_path, output_format):
    output_path = os.path.join('Обработанные', os.path.splitext(os.path.basename(input_path))[0] + '.' + output_format)
    (
        ffmpeg
        .input(input_path)
        .output(output_path)
        .run(overwrite_output=True)
    )
    return output_path
