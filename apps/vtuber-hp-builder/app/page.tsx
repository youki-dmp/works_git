"use client";

import { motion, Variants, AnimatePresence } from "framer-motion";
import { Youtube, Twitter, Instagram, Music, MessageCircle, Mail, ExternalLink, Brush, ChevronLeft, ChevronRight, Menu, X, Home as HomeIcon, Newspaper, Image as ImageIcon, Calendar, Info } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

// Placeholder data simulating the user configuration
const profileData = {
  name: "万宮つくり",
  tagline: "大正生まれの裁ちばさみ、１００年かけて付喪神！",
  themeColor: "#e879f9", // Custom theme color (e.g., fuchsia-400)
  isLive: true, // 配信中フラグ
  liveUrl: "https://youtube.com/live/xxxxxx",
  description: "まみやっほー！\nVTuberの万宮つくりです！\nデザイン工作お裁縫、つくものつくりが物づくり！ 楽しい時間もつくっちゃお！",
  avatarUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400&auto=format&fit=crop",
  standingImageUrl: "/mock_standing.png", // AI Generated Standing Character
  heroImageUrl: "https://images.unsplash.com/photo-1621510427958-967f08b3eafc?q=100&w=1920&auto=format&fit=crop", // Large hero background
  scheduleImg: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=800&auto=format&fit=crop", // placeholder for weekly schedule
  news: [
    { date: "2026.03.15", title: "新しい春のグッズセットがBOOTHにて販売開始！", type: "GOODS" },
    { date: "2026.03.10", title: "チャンネル登録者10万人突破記念3Dライブ決定！", type: "LIVE" },
    { date: "2026.03.01", title: "オリジナル曲第3弾『ハルノカゼ』MV公開", type: "VIDEO" },
  ],
  sns: [
    { name: "YouTube", url: "#", icon: <Youtube className="w-5 h-5" />, color: "hover:text-red-500" },
    { name: "Twitter", url: "#", icon: <Twitter className="w-5 h-5" />, color: "hover:text-blue-400" },
    { name: "TikTok", url: "#", icon: <Music className="w-5 h-5" />, color: "hover:text-pink-500" },
    { name: "マシュマロ", url: "#", icon: <MessageCircle className="w-5 h-5" />, color: "hover:text-pink-300" },
    { name: "FANBOX", url: "#", icon: <ExternalLink className="w-5 h-5" />, color: "hover:text-yellow-400" },
  ],
  gallery: {
    profile: [
      "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621510427958-967f08b3eafc?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
    ],
    fanart: [
      "https://images.unsplash.com/photo-1549488344-c6c761c55bc6?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594911772125-07fc6a2c672f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582845512747-e42001c95638?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1536699054559-052414777a83?q=80&w=800&auto=format&fit=crop",
    ]
  },
  videos: {
    latest: [
      { id: "MSmTLq7-0Gs", title: "【Vtuber衣装ゆる考察＆解説企画】コスプレとして作るならどうする！？", thumbnail: "https://i.ytimg.com/vi/MSmTLq7-0Gs/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=MSmTLq7-0Gs" },
      { id: "DN2IghBPxz4", title: "【つくちゅ～る：刺繍】ミシン刺繍しまーす！データ作りから～SOREYUKE編～", thumbnail: "https://i.ytimg.com/vi/DN2IghBPxz4/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=DN2IghBPxz4" },
      { id: "3", title: "【ゲーム実況】話題の新作ゲームを最速プレイ！ #1", thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop", url: "#" },
      { id: "4", title: "【雑談】週末のまったり配信～お茶飲みながら～", thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop", url: "#" },
      { id: "5", title: "【歌枠】ボカロ名曲縛りで歌います！！", thumbnail: "https://images.unsplash.com/photo-1516280440502-628e578a9c33?q=80&w=600&auto=format&fit=crop", url: "#" },
      { id: "6", title: "【コラボ】先輩と一緒にホラーゲーム企画！", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop", url: "#" },
      { id: "7", title: "【朝活】みんなで一緒にラジオ体操＆作業枠", thumbnail: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=600&auto=format&fit=crop", url: "#" },
      { id: "8", title: "【耐久】チャンネル登録者〇〇人いくまで終われません！", thumbnail: "https://images.unsplash.com/photo-1540224871915-ce93e41ce994?q=80&w=600&auto=format&fit=crop", url: "#" },
      { id: "9", title: "【お悩み相談】マシュマロ読んでいきます！", thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop", url: "#" },
      { id: "10", title: "【記念】1周年記念3Dライブのお知らせ！", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop", url: "#" },
    ],
    picked: [
      { id: "ne7EXTVOdm8", title: "【オリジナルソング】Choki cheer", thumbnail: "https://i.ytimg.com/vi/ne7EXTVOdm8/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=ne7EXTVOdm8" },
      { id: "15xZu2HX7ko", title: "【オリジナル自己紹介ソング】V-Sign! ver. 万宮つくり", thumbnail: "https://i.ytimg.com/vi/15xZu2HX7ko/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=15xZu2HX7ko" },
    ]
  },
  activities: [
    "V-Bar「real」様 コラボバー開催",
    "株式会社SAT-BOX様 switch用ゲーム ほのぼの釣り物語 PR",
    "AttendMe様 バーチャルリンクカード シグリア販売",
    "期間限定ユニット「ぐぴぱ」結成",
  ],
  qna: [
    { q: "誕生日", a: "8/3" },
    { q: "特技", a: "ものづくり！専門は服飾" },
  ],
  creators: [
    { role: "ママ(Illustrator)", name: "北野りりお", link: "#" },
    { role: "モデリング", name: "万宮つくり (セルフ)", link: "#" },
  ]
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  const pickedVideosRef = useRef<HTMLDivElement>(null);
  const latestVideosRef = useRef<HTMLDivElement>(null);
  const fanartGalleryRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <main
      className="min-h-screen relative z-10 bg-background"
      style={{
        '--color-primary': profileData.themeColor,
        '--primary': profileData.themeColor,
      } as React.CSSProperties}
    >
      {/* Mobile Navigation (Bottom Right Hamburger) */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_var(--primary)] transition-transform active:scale-95"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 right-0 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-4 min-w-[200px]"
            >
              {[
                { name: 'ホーム', icon: <HomeIcon className="w-5 h-5" />, href: "#home" },
                { name: 'ニュース', icon: <Newspaper className="w-5 h-5" />, href: "#news" },
                { name: 'プロフィール', icon: <Brush className="w-5 h-5" />, href: "#profile" },
                { name: '動画', icon: <Youtube className="w-5 h-5" />, href: "#videos" },
                { name: 'ギャラリー', icon: <ImageIcon className="w-5 h-5" />, href: "#gallery" },
                { name: '活動実績', icon: <Info className="w-5 h-5" />, href: "#activities" },
                { name: 'スケジュール', icon: <Calendar className="w-5 h-5" />, href: "#schedule" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-white/80 hover:text-primary font-bold transition-colors"
                >
                  {item.icon} {item.name}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Navigation */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 hidden md:block ${scrolled ? 'bg-black/60 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <div className="font-extrabold text-xl tracking-widest drop-shadow-md">{profileData.name}</div>
          <nav className="flex gap-8">
            {[
              { label: 'ホーム', href: 'home' },
              { label: 'ニュース', href: 'news' },
              { label: 'プロフィール', href: 'profile' },
              { label: '動画', href: 'videos' },
              { label: 'ギャラリー', href: 'gallery' },
              { label: '活動実績', href: 'activities' },
            ].map((item) => (
              <a key={item.label} href={`#${item.href}`} className="text-sm font-bold text-white/80 hover:text-white transition-colors drop-shadow-md">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section (FV) */}
      <section id="home" className="relative h-[100svh] w-full flex items-center justify-center overflow-hidden">
        {/* Fullscreen Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          {profileData.heroImageUrl && (
            <Image
              src={profileData.heroImageUrl}
              alt="Hero Background"
              fill
              sizes="100vw"
              priority
              className="object-cover opacity-20 md:opacity-30 mask-image-bottom"
              style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 h-full flex flex-col md:flex-row items-center justify-center pt-24 md:pt-0">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full text-center md:text-left space-y-6 md:pr-10 order-2 md:order-1 mt-4 md:mt-0 z-20 shrink-0"
          >
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight drop-shadow-2xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                  {profileData.name}
                </span>
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white/90 drop-shadow-xl border-l-4 border-primary pl-4 inline-block md:block mx-auto md:mx-0 text-left">
                {profileData.tagline}
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-6 justify-center md:justify-start">
              {/* NOW LIVE Badge */}
              {profileData.isLive && (
                <a href={profileData.liveUrl} target="_blank" rel="noopener noreferrer">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="bg-red-600/90 text-white px-8 py-3 flex items-center gap-3 rounded-full font-bold text-xl tracking-wider shadow-[0_0_25px_rgba(220,38,38,0.6)] border-2 border-white/20 hover:bg-red-500 transition-colors cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white animate-pulse" />
                    NOW LIVE
                  </motion.div>
                </a>
              )}
            </div>
          </motion.div>

          {/* Standing Character Image */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full h-[45vh] md:h-[90vh] relative order-1 md:order-2 flex justify-center md:justify-end items-end z-10"
          >
            <div className="relative w-full h-[45vh] md:h-full max-w-[600px] md:max-w-none origin-bottom">
              <Image
                src={profileData.standingImageUrl || profileData.avatarUrl}
                alt={profileData.name}
                fill
                priority
                className="object-contain object-bottom drop-shadow-[0_0_25px_var(--primary)] pointer-events-none"
              />
            </div>
          </motion.div>

        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2 z-20"
        >
          <span className="text-sm font-bold tracking-widest">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      <div className="max-w-4xl mx-auto space-y-24 px-4 sm:px-6 lg:px-8 pb-32 pt-12 relative z-10">

        {/* NEWS Section */}
        <motion.section
          id="news"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="glass-panel p-6 md:p-10 rounded-3xl shrink-0 scroll-mt-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <Newspaper className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">新着情報 (ニュース)</h2>
          </div>
          <div className="space-y-4">
            {profileData.news?.map((item, i) => (
              <a key={i} href="#" className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-3 border-b border-white/10 hover:bg-white/5 transition-colors rounded-lg px-2 group">
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-white/60 font-mono text-sm">{item.date}</span>
                  <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/30 min-w-[60px] text-center">
                    {item.type}
                  </span>
                </div>
                <p className="font-medium group-hover:text-primary transition-colors">{item.title}</p>
              </a>
            ))}
          </div>
        </motion.section>

        {/* SNS Links */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="flex flex-wrap justify-center gap-4"
        >
          {profileData.sns.map((sns, i) => (
            <motion.a
              key={i}
              variants={fadeUp}
              href={sns.url}
              className={`glass-panel glass-panel-hover flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-colors ${sns.color}`}
            >
              {sns.icon}
              <span>{sns.name}</span>
            </motion.a>
          ))}
        </motion.section>

        {/* Profile Details */}
        <motion.section
          id="profile"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="glass-panel p-8 md:p-12 rounded-3xl scroll-mt-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <Brush className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">プロフィール</h2>
          </div>
          <p className="text-lg leading-relaxed text-white/90 whitespace-pre-wrap">
            {profileData.description}
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {profileData.qna.map((item, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-sm text-primary/80 font-semibold mb-1">{item.q}</p>
                <p className="font-medium">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Videos Section */}
        <motion.section
          id="videos"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="space-y-12 scroll-mt-24"
        >
          {/* Picked Videos */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold px-2 flex items-center gap-2">
              <Youtube className="w-6 h-6 text-primary" />
              ピックアップ動画
            </h2>
            <div className="relative group/carousel">
              <button
                onClick={() => scrollContainer(pickedVideosRef, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition-opacity opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div ref={pickedVideosRef} className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
                {profileData.videos.picked.map((vid, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="min-w-[280px] md:min-w-[360px] snap-center glass-panel rounded-2xl overflow-hidden group flex flex-col"
                  >
                    <div className="relative w-full aspect-video shrink-0 bg-black/50">
                      {/* YouTube embed for Picked Videos */}
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${vid.id}?controls=1`}
                        title={vid.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="p-4 bg-black/20 flex-1 flex items-center">
                      <p className="font-bold line-clamp-2 w-full">{vid.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => scrollContainer(pickedVideosRef, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition-opacity opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Latest Videos */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold px-2">最新動画</h2>
            <div className="relative group/carousel">
              <button
                onClick={() => scrollContainer(latestVideosRef, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition-opacity opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div ref={latestVideosRef} className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-pl-2 hide-scrollbar">
                {profileData.videos.latest.map((vid, i) => (
                  <motion.a
                    key={i}
                    variants={fadeUp}
                    href={vid.url}
                    className="min-w-[240px] md:min-w-[280px] snap-start glass-panel glass-panel-hover rounded-2xl overflow-hidden group flex flex-col shrink-0"
                  >
                    <div className="relative w-full aspect-video shrink-0 bg-black/50">
                      <Image src={vid.thumbnail} alt={vid.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-3 flex-1 flex items-center">
                      <p className="font-semibold text-sm line-clamp-2 w-full">{vid.title}</p>
                    </div>
                  </motion.a>
                ))}
              </div>

              <button
                onClick={() => scrollContainer(latestVideosRef, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition-opacity opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Gallery Preview */}
        <motion.section
          id="gallery"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="space-y-12 scroll-mt-24"
        >
          {/* Profile Gallery */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold px-2">ギャラリー (公式)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {profileData.gallery.profile.map((img, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-panel glass-panel-hover group"
                >
                  <Image
                    src={img}
                    alt={`Profile image ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Fanart Gallery */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold px-2">ファンアート</h2>
            <div className="relative group/carousel">
              <button
                onClick={() => scrollContainer(fanartGalleryRef, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition-opacity opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div ref={fanartGalleryRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                {profileData.gallery.fanart.map((img, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="relative shrink-0 min-w-[200px] aspect-square rounded-2xl overflow-hidden glass-panel glass-panel-hover group snap-center"
                  >
                    <Image
                      src={img}
                      alt={`Fanart image ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => scrollContainer(fanartGalleryRef, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition-opacity opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Activities */}
          <motion.section
            id="activities"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="glass-panel p-8 rounded-3xl scroll-mt-24"
          >
            <h2 className="text-2xl font-bold mb-6">活動実績</h2>
            <ul className="space-y-4">
              {profileData.activities.map((act, i) => (
                <li key={i} className="flex gap-3 text-white/80 items-start">
                  <span className="text-primary mt-1">•</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Credits & Contact */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="space-y-8"
          >
            {/* Schedule Section */}
            <div id="schedule" className="glass-panel p-8 rounded-3xl scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">配信スケジュール</h2>
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                <Image src={profileData.scheduleImg} alt="Weekly Schedule" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="font-bold text-white tracking-widest">VIEW FULL SIZE</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6">クレジット</h2>
              <div className="space-y-4">
                {profileData.creators.map((c, i) => (
                  <div key={i}>
                    <p className="text-sm text-primary/80 font-semibold">{c.role}</p>
                    <a href={c.link} className="hover:text-primary transition-colors font-medium">
                      {c.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center text-center">
              <Mail className="w-8 h-8 text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">お問い合わせ</h2>
              <p className="text-sm text-white/70 mb-4">お仕事のご依頼はこちら</p>
              <a href="mailto:contact@example.com" className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-full font-semibold transition-colors">
                メールを送る
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
