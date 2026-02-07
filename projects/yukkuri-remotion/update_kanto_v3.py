import json

def update_kanto():
    path = "projects/yukkuri-remotion/all_prefectures_v2.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Kanto Region Updates (Pattern A: Metan-first)
    data["kanto"]["tokyo"] = [
        {"speaker": "metan", "text": "ずんだもん、日本の中心・東京都の歴史は『大改造』の連続なのよ。"},
        {"speaker": "zundamon", "text": "徳川家康公が江戸に来る前は、ただの湿地帯だったんだよね？"},
        {"speaker": "metan", "text": "その通り。大規模な埋め立てと利根川の流れを変える大工事で、世界最大の都市の基礎が作られたの。"},
        {"speaker": "zundamon", "text": "自然を捻じ曲げて街を作ったなんて、当時の執念が凄すぎるのだ！"},
        {"speaker": "metan", "text": "関東大震災や戦災を乗り越え、その度に進化し続ける姿はまさに不死鳥ね。"},
        {"speaker": "zundamon", "text": "常に変化し続けるエネルギーの塊！それが東京の正体なのだ！"}
    ]
    data["kanto"]["kanagawa"] = [
        {"speaker": "metan", "text": "神奈川県は、日本の『近代化への窓口』として発展してきたのよ。"},
        {"speaker": "zundamon", "text": "横浜港とペリー来航のイメージなのだ！めたん先生！"},
        {"speaker": "metan", "text": "そう。さらに鎌倉時代には幕府が置かれ、武士の文化が花開いた地でもあるわ。"},
        {"speaker": "zundamon", "text": "海も山もあって、歴史のレイヤーが何重にも重なっているんだね！"},
        {"speaker": "metan", "text": "最先端の都市風景と、古都の静寂。このギャップが神奈川の魅力ね。"},
        {"speaker": "zundamon", "text": "新しいものと古いものが混ざり合う、最高にクールな県なのだ！"}
    ]
    data["kanto"]["saitama"] = [
        {"speaker": "metan", "text": "ずんだもん、埼玉県は古くから『江戸を支えるバックボーン』だったの。"},
        {"speaker": "zundamon", "text": "のどかなイメージなのだ！本当はどんな凄さがあるんだ？めたん先生！"},
        {"speaker": "metan", "text": "荒川や利根川の恵みを受けた農業、そして川越などの城下町が栄えていたのよ。"},
        {"speaker": "zundamon", "text": "『小江戸』川越！今でも蔵造りの街並みが残っていてカッコいいのだ！"},
        {"speaker": "metan", "text": "今は交通の要所として、多くの人を支える活力あふれる県になったわ。"},
        {"speaker": "zundamon", "text": "実は凄腕の支え役！埼玉県のポテンシャルは底知れないのだ！"}
    ]
    data["kanto"]["chiba"] = [
        {"speaker": "metan", "text": "千葉県は、海を通じた『物流と信仰』の要衝だったのよ。"},
        {"speaker": "zundamon", "text": "成田山新勝寺とか、ディズニーのイメージなのだ！"},
        {"speaker": "metan", "text": "江戸時代には江戸湾の防衛と、新鮮な魚介を供給する重要な役割を担っていたの。"},
        {"speaker": "zundamon", "text": "江戸の胃袋を支えていたんだね！醤油の生産もこの時代から盛んなのだ！"},
        {"speaker": "metan", "text": "今は空の玄関口・成田空港もあり、世界と日本を繋ぐ重要な県ね。"},
        {"speaker": "zundamon", "text": "海から空まで、日本のアクセスを一手に引き受ける頼れる県なのだ！"}
    ]
    data["kanto"]["ibaraki"] = [
        {"speaker": "metan", "text": "茨城県は、水戸徳川家が築いた『学問と情熱』の地よ。"},
        {"speaker": "zundamon", "text": "水戸黄門様なのだ！めたん先生、学問ってどういうことだ？"},
        {"speaker": "metan", "text": "水戸学という思想が生まれ、それが明治維新の大きな原動力になったの。"},
        {"speaker": "zundamon", "text": "今の日本ができるきっかけを作ったんだね！凄いエネルギーなのだ！"},
        {"speaker": "metan", "text": "今は科学の街・つくばもあり、知性の最前線を走り続けているわ。"},
        {"speaker": "zundamon", "text": "歴史ある熱い魂と、最新の科学！茨城は未来を創る県なのだ！"}
    ]
    data["kanto"]["tochigi"] = [
        {"speaker": "metan", "text": "栃木県は、徳川家康公が眠る『日光』を擁する特別な場所よ。"},
        {"speaker": "zundamon", "text": "日光東照宮なのだ！あの豪華絢爛さはいつ見ても驚くのだ！"},
        {"speaker": "metan", "text": "江戸幕府の守護神として、風水に基づいた究極のパワースポットが築かれたの。"},
        {"speaker": "zundamon", "text": "日本の中心を守る要塞でもあったんだね！餃子の街・宇都宮も熱いのだ！"},
        {"speaker": "metan", "text": "豊かな自然と、脈々と受け継がれる伝統。懐の深い県になったわね。"},
        {"speaker": "zundamon", "text": "歴史のパワーを全身で感じられる！栃木県、神々しすぎるのだ！"}
    ]
    data["kanto"]["gunma"] = [
        {"speaker": "metan", "text": "群馬県は、かつて『絹の力で日本を豊かにした』立役者なのよ。"},
        {"speaker": "zundamon", "text": "富岡製糸場なのだ！世界遺産にもなっているよね！"},
        {"speaker": "metan", "text": "そう。良質な生糸で外貨を稼ぎ、日本の近代化を経済面で支え切ったの。"},
        {"speaker": "zundamon", "text": "群馬のシルクが日本を救ったんだね！温泉の湧出量も凄まじいのだ！"},
        {"speaker": "metan", "text": "『上州のからっ風』に鍛えられた、義理人情に厚い気風が今も息づいているわ。"},
        {"speaker": "zundamon", "text": "熱い温泉と熱い魂！群馬県は、日本のエネルギー源なのだ！"}
    ]

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Kanto scripts updated successfully to Pattern A!")

update_kanto()
