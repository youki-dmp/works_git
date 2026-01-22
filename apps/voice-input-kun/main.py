import sys
import os
import json
from PyQt6.QtWidgets import QApplication, QSystemTrayIcon, QMenu, QInputDialog, QMessageBox, QSplashScreen, QLabel, QVBoxLayout, QWidget
from PyQt6.QtGui import QIcon, QPixmap, QPainter, QColor, QFont
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

# --- One Instance Check ---
import fcntl

def check_single_instance():
    """
    Ensure only one instance is running using a lock file.
    Returns True if this is the only instance, False otherwise.
    """
    lock_file_path = os.path.join(os.path.dirname(CONFIG_PATH), "voice_input_kun.lock")
    try:
        # We need to keep the file open for the lock to persist
        global lock_file_handle
        lock_file_handle = open(lock_file_path, 'w')
        # Try to acquire an exclusive lock (non-blocking)
        fcntl.lockf(lock_file_handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return True
    except IOError:
        # Lock acquisition failed, meaning another instance is running
        print("Another instance is already running.")
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Icon.Warning)
        msg.setWindowTitle("Voice Input-kun")
        msg.setText("ボイス入力くんは既に起動しています。\nVoice Input-kun is already running.")
        msg.setStandardButtons(QMessageBox.StandardButton.Ok)
        msg.exec()
        return False

# --- Splash Screen ---
def create_splash_screen():
    """
    Create a simple splash screen with app name and loading text.
    """
    pixmap = QPixmap(300, 200)
    pixmap.fill(QColor("#ffffff"))
    
    painter = QPainter(pixmap)
    painter.setRenderHint(QPainter.RenderHint.Antialiasing)
    
    # Draw background border
    painter.setPen(QColor("#007AFF"))
    painter.setBrush(Qt.BrushStyle.NoBrush)
    painter.drawRect(0, 0, 299, 199)
    
    # Draw Icon
    icon_color = QColor("#007AFF")
    painter.setBrush(icon_color)
    painter.setPen(Qt.PenStyle.NoPen)
    painter.drawEllipse(125, 40, 50, 50)
    
    # Draw Mic
    painter.setPen(Qt.GlobalColor.white)
    font = painter.font()
    font.setPointSize(24)
    painter.setFont(font)
    painter.drawText(125, 40, 50, 50, Qt.AlignmentFlag.AlignCenter, "🎤")
    
    # Draw Text
    painter.setPen(QColor("#333333"))
    font.setPointSize(16)
    font.setBold(True)
    painter.setFont(font)
    painter.drawText(0, 110, 300, 30, Qt.AlignmentFlag.AlignCenter, "Voice Input-kun")
    
    font.setPointSize(10)
    font.setBold(False)
    painter.setFont(font)
    painter.setPen(QColor("#666666"))
    painter.drawText(0, 140, 300, 20, Qt.AlignmentFlag.AlignCenter, "AIモデルを読み込み中... / Loading AI Model...")
    
    painter.end()
    
    splash = QSplashScreen(pixmap)
    splash.setWindowFlag(Qt.WindowType.WindowStaysOnTopHint)
    return splash

class TranscribeThread(QThread):
    finished = pyqtSignal(str)
    error = pyqtSignal(str)

    def __init__(self, engine, audio_path):
        super().__init__()
        self.engine = engine
        self.audio_path = audio_path

    def run(self):
        try:
            text = self.engine.transcribe(self.audio_path)
            self.finished.emit(text)
        except Exception as e:
            import traceback
            traceback.print_exc()
            self.error.emit(str(e))

from AppKit import NSEvent, NSKeyDownMask, NSEventModifierFlagCommand, NSEventModifierFlagShift, NSEventModifierFlagControl, NSEventModifierFlagOption

