export type Language = "vi" | "en" | "fr" | "de" | "ja" | "ko" | "zh";

export const languageInfo: Record<Language, { name: string; flag: string }> = {
  vi: { name: "Tiếng Việt", flag: "🇻🇳" },
  en: { name: "English", flag: "🇬🇧" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ko: { name: "한국어", flag: "🇰🇷" },
  zh: { name: "中文", flag: "🇨🇳" },
};

export const translations = {
  vi: {
    // Badge
    badge: "Douyin Supreme Downloader · Không watermark · Free forever",
    
    // Header
    title: "Tải video Douyin",
    titleHighlight: "chất lượng tối đa",
    titleSuffix: "trong vài giây.",
    description: "Chỉ cần dán link Douyin (short URL cũng được), hệ thống sẽ tự động gỡ watermark, chọn bitrate cao nhất và trả về file MP4 siêu nét cho bạn.",
    
    // Status
    statusReady: "Sẵn sàng tải",
    statusAnalyzing: "Đang phân tích...",
    statusReadyToDownload: "Đã sẵn sàng tải về",
    statusError: "Có lỗi xảy ra",
    
    // Form
    inputLabel: "Link video (Douyin / TikTok / Facebook)",
    inputPlaceholder: "https://v.douyin.com/... hoặc tiktok.com/... hoặc facebook.com/...",
    noWatermark: "Không watermark",
    downloadButton: "Tải ngay",
    processing: "Đang xử lý...",
    
    // Sample buttons
    sampleDouyin: "Douyin mẫu",
    sampleTiktok: "TikTok mẫu",
    sampleFacebook: "Facebook mẫu",
    sampleFillMessage: "Dán link mẫu rồi, bấm Tải ngay nhé!",
    
    // Messages
    pasteLinkFirst: "Vui lòng dán link Douyin trước khi tải.",
    foundHighQuality: "Tìm thấy video chất lượng cao, không watermark!",
    unknownError: "Không thể xử lý link này, thử lại sau nhé.",
    urlNotFound: "Không tìm thấy URL trong đoạn bạn dán. Thử lại nhé!",
    analysisResult: "Kết quả phân tích",
    videoInfo: "Thông tin video",
    retry: "Thử lại",
    analyzing: "Đang phân tích",
    
    // Drawer
    videoDetails: "Chi tiết video",
    noDescription: "Video không có mô tả",
    downloadMp4: "Tải file MP4 không watermark",
    processedAt: "Đã xử lý:",
    processedInfo: "Link tải chỉ sử dụng nguồn chính thức từ Douyin, an toàn và riêng tư.",
    
    // History
    historyTitle: "Lịch sử",
    historyVideo: "Video",
    historyAnalyzed: "video đã phân tích",
    historyEmpty: "Chưa có video nào",
    historyError: "Không thể tải lịch sử",
    historyLoading: "Đang tải...",
    historyDelete: "Xóa",
    historyDeleteConfirm: "Bạn có chắc muốn xóa video này?",
    historyDeleteSuccess: "Đã xóa video",
    historyDeleteError: "Không thể xóa video",
    
    // Video info
    video: "Video",
    unknown: "Không rõ",
    author: "Tác giả",
    duration: "Thời lượng",
    resolution: "Độ phân giải",
    size: "Kích thước",
    videoDescription: "Mô tả",
    platform: "Nền tảng",
    bitrate: "Bitrate",
    music: "Nhạc",
    share: "Chia sẻ",
    
    // Guide steps
    guideStep1Title: "1. Mở Douyin",
    guideStep1Detail: "Nhấn vào nút Chia sẻ (biểu tượng mũi tên) ở video bạn thích.",
    guideStep2Title: "2. Copy Link",
    guideStep2Detail: "Chọn Copy Link/复制链接 để sao chép URL video.",
    guideStep3Title: "3. Dán vào ô tải",
    guideStep3Detail: "Dán link vào ô bên trên rồi bấm Tải ngay.",
    
    // Error messages
    unsupportedPlatform: "Chỉ hỗ trợ link từ Douyin, TikTok hoặc Facebook.",
    undefinedError: "Đã có lỗi không xác định.",
    loadHistoryError: "Không thể tải lịch sử",
    deleteVideoError: "Không thể xóa video",
    videoNoWatermark: "Video Douyin không watermark",
    
    // Aria labels
    closeDrawer: "Đóng drawer",
    viewAnalysisResult: "Xem kết quả phân tích",
    deleteVideo: "Xóa video",
    guideIllustration: "Minh hoạ thao tác: mở video → nhấn Chia sẻ → Copy Link.",
    
    // Features section
    whyDifferent: "Vì sao Douyin Supreme khác biệt?",
    feature1: "Gỡ watermark trực tiếp từ nguồn chính thức Douyin, chọn bitrate cao nhất (lên tới 1080p/4K tuỳ video).",
    feature2: "Tự nhận diện link rút gọn v.douyin.com và link app nội địa, không cần cài thêm gì.",
    feature3: "UI chuẩn \"neo-brutalist\" hiện đại, tối ưu cho desktop & mobile.",
    
    // Tips section
    tipsTitle: "Tips để tải siêu nhanh",
    tip1: "Copy link chia sẻ trong Douyin & dán vào ô phía trái.",
    tip2: "Ưu tiên Wi-Fi để tải các video trên 200MB.",
    tip3: "Bookmark trang này để không bao giờ lo watermark nữa.",
    
    // Dialog
    confirm: "Xác nhận",
    cancel: "Hủy",
    close: "Đóng",
  },
  en: {
    // Badge
    badge: "Douyin Supreme Downloader · No watermark · Free forever",
    
    // Header
    title: "Download Douyin videos",
    titleHighlight: "in maximum quality",
    titleSuffix: "in seconds.",
    description: "Just paste the Douyin link (short URL is also fine), the system will automatically remove the watermark, select the highest bitrate and return a super sharp MP4 file for you.",
    
    // Status
    statusReady: "Ready to download",
    statusAnalyzing: "Analyzing...",
    statusReadyToDownload: "Ready to download",
    statusError: "An error occurred",
    
    // Form
    inputLabel: "Video link (Douyin / TikTok / Facebook)",
    inputPlaceholder: "https://v.douyin.com/... or tiktok.com/... or facebook.com/...",
    noWatermark: "No watermark",
    downloadButton: "Download Now",
    processing: "Processing...",
    
    // Sample buttons
    sampleDouyin: "Douyin sample",
    sampleTiktok: "TikTok sample",
    sampleFacebook: "Facebook sample",
    sampleFillMessage: "Sample link pasted, click Download Now!",
    
    // Messages
    pasteLinkFirst: "Please paste the Douyin link before downloading.",
    foundHighQuality: "Found high-quality video, no watermark!",
    unknownError: "Unable to process this link, please try again later.",
    urlNotFound: "No URL found in the pasted text. Please try again!",
    analysisResult: "Analysis Result",
    videoInfo: "Video Information",
    retry: "Retry",
    analyzing: "Analyzing",
    
    // Drawer
    videoDetails: "Video details",
    noDescription: "Video has no description",
    downloadMp4: "Download watermark-free MP4 file",
    processedAt: "Processed at:",
    processedInfo: "Download link only uses official sources from Douyin, safe and private.",
    
    // History
    historyTitle: "History",
    historyVideo: "Video",
    historyAnalyzed: "videos analyzed",
    historyEmpty: "No videos yet",
    historyError: "Unable to load history",
    historyLoading: "Loading...",
    historyDelete: "Delete",
    historyDeleteConfirm: "Are you sure you want to delete this video?",
    historyDeleteSuccess: "Video deleted",
    historyDeleteError: "Unable to delete video",
    
    // Video info
    video: "Video",
    unknown: "Unknown",
    author: "Author",
    duration: "Duration",
    resolution: "Resolution",
    size: "Size",
    videoDescription: "Description",
    platform: "Platform",
    bitrate: "Bitrate",
    music: "Music",
    share: "Share",
    
    // Guide steps
    guideStep1Title: "1. Open Douyin",
    guideStep1Detail: "Click the Share button (arrow icon) on the video you like.",
    guideStep2Title: "2. Copy Link",
    guideStep2Detail: "Select Copy Link/复制链接 to copy the video URL.",
    guideStep3Title: "3. Paste in download box",
    guideStep3Detail: "Paste the link in the box above and click Download Now.",
    
    // Error messages
    unsupportedPlatform: "Only links from Douyin, TikTok or Facebook are supported.",
    undefinedError: "An undefined error occurred.",
    loadHistoryError: "Unable to load history",
    deleteVideoError: "Unable to delete video",
    videoNoWatermark: "Douyin video without watermark",
    
    // Aria labels
    closeDrawer: "Close drawer",
    viewAnalysisResult: "View analysis result",
    deleteVideo: "Delete video",
    guideIllustration: "Operation illustration: open video → click Share → Copy Link.",
    
    // Features section
    whyDifferent: "Why is Douyin Supreme different?",
    feature1: "Removes watermark directly from the official Douyin source, selects the highest bitrate (up to 1080p/4K depending on the video).",
    feature2: "Automatically recognizes short links v.douyin.com and native app links, no need to install anything extra.",
    feature3: "Modern \"neo-brutalist\" standard UI, optimized for desktop & mobile.",
    
    // Tips section
    tipsTitle: "Tips for super fast download",
    tip1: "Copy the share link in Douyin & paste it into the box on the left.",
    tip2: "Prioritize Wi-Fi for downloading videos over 200MB.",
    tip3: "Bookmark this page to never worry about watermarks again.",
    
    // Dialog
    confirm: "Confirm",
    cancel: "Cancel",
    close: "Close",
  },
  fr: {
    // Badge
    badge: "Douyin Supreme Downloader · Sans filigrane · Gratuit pour toujours",
    
    // Header
    title: "Télécharger des vidéos Douyin",
    titleHighlight: "en qualité maximale",
    titleSuffix: "en quelques secondes.",
    description: "Il suffit de coller le lien Douyin (URL courte également), le système supprimera automatiquement le filigrane, sélectionnera le bitrate le plus élevé et vous retournera un fichier MP4 super net.",
    
    // Status
    statusReady: "Prêt à télécharger",
    statusAnalyzing: "Analyse en cours...",
    statusReadyToDownload: "Prêt à télécharger",
    statusError: "Une erreur s'est produite",
    
    // Form
    inputLabel: "Lien vidéo (Douyin / TikTok / Facebook)",
    inputPlaceholder: "https://v.douyin.com/... ou tiktok.com/... ou facebook.com/...",
    noWatermark: "Sans filigrane",
    downloadButton: "Télécharger maintenant",
    processing: "Traitement en cours...",
    
    // Sample buttons
    sampleDouyin: "Échantillon Douyin",
    sampleTiktok: "Échantillon TikTok",
    sampleFacebook: "Échantillon Facebook",
    sampleFillMessage: "Lien échantillon collé, cliquez sur Télécharger maintenant!",
    
    // Messages
    pasteLinkFirst: "Veuillez coller le lien Douyin avant de télécharger.",
    foundHighQuality: "Vidéo haute qualité trouvée, sans filigrane!",
    unknownError: "Impossible de traiter ce lien, veuillez réessayer plus tard.",
    urlNotFound: "Aucune URL trouvée dans le texte collé. Veuillez réessayer!",
    analysisResult: "Résultat de l'analyse",
    videoInfo: "Informations vidéo",
    retry: "Réessayer",
    analyzing: "Analyse en cours",
    
    // Drawer
    videoDetails: "Détails de la vidéo",
    noDescription: "La vidéo n'a pas de description",
    downloadMp4: "Télécharger le fichier MP4 sans filigrane",
    processedAt: "Traité à:",
    processedInfo: "Le lien de téléchargement n'utilise que des sources officielles de Douyin, sûr et privé.",
    
    // History
    historyTitle: "Historique",
    historyVideo: "Vidéo",
    historyAnalyzed: "vidéos analysées",
    historyEmpty: "Aucune vidéo pour le moment",
    historyError: "Impossible de charger l'historique",
    historyLoading: "Chargement...",
    historyDelete: "Supprimer",
    historyDeleteConfirm: "Êtes-vous sûr de vouloir supprimer cette vidéo?",
    historyDeleteSuccess: "Vidéo supprimée",
    historyDeleteError: "Impossible de supprimer la vidéo",
    
    // Video info
    video: "Vidéo",
    unknown: "Inconnu",
    author: "Auteur",
    duration: "Durée",
    resolution: "Résolution",
    size: "Taille",
    videoDescription: "Description",
    platform: "Plateforme",
    bitrate: "Débit",
    music: "Musique",
    share: "Partager",
    
    // Guide steps
    guideStep1Title: "1. Ouvrir Douyin",
    guideStep1Detail: "Cliquez sur le bouton Partager (icône flèche) sur la vidéo que vous aimez.",
    guideStep2Title: "2. Copier le lien",
    guideStep2Detail: "Sélectionnez Copier le lien/复制链接 pour copier l'URL de la vidéo.",
    guideStep3Title: "3. Coller dans la boîte de téléchargement",
    guideStep3Detail: "Collez le lien dans la boîte ci-dessus et cliquez sur Télécharger maintenant.",
    
    // Error messages
    unsupportedPlatform: "Seuls les liens de Douyin, TikTok ou Facebook sont pris en charge.",
    undefinedError: "Une erreur non définie s'est produite.",
    loadHistoryError: "Impossible de charger l'historique",
    deleteVideoError: "Impossible de supprimer la vidéo",
    videoNoWatermark: "Vidéo Douyin sans filigrane",
    
    // Aria labels
    closeDrawer: "Fermer le tiroir",
    viewAnalysisResult: "Voir le résultat de l'analyse",
    deleteVideo: "Supprimer la vidéo",
    guideIllustration: "Illustration de l'opération: ouvrir la vidéo → cliquer sur Partager → Copier le lien.",
    
    // Features section
    whyDifferent: "Pourquoi Douyin Supreme est-il différent?",
    feature1: "Supprime le filigrane directement depuis la source officielle Douyin, sélectionne le bitrate le plus élevé (jusqu'à 1080p/4K selon la vidéo).",
    feature2: "Reconnaît automatiquement les liens courts v.douyin.com et les liens d'application native, pas besoin d'installer quoi que ce soit.",
    feature3: "UI moderne standard \"neo-brutalist\", optimisée pour desktop & mobile.",
    
    // Tips section
    tipsTitle: "Conseils pour télécharger super rapidement",
    tip1: "Copiez le lien de partage dans Douyin & collez-le dans la boîte à gauche.",
    tip2: "Priorisez le Wi-Fi pour télécharger les vidéos de plus de 200MB.",
    tip3: "Ajoutez cette page aux favoris pour ne plus jamais vous soucier des filigranes.",
    
    // Dialog
    confirm: "Confirmer",
    cancel: "Annuler",
    close: "Fermer",
  },
  de: {
    // Badge
    badge: "Douyin Supreme Downloader · Kein Wasserzeichen · Für immer kostenlos",
    
    // Header
    title: "Douyin-Videos herunterladen",
    titleHighlight: "in maximaler Qualität",
    titleSuffix: "in Sekunden.",
    description: "Fügen Sie einfach den Douyin-Link ein (kurze URL funktioniert auch), das System entfernt automatisch das Wasserzeichen, wählt die höchste Bitrate aus und gibt Ihnen eine super scharfe MP4-Datei zurück.",
    
    // Status
    statusReady: "Bereit zum Herunterladen",
    statusAnalyzing: "Analysiere...",
    statusReadyToDownload: "Bereit zum Herunterladen",
    statusError: "Ein Fehler ist aufgetreten",
    
    // Form
    inputLabel: "Video-Link (Douyin / TikTok / Facebook)",
    inputPlaceholder: "https://v.douyin.com/... oder tiktok.com/... oder facebook.com/...",
    noWatermark: "Kein Wasserzeichen",
    downloadButton: "Jetzt herunterladen",
    processing: "Wird verarbeitet...",
    
    // Sample buttons
    sampleDouyin: "Douyin-Beispiel",
    sampleTiktok: "TikTok-Beispiel",
    sampleFacebook: "Facebook-Beispiel",
    sampleFillMessage: "Beispiel-Link eingefügt, klicken Sie auf Jetzt herunterladen!",
    
    // Messages
    pasteLinkFirst: "Bitte fügen Sie den Douyin-Link ein, bevor Sie herunterladen.",
    foundHighQuality: "Hochwertiges Video gefunden, kein Wasserzeichen!",
    unknownError: "Dieser Link kann nicht verarbeitet werden, bitte versuchen Sie es später erneut.",
    urlNotFound: "Keine URL im eingefügten Text gefunden. Bitte versuchen Sie es erneut!",
    analysisResult: "Analyseergebnis",
    videoInfo: "Video-Informationen",
    retry: "Wiederholen",
    analyzing: "Analysiere",
    
    // Drawer
    videoDetails: "Video-Details",
    noDescription: "Video hat keine Beschreibung",
    downloadMp4: "MP4-Datei ohne Wasserzeichen herunterladen",
    processedAt: "Verarbeitet um:",
    processedInfo: "Download-Link verwendet nur offizielle Quellen von Douyin, sicher und privat.",
    
    // History
    historyTitle: "Verlauf",
    historyVideo: "Video",
    historyAnalyzed: "Videos analysiert",
    historyEmpty: "Noch keine Videos",
    historyError: "Verlauf kann nicht geladen werden",
    historyLoading: "Lädt...",
    historyDelete: "Löschen",
    historyDeleteConfirm: "Sind Sie sicher, dass Sie dieses Video löschen möchten?",
    historyDeleteSuccess: "Video gelöscht",
    historyDeleteError: "Video kann nicht gelöscht werden",
    
    // Video info
    video: "Video",
    unknown: "Unbekannt",
    author: "Autor",
    duration: "Dauer",
    resolution: "Auflösung",
    size: "Größe",
    videoDescription: "Beschreibung",
    platform: "Plattform",
    bitrate: "Bitrate",
    music: "Musik",
    share: "Teilen",
    
    // Guide steps
    guideStep1Title: "1. Douyin öffnen",
    guideStep1Detail: "Klicken Sie auf die Schaltfläche Teilen (Pfeilsymbol) auf dem Video, das Ihnen gefällt.",
    guideStep2Title: "2. Link kopieren",
    guideStep2Detail: "Wählen Sie Link kopieren/复制链接 aus, um die Video-URL zu kopieren.",
    guideStep3Title: "3. In Download-Box einfügen",
    guideStep3Detail: "Fügen Sie den Link in die Box oben ein und klicken Sie auf Jetzt herunterladen.",
    
    // Error messages
    unsupportedPlatform: "Nur Links von Douyin, TikTok oder Facebook werden unterstützt.",
    undefinedError: "Ein nicht definierter Fehler ist aufgetreten.",
    loadHistoryError: "Verlauf kann nicht geladen werden",
    deleteVideoError: "Video kann nicht gelöscht werden",
    videoNoWatermark: "Douyin-Video ohne Wasserzeichen",
    
    // Aria labels
    closeDrawer: "Schublade schließen",
    viewAnalysisResult: "Analyseergebnis anzeigen",
    deleteVideo: "Video löschen",
    guideIllustration: "Bedienungsillustration: Video öffnen → Teilen klicken → Link kopieren.",
    
    // Features section
    whyDifferent: "Warum ist Douyin Supreme anders?",
    feature1: "Entfernt Wasserzeichen direkt von der offiziellen Douyin-Quelle, wählt die höchste Bitrate (bis zu 1080p/4K je nach Video).",
    feature2: "Erkennt automatisch kurze Links v.douyin.com und native App-Links, keine zusätzliche Installation erforderlich.",
    feature3: "Moderne \"neo-brutalist\" Standard-UI, optimiert für Desktop & Mobile.",
    
    // Tips section
    tipsTitle: "Tipps für super schnellen Download",
    tip1: "Kopieren Sie den Teilen-Link in Douyin & fügen Sie ihn in die Box links ein.",
    tip2: "Priorisieren Sie Wi-Fi für das Herunterladen von Videos über 200MB.",
    tip3: "Lesezeichen für diese Seite setzen, um sich nie wieder Sorgen um Wasserzeichen zu machen.",
    
    // Dialog
    confirm: "Bestätigen",
    cancel: "Abbrechen",
    close: "Schließen",
  },
  ja: {
    // Badge
    badge: "Douyin Supreme Downloader · 透かしなし · 永久無料",
    
    // Header
    title: "Douyin動画をダウンロード",
    titleHighlight: "最高品質で",
    titleSuffix: "数秒で。",
    description: "Douyinリンクを貼り付けるだけ（短いURLも可）、システムが自動的に透かしを削除し、最高のビットレートを選択して、超鮮明なMP4ファイルを返します。",
    
    // Status
    statusReady: "ダウンロード準備完了",
    statusAnalyzing: "分析中...",
    statusReadyToDownload: "ダウンロード準備完了",
    statusError: "エラーが発生しました",
    
    // Form
    inputLabel: "動画リンク（Douyin / TikTok / Facebook）",
    inputPlaceholder: "https://v.douyin.com/... または tiktok.com/... または facebook.com/...",
    noWatermark: "透かしなし",
    downloadButton: "今すぐダウンロード",
    processing: "処理中...",
    
    // Sample buttons
    sampleDouyin: "Douyinサンプル",
    sampleTiktok: "TikTokサンプル",
    sampleFacebook: "Facebookサンプル",
    sampleFillMessage: "サンプルリンクを貼り付けました。今すぐダウンロードをクリックしてください！",
    
    // Messages
    pasteLinkFirst: "ダウンロードする前にDouyinリンクを貼り付けてください。",
    foundHighQuality: "高品質の動画が見つかりました、透かしなし！",
    unknownError: "このリンクを処理できません。後でもう一度お試しください。",
    urlNotFound: "貼り付けたテキストにURLが見つかりませんでした。もう一度お試しください！",
    analysisResult: "分析結果",
    videoInfo: "動画情報",
    retry: "再試行",
    analyzing: "分析中",
    
    // Drawer
    videoDetails: "動画の詳細",
    noDescription: "動画に説明がありません",
    downloadMp4: "透かしなしMP4ファイルをダウンロード",
    processedAt: "処理日時:",
    processedInfo: "ダウンロードリンクはDouyinの公式ソースのみを使用し、安全でプライベートです。",
    
    // History
    historyTitle: "履歴",
    historyVideo: "動画",
    historyAnalyzed: "動画を分析済み",
    historyEmpty: "まだ動画がありません",
    historyError: "履歴を読み込めません",
    historyLoading: "読み込み中...",
    historyDelete: "削除",
    historyDeleteConfirm: "この動画を削除してもよろしいですか？",
    historyDeleteSuccess: "動画を削除しました",
    historyDeleteError: "動画を削除できません",
    
    // Video info
    video: "動画",
    unknown: "不明",
    author: "作成者",
    duration: "時間",
    resolution: "解像度",
    size: "サイズ",
    videoDescription: "説明",
    platform: "プラットフォーム",
    bitrate: "ビットレート",
    music: "音楽",
    share: "共有",
    
    // Guide steps
    guideStep1Title: "1. Douyinを開く",
    guideStep1Detail: "お気に入りの動画の共有ボタン（矢印アイコン）をクリックします。",
    guideStep2Title: "2. リンクをコピー",
    guideStep2Detail: "リンクをコピー/复制链接を選択して動画URLをコピーします。",
    guideStep3Title: "3. ダウンロードボックスに貼り付け",
    guideStep3Detail: "上記のボックスにリンクを貼り付けて、今すぐダウンロードをクリックします。",
    
    // Error messages
    unsupportedPlatform: "Douyin、TikTok、またはFacebookのリンクのみサポートされています。",
    undefinedError: "未定義のエラーが発生しました。",
    loadHistoryError: "履歴を読み込めません",
    deleteVideoError: "動画を削除できません",
    videoNoWatermark: "透かしなしのDouyin動画",
    
    // Aria labels
    closeDrawer: "引き出しを閉じる",
    viewAnalysisResult: "分析結果を表示",
    deleteVideo: "動画を削除",
    guideIllustration: "操作の説明: 動画を開く → 共有をクリック → リンクをコピー。",
    
    // Features section
    whyDifferent: "なぜDouyin Supremeは違うのか？",
    feature1: "公式Douyinソースから直接透かしを削除し、最高のビットレート（動画に応じて1080p/4Kまで）を選択します。",
    feature2: "短縮リンクv.douyin.comとネイティブアプリリンクを自動認識し、追加のインストールは不要です。",
    feature3: "モダンな「ネオブルータリスト」標準UI、デスクトップ＆モバイルに最適化。",
    
    // Tips section
    tipsTitle: "超高速ダウンロードのコツ",
    tip1: "Douyinで共有リンクをコピーして、左側のボックスに貼り付けます。",
    tip2: "200MBを超える動画のダウンロードにはWi-Fiを優先してください。",
    tip3: "このページをブックマークして、透かしを心配する必要をなくします。",
    
    // Dialog
    confirm: "確認",
    cancel: "キャンセル",
    close: "閉じる",
  },
  ko: {
    // Badge
    badge: "Douyin Supreme Downloader · 워터마크 없음 · 영구 무료",
    
    // Header
    title: "Douyin 동영상 다운로드",
    titleHighlight: "최고 품질로",
    titleSuffix: "몇 초 만에.",
    description: "Douyin 링크를 붙여넣기만 하면 (짧은 URL도 가능), 시스템이 자동으로 워터마크를 제거하고, 가장 높은 비트레이트를 선택하여 초고화질 MP4 파일을 제공합니다.",
    
    // Status
    statusReady: "다운로드 준비됨",
    statusAnalyzing: "분석 중...",
    statusReadyToDownload: "다운로드 준비됨",
    statusError: "오류가 발생했습니다",
    
    // Form
    inputLabel: "동영상 링크 (Douyin / TikTok / Facebook)",
    inputPlaceholder: "https://v.douyin.com/... 또는 tiktok.com/... 또는 facebook.com/...",
    noWatermark: "워터마크 없음",
    downloadButton: "지금 다운로드",
    processing: "처리 중...",
    
    // Sample buttons
    sampleDouyin: "Douyin 샘플",
    sampleTiktok: "TikTok 샘플",
    sampleFacebook: "Facebook 샘플",
    sampleFillMessage: "샘플 링크를 붙여넣었습니다. 지금 다운로드를 클릭하세요!",
    
    // Messages
    pasteLinkFirst: "다운로드하기 전에 Douyin 링크를 붙여넣어 주세요.",
    foundHighQuality: "고품질 동영상을 찾았습니다, 워터마크 없음!",
    unknownError: "이 링크를 처리할 수 없습니다. 나중에 다시 시도해 주세요.",
    urlNotFound: "붙여넣은 텍스트에서 URL을 찾을 수 없습니다. 다시 시도해 주세요!",
    analysisResult: "분석 결과",
    videoInfo: "동영상 정보",
    retry: "다시 시도",
    analyzing: "분석 중",
    
    // Drawer
    videoDetails: "동영상 세부정보",
    noDescription: "동영상에 설명이 없습니다",
    downloadMp4: "워터마크 없는 MP4 파일 다운로드",
    processedAt: "처리 시간:",
    processedInfo: "다운로드 링크는 Douyin의 공식 소스만 사용하며 안전하고 비공개입니다.",
    
    // History
    historyTitle: "기록",
    historyVideo: "동영상",
    historyAnalyzed: "동영상 분석됨",
    historyEmpty: "아직 동영상이 없습니다",
    historyError: "기록을 불러올 수 없습니다",
    historyLoading: "로딩 중...",
    historyDelete: "삭제",
    historyDeleteConfirm: "이 동영상을 삭제하시겠습니까?",
    historyDeleteSuccess: "동영상이 삭제되었습니다",
    historyDeleteError: "동영상을 삭제할 수 없습니다",
    
    // Video info
    video: "동영상",
    unknown: "알 수 없음",
    author: "작성자",
    duration: "재생 시간",
    resolution: "해상도",
    size: "크기",
    videoDescription: "설명",
    platform: "플랫폼",
    bitrate: "비트레이트",
    music: "음악",
    share: "공유",
    
    // Guide steps
    guideStep1Title: "1. Douyin 열기",
    guideStep1Detail: "좋아하는 동영상의 공유 버튼(화살표 아이콘)을 클릭합니다.",
    guideStep2Title: "2. 링크 복사",
    guideStep2Detail: "링크 복사/复制链接를 선택하여 동영상 URL을 복사합니다.",
    guideStep3Title: "3. 다운로드 상자에 붙여넣기",
    guideStep3Detail: "위 상자에 링크를 붙여넣고 지금 다운로드를 클릭합니다.",
    
    // Error messages
    unsupportedPlatform: "Douyin, TikTok 또는 Facebook 링크만 지원됩니다.",
    undefinedError: "정의되지 않은 오류가 발생했습니다.",
    loadHistoryError: "기록을 불러올 수 없습니다",
    deleteVideoError: "동영상을 삭제할 수 없습니다",
    videoNoWatermark: "워터마크 없는 Douyin 동영상",
    
    // Aria labels
    closeDrawer: "서랍 닫기",
    viewAnalysisResult: "분석 결과 보기",
    deleteVideo: "동영상 삭제",
    guideIllustration: "작업 설명: 동영상 열기 → 공유 클릭 → 링크 복사.",
    
    // Features section
    whyDifferent: "왜 Douyin Supreme가 다른가요?",
    feature1: "공식 Douyin 소스에서 직접 워터마크를 제거하고, 최고 비트레이트(동영상에 따라 1080p/4K까지)를 선택합니다.",
    feature2: "짧은 링크 v.douyin.com과 네이티브 앱 링크를 자동으로 인식하며, 추가 설치가 필요 없습니다.",
    feature3: "현대적인 \"네오 브루탈리스트\" 표준 UI, 데스크톱 및 모바일에 최적화.",
    
    // Tips section
    tipsTitle: "초고속 다운로드 팁",
    tip1: "Douyin에서 공유 링크를 복사하여 왼쪽 상자에 붙여넣으세요.",
    tip2: "200MB 이상의 동영상 다운로드에는 Wi-Fi를 우선 사용하세요.",
    tip3: "이 페이지를 북마크하여 더 이상 워터마크를 걱정하지 마세요.",
    
    // Dialog
    confirm: "확인",
    cancel: "취소",
    close: "닫기",
  },
  zh: {
    // Badge
    badge: "Douyin Supreme Downloader · 无水印 · 永久免费",
    
    // Header
    title: "下载抖音视频",
    titleHighlight: "最高画质",
    titleSuffix: "几秒钟完成。",
    description: "只需粘贴抖音链接（短链接也可以），系统会自动去除水印，选择最高比特率并返回超清晰的MP4文件。",
    
    // Status
    statusReady: "准备下载",
    statusAnalyzing: "分析中...",
    statusReadyToDownload: "准备下载",
    statusError: "发生错误",
    
    // Form
    inputLabel: "视频链接 (抖音 / TikTok / Facebook)",
    inputPlaceholder: "https://v.douyin.com/... 或 tiktok.com/... 或 facebook.com/...",
    noWatermark: "无水印",
    downloadButton: "立即下载",
    processing: "处理中...",
    
    // Sample buttons
    sampleDouyin: "抖音示例",
    sampleTiktok: "TikTok示例",
    sampleFacebook: "Facebook示例",
    sampleFillMessage: "示例链接已粘贴，点击立即下载！",
    
    // Messages
    pasteLinkFirst: "请在下载前粘贴抖音链接。",
    foundHighQuality: "找到高质量视频，无水印！",
    unknownError: "无法处理此链接，请稍后重试。",
    urlNotFound: "在粘贴的文本中未找到URL。请重试！",
    analysisResult: "分析结果",
    videoInfo: "视频信息",
    retry: "重试",
    analyzing: "分析中",
    
    // Drawer
    videoDetails: "视频详情",
    noDescription: "视频没有描述",
    downloadMp4: "下载无水印MP4文件",
    processedAt: "处理时间:",
    processedInfo: "下载链接仅使用抖音官方来源，安全且私密。",
    
    // History
    historyTitle: "历史记录",
    historyVideo: "视频",
    historyAnalyzed: "个视频已分析",
    historyEmpty: "还没有视频",
    historyError: "无法加载历史记录",
    historyLoading: "加载中...",
    historyDelete: "删除",
    historyDeleteConfirm: "您确定要删除此视频吗？",
    historyDeleteSuccess: "视频已删除",
    historyDeleteError: "无法删除视频",
    
    // Video info
    video: "视频",
    unknown: "未知",
    author: "作者",
    duration: "时长",
    resolution: "分辨率",
    size: "大小",
    videoDescription: "描述",
    platform: "平台",
    bitrate: "比特率",
    music: "音乐",
    share: "分享",
    
    // Guide steps
    guideStep1Title: "1. 打开抖音",
    guideStep1Detail: "点击您喜欢的视频上的分享按钮（箭头图标）。",
    guideStep2Title: "2. 复制链接",
    guideStep2Detail: "选择复制链接/复制链接以复制视频URL。",
    guideStep3Title: "3. 粘贴到下载框",
    guideStep3Detail: "将链接粘贴到上面的框中，然后点击立即下载。",
    
    // Error messages
    unsupportedPlatform: "仅支持来自抖音、TikTok或Facebook的链接。",
    undefinedError: "发生未定义的错误。",
    loadHistoryError: "无法加载历史记录",
    deleteVideoError: "无法删除视频",
    videoNoWatermark: "抖音无水印视频",
    
    // Aria labels
    closeDrawer: "关闭抽屉",
    viewAnalysisResult: "查看分析结果",
    deleteVideo: "删除视频",
    guideIllustration: "操作说明：打开视频 → 点击分享 → 复制链接。",
    
    // Features section
    whyDifferent: "为什么Douyin Supreme与众不同？",
    feature1: "直接从官方抖音源去除水印，选择最高比特率（根据视频可达1080p/4K）。",
    feature2: "自动识别短链接v.douyin.com和原生应用链接，无需安装任何额外内容。",
    feature3: "现代\"新粗野主义\"标准UI，针对桌面和移动设备优化。",
    
    // Tips section
    tipsTitle: "超快速下载技巧",
    tip1: "在抖音中复制分享链接并粘贴到左侧框中。",
    tip2: "优先使用Wi-Fi下载超过200MB的视频。",
    tip3: "收藏此页面，再也不用担心水印了。",
    
    // Dialog
    confirm: "确认",
    cancel: "取消",
    close: "关闭",
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations.vi[key];
}
