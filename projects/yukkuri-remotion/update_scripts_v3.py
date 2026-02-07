import json
import os

def update_scripts():
    path = "projects/yukkuri-remotion/all_prefectures_v2.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Kansai Region Updates
    data["kansai"]["kyoto"] = [
        {"speaker": "metan", "text": "ずんだもん、今日は京都府の『裏の歴史』を教えるわよ。準備はいい？"},
        {"speaker": "zundamon", "text": "京都といえば雅なイメージなのだ！裏なんてあるのか？教えて、めたん先生！"},
        {"speaker": "metan", "text": "実は今の京都があるのは、巨大な湿地帯を大改造した『秦氏』という渡来人の功績が大きいの。"},
        {"speaker": "zundamon", "text": "へぇー！平安京より前から、ハイテクな人たちが開拓していたんだね！"},
        {"speaker": "metan", "text": "その通り。さらに、京都は『火事の街』。何度も燃えては、その度に不死鳥のように復活してきたのよ。"},
        {"speaker": "zundamon", "text": "だからこそ、今のプライドと強さがあるのだ！京都、奥が深すぎるのだ！"}
    ]
    data["kansai"]["osaka"] = [
        {"speaker": "metan", "text": "ずんだもん、大阪がかつて『日本の首都』だったことは知っているかしら？"},
        {"speaker": "zundamon", "text": "えっ！？大阪は天下の台所じゃないのか？めたん先生、教えてなのだ！"},
        {"speaker": "metan", "text": "飛鳥時代には『難波宮』があって、政治の中心だったの。秀吉公が築いた大坂城も、実は石山本願寺という巨大宗教都市の跡地なのよ。"},
        {"speaker": "zundamon", "text": "最強の場所を奪い合っていたんだね！だから今でも商売の活気がすごいのだ！"},
        {"speaker": "metan", "text": "明治以降は『東洋のマンチェスター』と呼ばれるほど工業で栄えたの。常に日本のエンジンね。"},
        {"speaker": "zundamon", "text": "歴史を知ると、たこ焼きももっと美味しく感じるのだ！大阪最高なのだ！"}
    ]
    data["kansai"]["hyogo"] = [
        {"speaker": "metan", "text": "兵庫県は、実は『5つの国』が合体してできた不思議な県なのよ。わかるかしら？"},
        {"speaker": "zundamon", "text": "5つも！？神戸だけじゃないのか？めたん先生、詳しく教えてなのだ！"},
        {"speaker": "metan", "text": "摂津、播磨、但馬、丹波、淡路。それぞれ文化も言葉も全く違うのが兵庫の面白さなの。"},
        {"speaker": "zundamon", "text": "日本海から瀬戸内海まで繋がっているもんね！まさに日本の縮図なのだ！"},
        {"speaker": "metan", "text": "平清盛が遷都を目指した福原京や、世界遺産の姫路城。歴史の重要拠点が詰まっているわ。"},
        {"speaker": "zundamon", "text": "多様性の塊なのだ！どこの地域に行っても発見があってワクワクするのだ！"}
    ]
    data["kansai"]["nara"] = [
        {"speaker": "metan", "text": "ずんだもん、奈良県は『日本の文化のタイムカプセル』と言われているのよ。"},
        {"speaker": "zundamon", "text": "鹿と大仏のイメージなのだ！めたん先生、もっと凄い歴史を教えてなのだ！"},
        {"speaker": "metan", "text": "実は1300年前の木造建築が今も残っているのは、世界的に見ても奇跡なの。"},
        {"speaker": "zundamon", "text": "法隆寺とかだね！当時の職人さんの技術、ヤバすぎるのだ！"},
        {"speaker": "metan", "text": "さらに、シルクロードの終着点として、世界中の宝物が集まっていたのよ。"},
        {"speaker": "zundamon", "text": "奈良に行けば、1000年前の世界旅行ができるんだね！大仏さんに感謝なのだ！"}
    ]
    data["kansai"]["shiga"] = [
        {"speaker": "metan", "text": "滋賀県は、戦国時代に『天下を獲るなら近江を制せ』と言われた要所なのよ。"},
        {"speaker": "zundamon", "text": "琵琶湖があるからか？めたん先生、理由を教えてなのだ！"},
        {"speaker": "metan", "text": "琵琶湖の水運と、東国と西国を結ぶ街道が交差するからよ。信長公の安土城もここにあったわ。"},
        {"speaker": "zundamon", "text": "まさに日本の交通の心臓部だったんだね！近江商人が全国で活躍したのも納得なのだ！"},
        {"speaker": "metan", "text": "今でも京阪神の水を支える『マザーレイク』。歴史も自然も、日本の宝ね。"},
        {"speaker": "zundamon", "text": "滋賀を制する者は日本を制す！僕も琵琶湖で修行してくるのだ！"}
    ]
    data["kansai"]["wakayama"] = [
        {"speaker": "metan", "text": "和歌山県は、昔から『神々が住む聖地』として崇められてきたの。"},
        {"speaker": "zundamon", "text": "みかんと梅干しのイメージなのだ！めたん先生、スピリチュアルな歴史を教えて！"},
        {"speaker": "metan", "text": "高野山や熊野三山。厳しい自然の中に、日本独自の信仰が深く根付いているのよ。"},
        {"speaker": "zundamon", "text": "熊野古道は世界遺産だね！昔の人も、癒やしを求めて歩いたのかな？"},
        {"speaker": "metan", "text": "そうね。さらに徳川吉宗公を輩出した紀州徳川家の誇りも高いわ。"},
        {"speaker": "zundamon", "text": "自然のパワーと武士の誇り！パンダもいて、和歌山は最強なのだ！"}
    ]
    data["kansai"]["mie"] = [
        {"speaker": "metan", "text": "三重県は、日本人の心の故郷『伊勢神宮』がある特別な場所よ。"},
        {"speaker": "zundamon", "text": "お伊勢参りは江戸時代からの憧れなのだ！めたん先生、秘密を教えて！"},
        {"speaker": "metan", "text": "実は三重は『伊勢・伊賀・志摩』の3つの個性が合体しているの。忍者の里もあるわよ。"},
        {"speaker": "zundamon", "text": "伊賀忍者！神様も忍者の技術も、三重には詰まっているんだね！"},
        {"speaker": "metan", "text": "さらに、松阪牛や真珠の養殖など、世界に誇るブランドの宝庫でもあるわ。"},
        {"speaker": "zundamon", "text": "美味しいものと忍術！三重に行けば、無敵になれる気がするのだ！"}
    ]

    # Chugoku Region Updates
    data["chugoku"]["tottori"] = [
        {"speaker": "metan", "text": "鳥取県といえば砂丘だけど、実は『鉄』の歴史が凄いことを知っているかしら？"},
        {"speaker": "zundamon", "text": "砂じゃないのか！？めたん先生、鉄の秘密を教えてなのだ！"},
        {"speaker": "metan", "text": "古くから『たたら製鉄』が盛んで、日本刀の原料となる高品質な鉄が作られていたの。"},
        {"speaker": "zundamon", "text": "へぇー！砂丘だけじゃなくて、日本のモノづくりの原点があったんだね！"},
        {"speaker": "metan", "text": "そうなの。さらに日本最古のラブストーリーと言われる『因幡の白うさぎ』の舞台でもあるわ。"},
        {"speaker": "zundamon", "text": "神話と鉄の国！鳥取は、ただの砂の県じゃなかったのだ！"}
    ]
    data["chugoku"]["shimane"] = [
        {"speaker": "metan", "text": "島根県は、10月になると全国の神様が集まる『神在月』の国なのよ。"},
        {"speaker": "zundamon", "text": "出雲大社なのだ！でも、なんで島根に集まるんだ？めたん先生！"},
        {"speaker": "metan", "text": "古事記の物語の舞台の多くがここにあって、古代日本で強大な力を持っていた証拠ね。"},
        {"speaker": "zundamon", "text": "地下には巨大な神殿の跡も見つかっているんだよね！ロマンがあるのだ！"},
        {"speaker": "metan", "text": "世界遺産の石見銀山もあって、かつては世界の銀の3分の1を支えていたこともあるの。"},
        {"speaker": "zundamon", "text": "世界経済を動かしていた島根！神様も銀も、全部島根にあるのだ！"}
    ]
    data["chugoku"]["okayama"] = [
        {"speaker": "metan", "text": "岡山県は『晴れの国』。でも実は、古代には大和政権に匹敵する『吉備王国』があったの。"},
        {"speaker": "zundamon", "text": "桃太郎のイメージしかないのだ！めたん先生、王国について教えて！"},
        {"speaker": "metan", "text": "巨大な古墳や、高度な鉄器文化。あまりに強大で、大和政権に恐れられたほどよ。"},
        {"speaker": "zundamon", "text": "桃太郎の鬼退治も、その勢力争いがモデルだっていう説があるんだね！"},
        {"speaker": "metan", "text": "そうね。今は瀬戸大橋で四国と繋がり、交通の要所として発展し続けているわ。"},
        {"speaker": "zundamon", "text": "晴れ渡る空の下には、王国の誇りが今も眠っているのだ！岡山、カッコいいのだ！"}
    ]
    data["chugoku"]["hiroshima"] = [
        {"speaker": "metan", "text": "広島県は、海の上に立つ『厳島神社』が有名だけど、その美しさには理由があるの。"},
        {"speaker": "zundamon", "text": "平清盛が建てたんだよね！めたん先生、美しさの秘密を教えて！"},
        {"speaker": "metan", "text": "自然への畏怖と、当時の最先端の建築技術が融合しているの。まさに日本美の極致ね。"},
        {"speaker": "zundamon", "text": "海に浮かぶ鳥居、いつ見ても感動するのだ！"},
        {"speaker": "metan", "text": "戦後の驚異的な復興を成し遂げた『平和の都市』。力強い再生の精神が流れているわ。"},
        {"speaker": "zundamon", "text": "お好み焼きを食べて、歴史の強さを噛みしめるのだ！広島は希望の光なのだ！"}
    ]
    data["chugoku"]["yamaguchi"] = [
        {"speaker": "metan", "text": "山口県は『明治維新の震源地』。日本の近代化はここから始まったのよ。"},
        {"speaker": "zundamon", "text": "吉田松陰先生の松下村塾なのだ！めたん先生、なんで山口から始まったんだ？"},
        {"speaker": "metan", "text": "長州藩が教育に力を入れ、未来を変える若者をたくさん育てたからよ。"},
        {"speaker": "zundamon", "text": "学ぶことが、国を変える力になったんだね！僕もずんだ餅の勉強をするのだ！"},
        {"speaker": "metan", "text": "ふふ。フグの美味しさや、絶景の角島大橋。歴史と美しさが共存する県ね。"},
        {"speaker": "zundamon", "text": "維新の志とフグの味！山口は、日本の未来を切り拓く県なのだ！"}
    ]

    # Shikoku Region Updates
    data["shikoku"]["tokushima"] = [
        {"speaker": "metan", "text": "徳島県といえば阿波踊り。でも、実は『世界を青く染めた』歴史があるのよ。"},
        {"speaker": "zundamon", "text": "世界を！？めたん先生、阿波踊りのステップのことじゃないよね？"},
        {"speaker": "metan", "text": "そうよ。高品質な『阿波藍』。ジャパンブルーとして世界中にその名が轟いたの。"},
        {"speaker": "zundamon", "text": "へぇー！藍染めで経済を支えていたんだね！"},
        {"speaker": "metan", "text": "さらに鳴門の渦潮。自然の圧倒的なエネルギーを感じられる場所でもあるわ。"},
        {"speaker": "zundamon", "text": "藍の深みと、渦潮の勢い！徳島は、情熱の国なのだ！踊る阿呆に見る阿呆なのだ！"}
    ]
    data["shikoku"]["kagawa"] = [
        {"speaker": "metan", "text": "香川県は、面積は日本一小さいけど、歴史の密度は日本一レベルなのよ。"},
        {"speaker": "zundamon", "text": "うどん県なのだ！めたん先生、うどん以外の秘密も教えて！"},
        {"speaker": "metan", "text": "弘法大師・空海の生誕地であり、四国遍路の中心地。精神文化の拠点なの。"},
        {"speaker": "zundamon", "text": "空海さん！香川から日本の仏教が大きく変わったんだね！"},
        {"speaker": "metan", "text": "金刀比羅宮への参拝など、江戸時代から庶民の憧れの地だったのよ。"},
        {"speaker": "zundamon", "text": "うどんを食べて、パワーアップしてお参りなのだ！香川は幸せの県なのだ！"}
    ]
    data["shikoku"]["ehime"] = [
        {"speaker": "metan", "text": "愛媛県には、日本最古と言われる『道後温泉』があるの。"},
        {"speaker": "zundamon", "text": "聖徳太子も入ったって本当か！？めたん先生、温泉の歴史を教えて！"},
        {"speaker": "metan", "text": "本当よ。万葉集にも歌われ、3000年の歴史を持つ、まさに伝説の湯ね。"},
        {"speaker": "zundamon", "text": "3000年！？歴史の深さが、お湯に溶け込んでいるんだね！"},
        {"speaker": "metan", "text": "正岡子規や夏目漱石が愛した文学の街でもあるわ。みかんの甘さも格別よ。"},
        {"speaker": "zundamon", "text": "温泉と文学とみかん！愛媛は、五感が満たされる最高の県なのだ！"}
    ]
    data["shikoku"]["kochi"] = [
        {"speaker": "metan", "text": "高知県は、なんといっても幕末のヒーロー『坂本龍馬』を生んだ地ね。"},
        {"speaker": "zundamon", "text": "龍馬！桂浜で太平洋を見つめる姿がカッコいいのだ！めたん先生！"},
        {"speaker": "metan", "text": "高知の荒々しい海と自由な気風が、彼の大きな夢を育てたのよ。"},
        {"speaker": "zundamon", "text": "だからこそ、今の日本を形作る大逆転ができたんだね！"},
        {"speaker": "metan", "text": "清流・四万十川の恵みや、カツオのタタキ。情熱的で真っ直ぐな県ね。"},
        {"speaker": "zundamon", "text": "龍馬の志を胸に、僕も太平洋に向かって叫ぶのだ！高知、最高ぜよ！"}
    ]

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Kansai, Chugoku, and Shikoku scripts updated successfully!")

update_scripts()