class HotkeyListener(QObject):
    hotkey_triggered = pyqtSignal()

    def __init__(self, shortcut):
        super().__init__()
        self.shortcut = shortcut
        self.monitor_global = None
        self.monitor_local = None
        self.last_trigger_time = 0
        self.target_key = None
        self.target_flags = 0
        self._parse_shortcut(shortcut)
        self.start()

    def _parse_shortcut(self, shortcut):
        # Format: <cmd>+<shift>+k
        parts = shortcut.lower().replace(" ", "").split('+')
        self.target_flags = 0
        self.target_key = None
        
        for part in parts:
            if part in ["<cmd>", "cmd", "command"]:
                self.target_flags |= NSEventModifierFlagCommand
            elif part in ["<shift>", "shift"]:
                self.target_flags |= NSEventModifierFlagShift
            elif part in ["<ctrl>", "ctrl", "control"]:
                self.target_flags |= NSEventModifierFlagControl
            elif part in ["<alt>", "alt", "opt", "option"]:
                self.target_flags |= NSEventModifierFlagOption
            else:
                # Assume last part is the key
                # Remove <> if present for single chars logic (e.g. <a> -> a)
                # But our config uses <cmd>+. which means key is "."
                # Special keys like <space>, <enter> are harder.
                # For now support single char literals.
                self.target_key = part.strip("<>")
    
    def start(self):
        # We need both global (when app not focused) and local (when app focused) monitoring
        # Note: Global monitor requires "Accessibility" permission in System Settings.
        # If not granted, it won't receive key events.
        
        def handler(event):
            # Check modifiers
            flags = event.modifierFlags()
            # Mask out non-relevant flags
            relevant_mask = NSEventModifierFlagCommand | NSEventModifierFlagShift | NSEventModifierFlagControl | NSEventModifierFlagOption
            current_flags = flags & relevant_mask
            
            # Debug logging
            # print(f"Event: flags={flags} matched={current_flags} target={self.target_flags} chars={event.charactersIgnoringModifiers()}")

            if current_flags == self.target_flags:
                # Check key
                char = event.charactersIgnoringModifiers()
                if not char:
                    return
                
                char_lower = char.lower()
                
                # Check exact match
                if char_lower == self.target_key:
                    self.on_triggered()
                    return
                
                # Fallback for Japanese IME (period -> 。)
                if self.target_key == "." and char in ["。", "．"]:
                    self.on_triggered()
                    return

        # Keep references to handlers to prevent GC? PyObjC documentation suggests 
        # handler block should be fine as long as monitor is kept.
        self.handler_ref = handler

        if not self.monitor_global:
            self.monitor_global = NSEvent.addGlobalMonitorForEventsMatchingMask_handler_(
                NSKeyDownMask, handler
            )
        
        if not self.monitor_local:
            # Local monitor returns the event (can modify/block)
            def local_handler(event):
                handler(event)
                return event
            self.monitor_local = NSEvent.addLocalMonitorForEventsMatchingMask_handler_(
                NSKeyDownMask, local_handler
            )

    def update_shortcut(self, new_shortcut):
        self.shortcut = new_shortcut
        self._parse_shortcut(new_shortcut)
        # No need to restart listener, just updated target params

    def on_triggered(self):
        import time
        now = time.time()
        if now - self.last_trigger_time < 0.5:
            return
        self.last_trigger_time = now
        print(f"Hotkey triggered! {self.shortcut}")
        self.hotkey_triggered.emit()

class VoiceInputKunTray(QSystemTrayIcon):
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
        # Hotkey starts automatically in __init__
        
        self.init_ui()

    def create_icon(self, color_name, text=""):
        # ... icon creation ...
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
        self.setToolTip("ボイス入力くん (Cmd + .)")
        
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
            self.thread.error.connect(self.on_transcription_error)
            self.thread.start()
        else:
            self.reset_icon()

    def on_transcription_finished(self, text):
        print(f"Transcribed: {text}")
        if text:
            self.keyboard.type(text)
        self.reset_icon()

    def on_transcription_error(self, error_msg):
        print(f"Transcription Error: {error_msg}")
        self.status_action.setText("Error / エラー")
        # Optional: Show a notification or tray message
        self.showMessage("Transcription Failed", f"Error: {error_msg}", QSystemTrayIcon.MessageIcon.Warning)
        self.reset_icon()

    def reset_icon(self):
        self.setIcon(self.icon_normal)
        self.status_action.setText("Ready / 準備完了")

    


if __name__ == "__main__":
    # check_single_instance() # Check before creating QApplication to be fast?
    # Actually, we need to create QApplication for message box if we want to show UI, 
    # but strictly speaking for a tray app, maybe just exit is fine or print to stderr.
    # However, let's stick to the plan: run check inside main but early.
    
    # CRITICAL: Prevent infinite loop (fork bomb) when frozen
    import multiprocessing
    multiprocessing.freeze_support()
    
    # We need an app instance for QSplashScreen and QMessageBox
    app = QApplication(sys.argv)
    app.setQuitOnLastWindowClosed(False)

    # 1. Check Single Instance
    # We do this after QApplication creation so we can show a message box if needed,
    # observing that checking lock file is fast.
    if not check_single_instance():
        sys.exit(1)

    # 2. Show Splash Screen
    splash = create_splash_screen()
    splash.show()
    app.processEvents()

    # 3. Initialize Tray (Heavy loading happens here: Whisper model etc.)
    tray = VoiceInputKunTray(app)
    
    # 4. Close Splash
    splash.finish(None)
    
    sys.exit(app.exec())
