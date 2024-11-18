[Setup]
AppName=Пися
AppVersion=1.0
DefaultDirName={pf}\Пися
DefaultGroupName=Пися
OutputDir=.
OutputBaseFilename=Пися
Compression=lzma
SolidCompression=yes

[Files]
; Укажите путь к вашим файлам
Source: "dist\Пиздахуйка.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "templates\*"; DestDir: "{app}\templates"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "static\*"; DestDir: "{app}\static"; Flags: ignoreversion recursesubdirs createallsubdirs

; Условная установка FFmpeg
Source: "dist\_internal\ffmpeg\*"; DestDir: "{app}\ffmpeg"; Flags: ignoreversion recursesubdirs createallsubdirs; Tasks: installffmpeg

[Icons]
Name: "{group}\Пися"; Filename: "{app}\Пиздахуйка.exe"
Name: "{commondesktop}\Пися"; Filename: "{app}\Пиздахуйка.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "installffmpeg"; Description: "Установить FFmpeg"; GroupDescription: "Дополнительные компоненты"

[Run]
Filename: "{app}\Пиздахуйка.exe"; Description: "{cm:LaunchProgram,Пися}"; Flags: nowait postinstall skipifsilent
