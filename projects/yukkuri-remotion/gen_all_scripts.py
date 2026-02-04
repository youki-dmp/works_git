import json
import os

all_data = {}

# Kanto (Already done)
# ... will merge later

# Tohoku
all_data["tohoku"] = {
    "aomori": [
        {"speaker": "zundamon", "text": "マスター！青森県の成り立ちを教えるのだ！"},
        {"speaker": "metan", "text": "本州最北端。ねぶた祭りの熱気が伝わってくるわね。"},
        {"speaker": "zundamon", "text": "縄文時代の三内丸山遺跡など、古くから人が住んでいたのだ！"},
        {"speaker": "metan", "text": "弘前城の桜や、八甲田山の自然、そしてリンゴの生産量は日本一よ。"},
        {"speaker": "zundamon", "text": "冬は雪深いけど、その分、海の幸も最高に美味しいのだ！"},
        {"speaker": "metan", "text": "力強い文化と自然が息づく、北の要所になったわね。"}
    ],
    "iwate": [
        {"speaker": "zundamon", "text": "岩手県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "宮沢賢治のイーハトーブ。広大な面積を持つ県ね。"},
        {"speaker": "zundamon", "text": "奥州藤原氏が築いた平泉の黄金文化は世界遺産なのだ！"},
        {"speaker": "metan", "text": "三陸海岸の絶景や、盛岡冷麺、わんこそばも有名よ。"},
        {"speaker": "zundamon", "text": "南部鉄器など、伝統工芸も大切に受け継がれているのだ！"},
        {"speaker": "metan", "text": "素朴で温かい、歴史ロマンあふれる県になったわね。"}
    ],
    "miyagi": [
        {"speaker": "zundamon", "text": "宮城県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "杜の都・仙台。独眼竜・伊達政宗公が築いた地ね。"},
        {"speaker": "zundamon", "text": "政宗公が城下町を整えてから、東北の政治・経済の中心になったのだ！"},
        {"speaker": "metan", "text": "日本三景の松島や、美味しい牛タン、ずんだ餅も最高よ。"},
        {"speaker": "zundamon", "text": "七夕祭りなどの伝統行事も、毎年大盛り上がりなのだ！"},
        {"speaker": "metan", "text": "洗練された都市と豊かな自然が融合した、東北のリーダーね。"}
    ],
    "akita": [
        {"speaker": "zundamon", "text": "秋田県の成り立ちを解説するのだ！"},
        {"speaker": "metan", "text": "秋田美人や、なまはげ。神秘的な魅力があるわね。"},
        {"speaker": "zundamon", "text": "かつては佐竹氏が治める秋田藩として発展したのだ！"},
        {"speaker": "metan", "text": "日本一深い田沢湖や、きりたんぽ鍋、美味しいお米も有名よ。"},
        {"speaker": "zundamon", "text": "大曲の花火大会は、世界中から人が集まるのだ！"},
        {"speaker": "metan", "text": "独特の文化と美味しい食に恵まれた、風情ある県になったわね。"}
    ],
    "yamagata": [
        {"speaker": "zundamon", "text": "山形県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "さくらんぼと、蔵王の樹氷。四季がはっきりしているわ。"},
        {"speaker": "zundamon", "text": "最上義光公が山形城を拠点に、今の街の基礎を作ったのだ！"},
        {"speaker": "metan", "text": "山寺（立石寺）の静寂や、米沢牛、芋煮会も大人気よ。"},
        {"speaker": "zundamon", "text": "将棋の駒の生産も日本一で、勝負師の街でもあるのだ！"},
        {"speaker": "metan", "text": "誠実で温かい、豊かな恵みに満ちた県になったわね。"}
    ],
    "fukushima": [
        {"speaker": "zundamon", "text": "最後は福島県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "東北の玄関口。会津、中通り、浜通りの3つの顔があるわね。"},
        {"speaker": "zundamon", "text": "会津の鶴ヶ城など、武士の精神が今も息づいているのだ！"},
        {"speaker": "metan", "text": "猪苗代湖の美しさや、喜多方ラーメン、桃の美味しさも絶品よ。"},
        {"speaker": "zundamon", "text": "今は復興に向けて、みんなで頑張っている最中なのだ！"},
        {"speaker": "metan", "text": "困難を乗り越える強さを持つ、希望あふれる県になったわね。"}
    ]
}

# Chubu
all_data["chubu"] = {
    "niigata": [
        {"speaker": "zundamon", "text": "新潟県の成り立ちを教えるのだ！"},
        {"speaker": "metan", "text": "米どころ、酒どころ。雪国情緒あふれる場所ね。"},
        {"speaker": "zundamon", "text": "上杉謙信公の拠点として、戦国時代から重要な地だったのだ！"},
        {"speaker": "metan", "text": "佐渡島の金山や、長岡の花火、世界有数の豪雪地帯も有名よ。"},
        {"speaker": "zundamon", "text": "今はコシヒカリのブランド力で、日本を支えているのだ！"},
        {"speaker": "metan", "text": "豊かな大地と、粘り強い人々が作る素晴らしい県になったわ。"}
    ],
    "toyama": [
        {"speaker": "zundamon", "text": "富山県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "立山黒部アルペンルート。雪の壁は圧巻よね。"},
        {"speaker": "zundamon", "text": "富山湾の神秘、ホタルイカや寒ブリも有名なのだ！"},
        {"speaker": "metan", "text": "「越中の薬売り」など、独自の産業が古くから発達してきたわ。"},
        {"speaker": "zundamon", "text": "黒部ダムの迫力も、一生に一度は見たいスポットなのだ！"},
        {"speaker": "metan", "text": "自然の厳しさと、高い技術力が共存する県になったわね。"}
    ],
    "ishikawa": [
        {"speaker": "zundamon", "text": "石川県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "加賀百万石、金沢。華やかな伝統文化が息づくわね。"},
        {"speaker": "zundamon", "text": "前田利家公が金沢城に入ってから、加賀の文化が花開いたのだ！"},
        {"speaker": "metan", "text": "兼六園の美しさや、九谷焼、輪島塗などの工芸も世界的人気よ。"},
        {"speaker": "zundamon", "text": "近江町市場の新鮮な海鮮丼も最高なのだ！"},
        {"speaker": "metan", "text": "伝統美と現代が調和した、非常に気品ある県になったわね。"}
    ],
    "fukui": [
        {"speaker": "zundamon", "text": "福井県の成り立ちを解説するのだ！"},
        {"speaker": "metan", "text": "恐竜王国、福井。化石の発見数が日本一なのよね。"},
        {"speaker": "zundamon", "text": "曹洞宗の大本山・永平寺や、東尋坊の絶壁もすごいのだ！"},
        {"speaker": "metan", "text": "眼鏡フレームの生産も世界シェアを誇っているわ。"},
        {"speaker": "zundamon", "text": "越前ガニの美味しさは、まさに冬の王者なのだ！"},
        {"speaker": "metan", "text": "確かな技術と、神秘的な歴史が融合した県になったわね。"}
    ],
    "yamanashi": [
        {"speaker": "zundamon", "text": "山梨県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "甲斐の虎・武田信玄公の故郷。富士山の麓ね。"},
        {"speaker": "zundamon", "text": "信玄公が築いた統治の精神が、今も街の随所に残っているのだ！"},
        {"speaker": "metan", "text": "富士五湖の絶景や、美味しいワイン、ほうとうも有名よ。"},
        {"speaker": "zundamon", "text": "リニア中央新幹線の試験線もあり、未来を感じるのだ！"},
        {"speaker": "metan", "text": "歴史を誇りに、富士山と共に歩む素晴らしい県になったわね。"}
    ],
    "nagano": [
        {"speaker": "zundamon", "text": "長野県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "日本の屋根、信州。1998年冬季五輪の舞台ね。"},
        {"speaker": "zundamon", "text": "善光寺への参拝客で古くから賑わい、宿場町も多かったのだ！"},
        {"speaker": "metan", "text": "松本城の漆黒の美しさや、上高地の清流、信州そばも絶品よ。"},
        {"speaker": "zundamon", "text": "精密機械産業も盛んで、山々に囲まれた技術立県なのだ！"},
        {"speaker": "metan", "text": "豊かな自然と、高い知性が融合した健康長寿の県ね。"}
    ],
    "gifu": [
        {"speaker": "zundamon", "text": "岐阜県の成り立ちを教えるのだ！"},
        {"speaker": "metan", "text": "「岐阜」という名は織田信長公が付けたと言われているわね。"},
        {"speaker": "zundamon", "text": "天下分け目の関ヶ原や、世界遺産・白川郷があるのだ！"},
        {"speaker": "metan", "text": "飛騨高山の古い町並みや、鵜飼いで有名な長良川も美しいわ。"},
        {"speaker": "zundamon", "text": "美濃和紙や刃物など、伝統あるものづくりも健在なのだ！"},
        {"speaker": "metan", "text": "日本の中心に位置する、歴史と匠の技の県になったわね。"}
    ],
    "shizuoka": [
        {"speaker": "zundamon", "text": "静岡県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "富士山とお茶。そして徳川家康公が晩年を過ごした地ね。"},
        {"speaker": "zundamon", "text": "駿府城を中心に、江戸時代も政治の重要拠点だったのだ！"},
        {"speaker": "metan", "text": "伊豆半島の温泉や、浜名湖のウナギ、プラモデル生産も日本一よ。"},
        {"speaker": "zundamon", "text": "さわやかのハンバーグも、今や全国区の人気なのだ！"},
        {"speaker": "metan", "text": "温和な気候と、多彩な産業が魅力の活力ある県になったわね。"}
    ],
    "aichi": [
        {"speaker": "zundamon", "text": "最後は愛知県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "信長・秀吉・家康。三英傑を輩出した武将の国ね。"},
        {"speaker": "zundamon", "text": "名古屋城の金のシャチホコが、かつての繁栄を物語っているのだ！"},
        {"speaker": "metan", "text": "トヨタ自動車を中心とした、世界的な産業都市でもあるわね。"},
        {"speaker": "zundamon", "text": "味噌カツや手羽先など、独自の食文化「名古屋メシ」も最高なのだ！"},
        {"speaker": "metan", "text": "伝統と最先端技術が融合した、日本の心臓部の一つになったわ。"}
    ]
}

# Chugoku
all_data["chugoku"] = {
    "tottori": [
        {"speaker": "zundamon", "text": "鳥取県の成り立ちを教えるのだ！"},
        {"speaker": "metan", "text": "鳥取砂丘。風が描く紋様が幻想的よね。"},
        {"speaker": "zundamon", "text": "江戸時代は池田氏が治める鳥取藩として栄えたのだ！"},
        {"speaker": "metan", "text": "「ゲゲゲの鬼太郎」の水木しげるロードや、大山の自然も魅力よ。"},
        {"speaker": "zundamon", "text": "二十世紀梨や松葉ガニ、美味しいものがたくさんあるのだ！"},
        {"speaker": "metan", "text": "静かだけど、力強い個性を放つ素敵な県になったわね。"}
    ],
    "shimane": [
        {"speaker": "zundamon", "text": "島根県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "出雲大社。神々が集まる伝説の地ね。"},
        {"speaker": "zundamon", "text": "古代から「国譲り」の神話が残り、歴史の深さは格別なのだ！"},
        {"speaker": "metan", "text": "世界遺産の石見銀山や、松江城の美しい佇まいも有名よ。"},
        {"speaker": "zundamon", "text": "美肌の湯が多い温泉地としても、女性に大人気なのだ！"},
        {"speaker": "metan", "text": "神秘的な空気と、歴史ロマンが漂う神聖な県ね。"}
    ],
    "okayama": [
        {"speaker": "zundamon", "text": "岡山県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "桃太郎伝説と、晴れの国。瀬戸内海の玄関口ね。"},
        {"speaker": "zundamon", "text": "日本三名園の後楽園や、倉敷美観地区の白壁が美しいのだ！"},
        {"speaker": "metan", "text": "デニムの生産でも有名で、高品質なものづくりが盛んよ。"},
        {"speaker": "zundamon", "text": "マスカットや桃など、フルーツの美味しさは格別なのだ！"},
        {"speaker": "metan", "text": "穏やかな気候と、豊かな文化が育んだ住みやすい県ね。"}
    ],
    "hiroshima": [
        {"speaker": "zundamon", "text": "広島県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "平和の祈りと、二つの世界遺産がある地ね。"},
        {"speaker": "zundamon", "text": "宮島の厳島神社や、原爆ドーム。歴史の重みを感じるのだ！"},
        {"speaker": "metan", "text": "広島風お好み焼きや、牡蠣、レモンなど食も充実しているわ。"},
        {"speaker": "zundamon", "text": "マツダの車づくりなど、製造業の力もものすごいのなのだ！"},
        {"speaker": "metan", "text": "力強く復興し、平和へのメッセージを発信する誇り高き県ね。"}
    ],
    "yamaguchi": [
        {"speaker": "zundamon", "text": "山口県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "明治維新の志士たちが駆け抜けた、長州の地ね。"},
        {"speaker": "zundamon", "text": "松下村塾から、新しい日本を作るリーダーがたくさん出たのだ！"},
        {"speaker": "metan", "text": "錦帯橋の美しさや、秋芳洞の鍾乳洞、美味しいフグも有名よ。"},
        {"speaker": "zundamon", "text": "角島大橋の絶景は、SNSでも大人気なのだ！"},
        {"speaker": "metan", "text": "歴史を動かした情熱と、美しい自然が調和する県ね。"}
    ]
}

# Shikoku
all_data["shikoku"] = {
    "tokushima": [
        {"speaker": "zundamon", "text": "徳島県の成り立ちを教えるのだ！"},
        {"speaker": "metan", "text": "阿波踊りのリズム。400年続く夏の風物詩ね。"},
        {"speaker": "zundamon", "text": "鳴門の渦潮の迫力や、大塚国際美術館もすごいのだ！"},
        {"speaker": "metan", "text": "すだちや藍染め、独自の文化が大切にされているわ。"},
        {"speaker": "zundamon", "text": "神山町のサテライトオフィスなど、新しい働き方も注目なのだ！"},
        {"speaker": "metan", "text": "伝統を愛し、新しい風を取り入れる活気ある県になったわね。"}
    ],
    "kagawa": [
        {"speaker": "zundamon", "text": "香川県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "「うどん県」。日本で一番小さな面積の県ね。"},
        {"speaker": "zundamon", "text": "弘法大師空海の生誕地で、金刀比羅宮への参拝も盛んなのだ！"},
        {"speaker": "metan", "text": "栗林公園の美しさや、直島などの現代アートも世界的に有名よ。"},
        {"speaker": "zundamon", "text": "讃岐うどんのコシの強さは、一度食べたら忘れられないのだ！"},
        {"speaker": "metan", "text": "小さいけれど、魅力がぎゅっと詰まったアートと食の県ね。"}
    ],
    "ehime": [
        {"speaker": "zundamon", "text": "愛媛県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "日本最古の温泉・道後温泉。そしてみかんの王国ね。"},
        {"speaker": "zundamon", "text": "松山城下町として栄え、正岡子規などの文豪も愛したのだ！"},
        {"speaker": "metan", "text": "しまなみ海道のサイクリングや、今治タオルの品質も素晴らしいわ。"},
        {"speaker": "zundamon", "text": "坊っちゃん列車が走る街並みは、とてもレトロで素敵なのだ！"},
        {"speaker": "metan", "text": "穏やかな瀬戸内の気候のような、温かい心を持つ県ね。"}
    ],
    "kochi": [
        {"speaker": "zundamon", "text": "高知県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "幕末の英雄・坂本龍馬公。そして桂浜の太平洋ね。"},
        {"speaker": "zundamon", "text": "山内一豊公が築いた高知城は、現存天守の一つなのだ！"},
        {"speaker": "metan", "text": "カツオのタタキや、よさこい祭りの情熱も最高よ。"},
        {"speaker": "zundamon", "text": "四万十川の清流など、手つかずの自然が残っているのだ！"},
        {"speaker": "metan", "text": "自由闊達な土佐の気風と、豊かな自然が魅力の県ね。"}
    ]
}

# Kyushu
all_data["kyushu"] = {
    "fukuoka": [
        {"speaker": "zundamon", "text": "福岡県の成り立ちを教えるのだ！"},
        {"speaker": "metan", "text": "アジアへの玄関口。屋台文化や活気ある都会ね。"},
        {"speaker": "zundamon", "text": "古代から大宰府が置かれ、外交の拠点として栄えたのだ！"},
        {"speaker": "metan", "text": "博多ラーメン、明太子、もつ鍋。美味しいものが尽きないわね。"},
        {"speaker": "zundamon", "text": "菅原道真公を祀る太宰府天満宮も、受験生に大人気なのだ！"},
        {"speaker": "metan", "text": "歴史と未来が交差する、九州一の大都市になったわね。"}
    ],
    "saga": [
        {"speaker": "zundamon", "text": "佐賀県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "有田焼や伊万里焼。陶磁器の歴史が深いわね。"},
        {"speaker": "zundamon", "text": "幕末には佐賀藩が最新鋭の技術を持ち、近代化をリードしたのだ！"},
        {"speaker": "metan", "text": "吉野ヶ里遺跡の弥生ロマンや、佐賀牛の美味しさも絶品よ。"},
        {"speaker": "zundamon", "text": "バルーンフェスタの空に舞う景色は、圧巻なのだ！"},
        {"speaker": "metan", "text": "伝統の技と、先取の精神が息づく素晴らしい県ね。"}
    ],
    "nagasaki": [
        {"speaker": "zundamon", "text": "長崎県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "鎖国時代も唯一開かれていた、異国情緒あふれる港町ね。"},
        {"speaker": "zundamon", "text": "グラバー園や軍艦島など、歴史の転換点がたくさんあるのだ！"},
        {"speaker": "metan", "text": "カステラやちゃんぽん。和華蘭文化が混ざり合った食も魅力よ。"},
        {"speaker": "zundamon", "text": "ハウステンボスの美しさや、世界新三大夜景もすごいのだ！"},
        {"speaker": "metan", "text": "平和の祈りと、多様な文化が共存する誇り高き県ね。"}
    ],
    "kumamoto": [
        {"speaker": "zundamon", "text": "熊本県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "火の国。阿蘇の大パノラマと、難攻不落の熊本城ね。"},
        {"speaker": "zundamon", "text": "加藤清正公が築いた熊本城の石垣は、まさに芸術なのだ！"},
        {"speaker": "metan", "text": "馬刺しや辛子蓮根、くまモンも世界中で大人気よ。"},
        {"speaker": "zundamon", "text": "半導体産業の進出で、今また大きく盛り上がっているのだ！"},
        {"speaker": "metan", "text": "豊かな水と火の山のパワーに満ちた、活力ある県ね。"}
    ],
    "oita": [
        {"speaker": "zundamon", "text": "大分県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "「おんせん県」大分。別府や湯布院は日本一の湧出量ね。"},
        {"speaker": "zundamon", "text": "戦国時代はキリシタン大名・大友宗麟公が統治し、南蛮文化が入ったのだ！"},
        {"speaker": "metan", "text": "とり天や関サバ、関アジなど、美味しいものが目白押しよ。"},
        {"speaker": "zundamon", "text": "九重夢大吊橋からの眺めも、最高に気持ちいいのだ！"},
        {"speaker": "metan", "text": "湯煙とともに、温かいおもてなしの心が溢れる県ね。"}
    ],
    "miyazaki": [
        {"speaker": "zundamon", "text": "宮崎県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "南国リゾート。日本神話の舞台でもある、天孫降臨の地ね。"},
        {"speaker": "zundamon", "text": "青島や高千穂峡など、神々しいパワースポットがいっぱいなのだ！"},
        {"speaker": "metan", "text": "チキン南蛮、マンゴー、宮崎牛。太陽の恵みを感じる食ね。"},
        {"speaker": "zundamon", "text": "プロ野球のキャンプ地としても、毎年大賑わいなのだ！"},
        {"speaker": "metan", "text": "明るい太陽と、神話のロマンが漂う癒やしの県ね。"}
    ],
    "kagoshima": [
        {"speaker": "zundamon", "text": "鹿児島県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "薩摩の地。桜島の雄大な姿がシンボルね。"},
        {"speaker": "zundamon", "text": "西郷隆盛公ら多くの偉人を輩出し、日本を変えた拠点なのだ！"},
        {"speaker": "metan", "text": "黒豚、焼酎、白熊。個性豊かな食文化も楽しいわ。"},
        {"speaker": "zundamon", "text": "屋久島の縄文杉や、種子島の宇宙センターも夢があるのだ！"},
        {"speaker": "metan", "text": "熱い情熱と、雄大な自然が共存する情熱の県ね。"}
    ],
    "okinawa": [
        {"speaker": "zundamon", "text": "最後は沖縄県の成り立ちなのだ！"},
        {"speaker": "metan", "text": "琉球王国。独自の歴史と、青い海が広がる美ら島ね。"},
        {"speaker": "zundamon", "text": "かつては中継貿易で栄え、アジア諸国と深く繋がっていたのだ！"},
        {"speaker": "metan", "text": "首里城の風格や、沖縄そば、ゴーヤーチャンプルーも絶品よ。"},
        {"speaker": "zundamon", "text": "伝統の三線の調べが、島全体を優しく包んでいるのだ！"},
        {"speaker": "metan", "text": "ゆいまーるの心と、美しい自然が輝く楽園ね。"}
    ]
}

# Hokkaido
all_data["hokkaido"] = {
    "hokkaido": [
        {"speaker": "zundamon", "text": "北海道の成り立ちを解説するのだ！"},
        {"speaker": "metan", "text": "日本の食糧基地。広大な大地と大自然の宝庫ね。"},
        {"speaker": "zundamon", "text": "アイヌ文化が大切にされ、明治以降の開拓使によって発展したのだ！"},
        {"speaker": "metan", "text": "五稜郭の歴史や、富良野のラベンダー、世界遺産・知床も有名よ。"},
        {"speaker": "zundamon", "text": "ジンギスカンや海鮮丼、ラーメン。美味しいものが多すぎるのだ！"},
        {"speaker": "metan", "text": "開拓の精神と、四季折々の絶景が迎えてくれる魅力あふれる大地ね。"}
    ]
}

with open("projects/yukkuri-remotion/all_prefectures.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print("All prefecture scripts generated!")
