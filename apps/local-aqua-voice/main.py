import sys
import os
import json
from PyQt6.QtWidgets import QApplication, QSystemTrayIcon, QMenu, QInputDialog, QMessageBox
from PyQt6.QtGui import QIcon, QPixmap, QPainter, QColor
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QObject, QStandardPaths
from recorder import AudioRecorder
from transcription import TranscriptionEngine
from pynput.keyboard import Controller, GlobalHotKeys, Key

def get_base_path():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))

def get_config_path():
    app_support = QStandardPaths.writableLocation(QStandardPaths.StandardLocation.AppDataLocation)
    if not os.path.exists(app_support):
        os.makedirs(app_support, exist_ok=True)
    return os.path.join(app_support, "config.json")

CONFIG_PATH = get_config_path()

def load_config():
    default = {"shortcut": "<cmd>+."}
    if not os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(default, f, ensure_ascii=False, indent=2)
        return default
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def save_config(config):
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

class TranscribeThread(QThread):
    finished = pyqtSignal(str)

    def __init__(self, engine, audio_path):
        super().__init__()
        self.engine = engine
        self.audio_path = audio_path

    def run(self):
        text = self.engine.transcribe(self.audio_path)
        self.finished.emit(text)

class HotkeyListener(QObject):
    hotkey_triggered = pyqtSignal()

    def __init__(self, shortcut):
        super().__init__()
        self.shortcut = shortcut
        self.last_trigger_time = 0  # timestamp of last trigger
        self._create_listener()

    def _create_listener(self):
        # Stop existing listener if any
        if hasattr(self, "listener") and self.listener:
            try:
                self.listener.stop()
            except Exception:
                pass
        self.listener = GlobalHotKeys({
            self.shortcut: self.on_triggered
        })

    def start(self):
        self.listener.start()

    def update_shortcut(self, new_shortcut):
        self.shortcut = new_shortcut
        self._create_listener()
        self.start()

    def on_triggered(self):
        import time
        now = time.time()
        # Debounce: ignore triggers within 0.5 seconds
        if now - self.last_trigger_time < 0.5:
            return
        self.last_trigger_time = now
        self.hotkey_triggered.emit()

class AquaVoiceTray(QSystemTrayIcon):
    def __init__(self, app):
        super().__init__()
        self.app = app
        self.recorder = AudioRecorder()
        self.engine = TranscriptionEngine()
        self.keyboard = Controller()
        
        self.is_recording = False
        
        # Load shortcut from config
        cfg = load_config()
        shortcut = cfg.get("shortcut", "<cmd>+.")
        # Hotkey setup
        self.hotkey = HotkeyListener(shortcut)
        self.hotkey.hotkey_triggered.connect(self.toggle_recording)
        self.hotkey.start()
        
        self.init_ui()

    def create_icon(self, color_name, text=""):
        pixmap = QPixmap(64, 64)
        pixmap.fill(Qt.GlobalColor.transparent)
        
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        color = QColor(color_name)
        painter.setBrush(color)
        painter.setPen(Qt.PenStyle.NoPen)
        painter.drawEllipse(4, 4, 56, 56)
        
        if text:
            font = painter.font()
            font.setPointSize(32)
            painter.setFont(font)
            painter.setPen(Qt.GlobalColor.white)
            painter.drawText(pixmap.rect(), Qt.AlignmentFlag.AlignCenter, text)
        
        painter.end()
        return QIcon(pixmap)

    def init_ui(self):
        self.icon_normal = self.create_icon("#007AFF", "🎤")
        self.icon_recording = self.create_icon("#FF3B30", "🔴")
        self.icon_processing = self.create_icon("#8E8E93", "⌛")
        
        self.setIcon(self.icon_normal)
        self.setToolTip("Local Aqua Voice (Cmd + .)")
        
        self.menu = QMenu()
        self.status_action = self.menu.addAction("Ready / 準備完了")
        self.status_action.setEnabled(False)
        self.menu.addSeparator()
        
        # Shortcut configuration action
        config_action = self.menu.addAction("Configure Shortcut / ショートカット設定")
        config_action.triggered.connect(self.configure_shortcut)
        self.menu.addSeparator()
        
        self.shortcut_label = self.menu.addAction("Hotkey: Cmd + .")
        self.shortcut_label.setEnabled(False)
        self.menu.addSeparator()
        
        quit_action = self.menu.addAction("Quit / 終了")
        quit_action.triggered.connect(self.app.quit)
        
        self.setContextMenu(self.menu)
        self.activated.connect(self.on_activated)
        self.show()

    def configure_shortcut(self):
        # Prompt user for new shortcut
        current = load_config().get("shortcut", "<cmd>+.")
        text, ok = QInputDialog.getText(None, "Configure Shortcut", "Enter new shortcut (e.g., <cmd>+.)", text=current,)
        if ok and text:
            # Basic validation: must start with '<' and contain '+'
            if not (text.startswith("<") and "+" in text):
                QMessageBox.warning(None, "Invalid Shortcut", "Shortcut format is invalid. Use format like <cmd>+.")
                return
            config = {"shortcut": text}
            save_config(config)
            # Update hotkey listener
            self.hotkey.update_shortcut(text)
            self.shortcut_label.setText(f"Hotkey: {text}")
            QMessageBox.information(None, "Shortcut Updated", f"Hotkey changed to {text}")

    def on_activated(self, reason):
        if reason == QSystemTrayIcon.ActivationReason.Trigger:
            self.toggle_recording()

    def toggle_recording(self):
        if self.is_recording:
            self.stop_recording()
        else:
            self.start_recording()

    def start_recording(self):
        if self.is_recording: return
        self.is_recording = True
        self.setIcon(self.icon_recording)
        self.status_action.setText("Recording... / 録音中...")
        print("Recording started via trigger")
        self.recorder.start_recording()

    def stop_recording(self):
        if not self.is_recording: return
        self.is_recording = False
        self.setIcon(self.icon_processing)
        self.status_action.setText("Processing... / 変換中...")
        print("Recording stopped via trigger")
        
        audio_path = self.recorder.stop_recording()
        if audio_path:
            self.thread = TranscribeThread(self.engine, audio_path)
            self.thread.finished.connect(self.on_transcription_finished)
            self.thread.start()
        else:
            self.reset_icon()

    def on_transcription_finished(self, text):
        print(f"Transcribed: {text}")
        if text:
            self.keyboard.type(text)
        self.reset_icon()

    def reset_icon(self):
        self.setIcon(self.icon_normal)
        self.status_action.setText("Ready / 準備完了")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setQuitOnLastWindowClosed(False)
    
    tray = AquaVoiceTray(app)
    
    sys.exit(app.exec())
