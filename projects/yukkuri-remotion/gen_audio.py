import os
import subprocess
import json

# Script data
dialogue = [
    {"speaker": "zundamon", "text": "マスター！今日は東京都の成り立ちについて解説するのだ！"},
    {"speaker": "metan", "text": "あら、面白そうね。お願いするわ、ずんだもん。"},
    {"speaker": "zundamon", "text": "まずは江戸時代なのだ！1603年に徳川家康が江戸幕府を開いたのが全ての始まりなのだ！"},
    {"speaker": "metan", "text": "当時はただの小さな漁村だったのよね。そこから世界有数の大都市へ発展したのね。"},
    {"speaker": "zundamon", "text": "そして1868年、明治維新なのだ！江戸は『東京』に改称されて、京都から天皇陛下がお移りになったのだ！"},
    {"speaker": "metan", "text": "東の京都、という意味で東京。名実ともに日本の首都になった瞬間ね。"},
    {"speaker": "zundamon", "text": "さらに1943年、戦時中に『東京府』と『東京市』が合体して、今の『東京都』になったのだ！"},
    {"speaker": "metan", "text": "都制施行ね。より効率的な統治のために今の形になったのよ。"},
    {"speaker": "zundamon", "text": "というわけで、東京は400年以上の歴史があるのだ！すごすぎるのだ！"},
    {"speaker": "metan", "text": "江戸から東京へ。歴史の重みを感じるわね。"},
    {"speaker": "zundamon", "text": "気に入ったらチャンネル登録と高評価よろしくなのだー！"},
    {"speaker": "metan", "text": "また会いましょう。"}
]

public_audio_dir = "projects/yukkuri-remotion/video/public/audio"
os.makedirs(public_audio_dir, exist_ok=True)

metadata = []

for i, line in enumerate(dialogue):
    # Use the tts command via subprocess (hypothetically, if I could call it)
    # Actually, I should use the tts tool provided to the agent.
    # Since I can't call tools from a script easily, I'll do it turn by turn or 
    # just create a JSON that the agent will use to call tts.
    pass
