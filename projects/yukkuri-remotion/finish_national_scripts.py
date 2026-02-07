import json

def finish_scripts():
    path = "projects/yukkuri-remotion/all_prefectures_v2.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Kyushu & Okinawa Updates
    data["kyushu"]["fukuoka"] = [
        {"speaker": "metan", "text": "ずんだもん、福岡県はかつて『世界の玄関口』だったのよ。"},
        {"speaker": "zundamon", "text": "ラーメンと明太子のイメージなのだ！めたん先生、教えて！"},
        {"speaker": "metan", "text": "古代には『大宰府』が置かれ、外交と防衛の超重要拠点だったの。"},
        {"speaker": "zundamon", "text": "日本を守る最前線だったんだね！だから今でも活気があるのだ！"},
        {"speaker": "metan", "text": "さらに中世の博多は、自立した巨大な貿易都市。商人のパワーが凄まじいわ。"},
        {"speaker": "zundamon", "text": "歴史ある商売の街！屋台の美味しさも、その伝統の味なのだ！"}
    ]
    data["kyushu"]["saga"] = [
        {"speaker": "metan", "text": "佐賀県は、幕末に『世界レベルの超ハイテク技術』を持っていたのよ。"},
        {"speaker": "zundamon", "text": "のどかなイメージなのだ！めたん先生、嘘じゃないよね？"},
        {"speaker": "metan", "text": "本当よ。日本初の反射炉を築き、最新鋭の大砲や蒸気船を自前で作ったの。"},
        {"speaker": "zundamon", "text": "ええっ！？当時の最先端技術が佐賀に集まっていたんだね！"},
        {"speaker": "metan", "text": "さらに有田焼は世界中に輸出され、ヨーロッパの王侯貴族を虜にしたわ。"},
        {"speaker": "zundamon", "text": "美しさと技術の国！佐賀、ポテンシャルが凄すぎるのだ！"}
    ]
    data["kyushu"]["nagasaki"] = [
        {"speaker": "metan", "text": "長崎県は、鎖国時代でも『世界と唯一繋がっていた』希望の窓ね。"},
        {"speaker": "zundamon", "text": "出島なのだ！めたん先生、どんなものが日本に入ってきたんだ？"},
        {"speaker": "metan", "text": "砂糖、コーヒー、医学、天文学。日本の近代化の種はここから広まったの。"},
        {"speaker": "zundamon", "text": "カステラも長崎からだね！美味しいものと一緒に知識も入ってきたんだ！"},
        {"speaker": "metan", "text": "異国情緒あふれる坂の街。平和への強い願いが込められた祈りの街でもあるわ。"},
        {"speaker": "zundamon", "text": "世界と対話し続ける街！長崎は、日本の誇りなのだ！"}
    ]
    data["kyushu"]["kumamoto"] = [
        {"speaker": "metan", "text": "熊本県は、難攻不落の巨大要塞『熊本城』がある武の国よ。"},
        {"speaker": "zundamon", "text": "加藤清正公が建てたんだよね！めたん先生、凄さを教えて！"},
        {"speaker": "metan", "text": "最新の築城術が詰まった石垣『武者返し』。西南戦争でもその堅牢さを証明したわ。"},
        {"speaker": "zundamon", "text": "明治時代になっても落ちなかったなんて、最強すぎるのだ！"},
        {"speaker": "metan", "text": "阿蘇の広大なカルデラと、豊かな湧水。火の国でもあり、水の国でもあるの。"},
        {"speaker": "zundamon", "text": "大自然のエネルギーと武士の魂！熊本、熱すぎるのだ！"}
    ]
    data["kyushu"]["oita"] = [
        {"speaker": "metan", "text": "大分県は、実は戦国時代に『キリシタン大名』が国際都市を築いていたの。"},
        {"speaker": "zundamon", "text": "おんせん県なのだ！めたん先生、キリスト教と関係があるのか？"},
        {"speaker": "metan", "text": "大友宗麟公が、西洋の音楽や医学をいち早く取り入れた先進的な場所だったのよ。"},
        {"speaker": "zundamon", "text": "へぇー！温泉だけじゃなくて、最先端の海外文化が響いていたんだね！"},
        {"speaker": "metan", "text": "源泉数と湧出量は日本一。まさに地球の熱気を感じる癒やしの聖地ね。"},
        {"speaker": "zundamon", "text": "歴史に浸って、温泉に浸かる！大分は極楽なのだ！"}
    ]
    data["kyushu"]["miyazaki"] = [
        {"speaker": "metan", "text": "宮崎県は、日本神話の神々が降り立った『神話の故郷』よ。"},
        {"speaker": "zundamon", "text": "マンゴーとチキン南蛮のイメージなのだ！めたん先生、神様の秘密を教えて！"},
        {"speaker": "metan", "text": "天岩戸伝説や、初代天皇ゆかりの地。至る所に神話の舞台が残っているの。"},
        {"speaker": "zundamon", "text": "日本の始まりの物語が、宮崎には詰まっているんだね！"},
        {"speaker": "metan", "text": "南国の明るい太陽と、美しい海岸線。まさに神様に愛された楽園ね。"},
        {"speaker": "zundamon", "text": "神様のパワーをチャージできるのだ！宮崎、最高にパワフルなのだ！"}
    ]
    data["kyushu"]["kagoshima"] = [
        {"speaker": "metan", "text": "鹿児島県は、常に『世界を見据えて動いてきた』勇者の国よ。"},
        {"speaker": "zundamon", "text": "桜島と西郷隆盛公なのだ！めたん先生、なんで勇者なんだ？"},
        {"speaker": "metan", "text": "いち早く海外に留学生を送り、日本の夜明けをリードした薩摩の情熱ね。"},
        {"speaker": "zundamon", "text": "不可能を可能にする力が、鹿児島には流れているんだね！"},
        {"speaker": "metan", "text": "今も噴煙を上げる桜島の迫力と、黒豚や焼酎の美味しさ。生命力にあふれているわ。"},
        {"speaker": "zundamon", "text": "燃える火山の魂！鹿児島は、日本のエンジンなのだ！"}
    ]
    data["kyushu"]["okinawa"] = [
        {"speaker": "metan", "text": "沖縄県は、かつて『琉球王国』という独自の平和外交を貫いた国なの。"},
        {"speaker": "zundamon", "text": "青い海と守礼門なのだ！めたん先生、普通の県とは違うのか？"},
        {"speaker": "metan", "text": "万国津梁。アジアの架け橋として、武器を持たずに貿易で栄えた美しい歴史よ。"},
        {"speaker": "zundamon", "text": "平和の心で世界と繋がっていたんだね！カッコいいのだ！"},
        {"speaker": "metan", "text": "独特の音楽、空手、そして温かい『ゆいまーる』の精神。宝物のような島ね。"},
        {"speaker": "zundamon", "text": "世界を繋ぐ平和の島！沖縄の風は、とっても優しいのだ！"}
    ]
    data["hokkaido"]["hokkaido"] = [
        {"speaker": "metan", "text": "北海道は、実は『奇跡の開拓史』によって作られたフロンティアなの。"},
        {"speaker": "zundamon", "text": "デカい！美味い！のイメージなのだ！めたん先生、奇跡って何だ？"},
        {"speaker": "metan", "text": "原生林を切り拓き、厳しい冬を乗り越えて、わずか150年で今の姿になったのよ。"},
        {"speaker": "zundamon", "text": "当時の人たちの努力、凄まじすぎるのだ！感謝してお寿司を食べるのだ！"},
        {"speaker": "metan", "text": "アイヌ文化の知恵と、壮大な自然。日本の食糧庫であり、未来の可能性ね。"},
        {"speaker": "zundamon", "text": "どこまでも続く道！北海道は、夢とロマンの大地なのだ！"}
    ]

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("All national scripts (Kyushu, Hokkaido) finished!")

finish_scripts()
