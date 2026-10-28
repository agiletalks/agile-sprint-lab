# Agile Sprint Lab｜HTML 投影逐頁開發規格

版本：v1.1｜日期：2026-10-28｜對象：視覺設計、前端開發、工作坊引導者

## 1. 目的與範圍

製作一套現場可操作、可離線使用的 HTML 工作坊投影。參與者抬頭即可理解目前步驟、活動原理、期待行為、產出與剩餘時間。交付形式為單一 HTML，將 Logo、樣式、腳本及內容資料內嵌，無網路仍可運作。

本規格為開發文件，不是已完成的 HTML。內容以提供的《Agile Sprint Lab — 120-Minute Spoken Script》為流程依據，總時長 120 分鐘。本次明確不建立、不顯示 Opening、Diverging、Organizing、Converging、Closing 的對應，也不使用其他五階段標籤。只顯示「步驟名稱、步驟編號、子活動名稱」。已核讀的口語稿本身包含五階段名稱；這是投影呈現的刻意取捨，不代表來源缺漏，也不據此新增階段導航。

講稿中一個步驟內有不同活動時，拆成數頁；步驟倒數跨頁延續，子活動倒數另行呈現。頁碼與步驟編號是不同欄位。

規格含 P00 待機頁及 P01–P25 正式頁，共 26 頁。正式頁總預設時間 120 分鐘。細部時間切分是本規格的開發預設，保留引導者現場調整能力。

## 2. 已知資料與內容決策

| 項目 | 採用規則 |
|---|---|
| 主持人 | Percy Hsu；主要顯示 Percy，不加入未提供的中文姓名 |
| 聯絡信箱 | agiletalks@gmail.com |
| Logo | 已收到使用者本次上傳原圖（1231 × 1277），以 projection/assets/agility-logo.jpg 原 bytes 保存；不得重畫、拉伸、裁切標誌、替換文字或移除做舊效果 |
| 個人卡片 | Introduction Card、Challenge Card、Acceptance Criteria Card |
| 小組卡片 | DoR Card、DoD Card |
| AC 的呈現 | 依使用者目前實際物料，採獨立 Acceptance Criteria Card；取代講稿「寫在挑戰卡背面」的描述 |
| 人數 | 預設每組 4–5 人，設為可修改內容參數，不寫死於圖像 |
| 語言 | 投影英文為主、繁體中文輔助；小組自訂可共同參與的語言；跨組分享以簡單英文互助 |
| 海報 | 已有手繪海報，但尚未提供照片；不自行推測其內容、配色或階段標法 |
| 上傳網站 | 未提供實際網址；預設隱藏 QR Code 與上傳指令，以實體海報與拍照保存完成流程 |
| 引導者照片 | 未提供，不放占位人像或 AI 人像 |
| 個人簡介 | PDF 可核實 Percy Hsu 與 Agile Coach；其餘經歷、角色與資格保留為待確認資料，預設不投影，不推論為不存在 |

AC（Acceptance Criteria）：某一個挑戰特定的驗收條件。DoR（Definition of Ready）：本工作坊判斷挑戰是否足以開始的共同檢查。DoD（Definition of Done）：本工作坊判斷每份成果是否完成的共同標準。文案明確說明 DoR 為部分敏捷團隊採用的實務，避免表述成 Scrum 必要構件；也不將 27 分鐘活動宣稱為完整 Scrum Sprint。

### 2.1 已核讀來源與口語同步

內容來源為使用者於本對話提供的 `Agile_Sprint_Lab_Speaking_Script.pdf`，共 9 頁。13 個步驟及起訖時間已與第 5 節核對一致；不依賴附件暫存路徑執行 HTML。

- PDF 第 3 頁的「On the back」在本場應改說：Write 1–2 acceptance criteria on your separate AC Card. Keep it paired with your Challenge Card. / 在獨立 AC 卡寫下 1–2 項驗收條件，並與挑戰卡配對。
- PDF 第 7 頁的「switch halfway through」在本場應改說：We will switch hosts after the first five minutes. / 第一輪五分鐘後更換留守者。第二輪七分鐘，最後三分鐘回組回應回饋。
- 未設定上傳網址時，口頭指示也只說展示海報、拍照保存，不引導尋找投影片上的上傳說明。
- 以上為本規格的現場口語替換指示；本次不修改原始 PDF。

### 2.2 延伸簡介待確認草稿（非預設投影文案）

保留 v1.0 的資料供確認後使用；下列內容不是由本次 PDF 核實的事實，不隨 P02 自動顯示：

- 額外角色：Facilitator · Trainer / 引導師・專業講師。
- Helps teams improve collaboration and ways of working. / 協助團隊改善跨部門協作與工作方式。
- Works with Agile transformation, design thinking, and service design. / 專注敏捷轉型、設計思考與服務設計。
- Explores AI applications and learning design with teams. / 與團隊探索 AI 應用與教學設計。
- Management 3.0 Facilitator / Management 3.0 授證講師。

## 3. 品牌與視覺系統

### 3.1 色彩

以下為依已提供 Logo 視覺採用的介面建議色票，不宣稱是既有官方品牌色碼。若之後提供正式品牌規範，以正式規範覆蓋。

| Token | 色碼 | 用途 |
|---|---|---|
| brand-orange | #FF5A00 | 主視覺色塊、目前步驟、進度條、重要圖形 |
| ink | #151515 | 主文字、深色背景、橘底文字 |
| paper | #FFFFFF | 主背景、深底文字、Logo 底板 |
| surface | #F5F5F3 | 次要區塊底色 |
| muted | #525252 | 輔助文字 |
| line | #D9D9D6 | 分隔線 |
| vote-red | #B42318 | 紅點投票的語意標記 |
| vote-green | #237A3B | 綠點投票的語意標記 |

品牌以橘、黑、白為主；投票頁保留活動必需的紅綠色，並同時加 R/G、文字與不同圖示，避免只靠顏色辨識。橘色區塊使用黑字；一般文字不要用白字直接配亮橘底。介面不模仿 Logo 的做舊紋理，保留清楚的資訊底面。

### 3.2 Logo 規則

- P00、P01、P02、P25 可顯著放大；其他頁僅在左上品牌區使用小型 Logo。
- 已核對 Logo 原圖具有白底；深色頁面須保留其完整白色底板，不用混合模式假造透明。
- object-fit: contain；保留原比例，四周留至少顯示寬度 10% 的安全空間。
- 原始素材：本次上傳的「貼上的圖片 1.jpg」，保存為 projection/assets/agility-logo.jpg；原圖 bytes 內嵌至 HTML，不依賴附件暫存路徑。此原圖取代先前待補的 IMG_5971.jpeg 檔名記錄。
- Logo 是品牌圖像，不能讓其高度擠壓操作指引；一般活動頁 Logo 最大約 96 × 96 邏輯像素。

### 3.3 畫布、字體與層級

- 以 1920 × 1080、16:9 作邏輯畫布；支援 1280 × 720 與 1920 × 1080。
- 整頁等比縮放，不對內容做水平捲動；非 16:9 顯示器以黑邊留白保留完整畫面。
- 基準安全邊界：左右 80、上下 48 邏輯像素。
- 系統字體：Arial / Helvetica / PingFang TC / Microsoft JhengHei / sans-serif。不得依賴線上字型。
- 英文標題 56–64 px；中文標題 30–34 px；英文行動 36–40 px；中文行動 26–28 px；原理與產出英文至少 28 px、中文至少 24 px。英文倒數 112–144 px，採等寬數字。
- 英文先、中文後，每項中英成對；同語言文案不要重複出現在數個區塊。
- 以上字級均指 1920 × 1080 邏輯畫布；1280 × 720 等比縮放為 2/3，不另以實體像素下限放大而造成溢出。
- 頁面超量時先移除重複的輔助文字、縮短範例或調整區塊比例，不自動將字縮到低於以上基準。第一版維持 26 頁；若仍需拆頁，另行修訂頁面表、穩定 ID 與時間分配，不由渲染器臨時自動分頁。
- 先驗證 P00、P05、P08、P13、P14、P17 的代表版面，涵蓋封面、一般活動、雙卡、長投票規則、矩陣與實作提醒。雙語模式須保留核心行動、工具與計時；P08 範例可縮為一句或放入控制台備註，矩陣軸名不可截斷。
- 不使用閃爍、持續動畫或自動跑馬燈。換頁可用 120–180 ms 淡入；遵守 prefers-reduced-motion。

## 4. 共用版型

### T0｜待機／封面

中央為 Logo、工作坊標題與 Percy。底部可放日期、時間、信箱。無行動頁三欄，無倒數。

### T1｜人物／概覽／結語

左側 65% 為文字或流程，右側 35% 為品牌圖像或倒數。正式頁仍保留步驟、目前頁與剩餘時間。

### T2｜一般活動頁

- 上方約 15%：小 Logo、Step 04 / 13、步驟英文與中文名稱、子活動名稱。
- 中間約 65%：左 70% 為「Do now 現在請做」最多三項；右 30% 為大型「This activity 本活動」倒數與使用卡片標記。
- 下方約 20%：一行「Why 原理」、一行「Output 產出」、小型「Step remaining 步驟剩餘」與「Page 頁碼」。
- 原理、產出與工具為固定位置。沒有使用卡片時顯示 Group discussion / 小組討論等實際模式，不顯示不存在的卡片。
- 多子頁的步驟，下方呈現該步驟的子活動名稱列，只高亮目前子活動。

### T3｜標準／投票／實作專用頁

沿用 T2 邊界與計時區，可將行動區改成檢查清單、投票矩陣或循環流程。原理、產出與工具位置不變。所有圖形均以 HTML/CSS/SVG 製作，文字仍可編輯。

## 5. 正式頁與時間總表

時間為工作坊開始後的累計分鐘；P00 不計入。分頁停留時間是預設配額，不含現場暫停與加減時間。

| 頁碼 | 步驟 | 頁面 | 分鐘 | 累計區間 |
|---|---:|---|---:|---|
| P00 | — | 會前待機 | 0 | — |
| P01 | 01 | 歡迎與主題 | 2 | 00–02 |
| P02 | 01 | 認識 Percy | 2 | 02–04 |
| P03 | 01 | 今天如何一起工作 | 3 | 04–07 |
| P04 | 02 | 填寫 Introduction Card | 3 | 07–10 |
| P05 | 02 | 技能交流市集 | 5 | 10–15 |
| P06 | 02 | 自主組隊 | 4 | 15–19 |
| P07 | 03 | 角色與合作約定 | 5 | 19–24 |
| P08 | 04 | 理解挑戰與驗收條件 | 2 | 24–26 |
| P09 | 04 | 個人安靜書寫 | 3 | 26–29 |
| P10 | 04 | 用 DoR 檢查 | 4 | 29–33 |
| P11 | 05 | 分享與釐清 | 14 | 33–47 |
| P12 | 06 | 用 DoD 理解完成標準 | 3 | 47–50 |
| P13 | 07 | 紅綠點投票 | 2 | 50–52 |
| P14 | 07 | 放入挑戰矩陣 | 3 | 52–55 |
| P15 | 07 | 決定優先順序 | 3 | 55–58 |
| P16 | 08 | 第一題的目標與做法 | 5 | 58–63 |
| P17 | 09 | 逐題實作 | 27 | 63–90 |
| P18 | 10 | 整理成果與展示準備 | 5 | 90–95 |
| P19 | 11 | 成果交流：第一輪 | 5 | 95–100 |
| P20 | 11 | 成果交流：換手參觀 | 7 | 100–107 |
| P21 | 11 | 回組回應回饋 | 3 | 107–110 |
| P22 | 12 | 個人反思 | 1 | 110–111 |
| P23 | 12 | 團隊回顧 | 3 | 111–114 |
| P24 | 12 | 回饋牆 | 3 | 114–117 |
| P25 | 13 | 帶一項實務回去 | 3 | 117–120 |

所有頁面配額均包含口頭說明、移動、貼票與換手等轉場，不另加未列出的時間。控制台開啟、操作換頁所花的實際時間仍會反映在全場經過與預估結束時間中。

P04 的 3 分鐘含約 1 分鐘說明、2 分鐘填卡；此頁倒數顯示整頁活動時間，內文另標示「2 minutes to write / 書寫 2 分鐘」。P19–P21 的 5/7/3 分鐘切分將講稿中的「第一輪五分鐘、換手、最後三分鐘回組」具體化；若現場調整，使用控制台修改，不自行顯示為兩輪等長。

### 5.1 現場時間調整原則（控制台備註）

120 分鐘未另列緩衝。若落後，優先縮短 P02 個人介紹、P11 分享後的延伸討論，或減少 P17 進入下一題的範圍；透過調時明確反映，不暗中扣除其他頁。保留每位組員的分享機會、AC／DoD 檢查、回組回應與合作回顧。P22 的一分鐘安靜反思不作優先壓縮項目。這些是引導者的調整選項，系統不自動縮短活動。

## 6. 逐頁內容與互動

以下中英文字為可直接置入的投影文案。每頁的「完成條件」同時是視覺檢核與流程驗收依據；不是新增另一套實體卡片。未列出的共用元件依第 4 節繼承。

### P00｜會前待機

- 版型：T0；無倒數、無步驟。
- 主標：Agile Sprint Lab
- 副標：Working together on our challenges in the age of AI / 一起面對 AI 時代的工作挑戰
- 主持：Percy Hsu｜Agile Coach；額外角色於確認後才由設定補入
- 場次：IAF Asia 2026 · Hangzhou｜1 Nov 2026 · 08:30–10:30；日期、地點、時間使用設定資料。
- 聯絡：agiletalks@gmail.com
- 視覺：白底、大 Logo、黑色標題、橘色短線；不放裝飾性背景圖。
- 操作：首次按「開始工作坊」進 P01，同時啟動全場計時與 P01 活動倒數。一般換頁到 P01 不自動啟動；在正式頁首次按開始則同步建立全場開始時間。已有本場進度時，P00 顯示「返回目前活動」與保留的活動頁，返回只定位、不啟動也不重設；細節依 7.1。
- 完成條件：入場者能辨識場次、主持人與活動名稱。

### P01｜Welcome / 歡迎

- Step 01 / 13；版型 T1；2 分鐘。
- 主標：Agile Sprint Lab / 敏捷實作工作坊
- 行動：Bring one real challenge from your work in the age of AI. / 帶入一個您在 AI 時代工作中真實遇到的挑戰。
- 原理：Experience selected Agile practices, then reflect on how to use them. / 先體驗敏捷實務，再思考如何應用。
- 產出：A practical response you can use or try. / 一份可以使用或嘗試的實務回應。
- 工具：Your experience / 您的工作經驗。
- 視覺：左側標題、主題與產出；右側 Logo，下方保留倒數。
- 完成條件：主題與預期成果可直接讀出，不將目的表述為一定完成 AI 系統或產品。

### P02｜Meet Percy / 認識 Percy

- Step 01 / 13；版型 T1；2 分鐘。
- 姓名：Percy Hsu
- 角色：Agile Coach / 敏捷教練。
- 已核實的工作坊連結：I share practical Agile elements that help teams work together. / 分享協助團隊合作的敏捷實務。
- 延伸簡介、Facilitator／Trainer 角色與 Management 3.0 資格：原規格有草稿，但本次 PDF 無法核實。先存於待確認資料，取得使用者確認後再啟用；不因資料缺少加入新經歷。
- 原理：Connect the workshop to the facilitator's practice. / 理解這場工作坊背後的實務背景。
- 產出：Know who is guiding today's experience. / 認識今天的引導者。
- 工具：Listening / 聆聽。
- 聯絡：agiletalks@gmail.com，完整顯示，不拆行。
- 視覺：文字占約 65%，Logo 占約 35%；尚無原圖時依 3.2 使用文字標題。不新增未提供的人像，不為填滿版面增加簡介文字。
- 完成條件：姓名、已核實角色、工作坊連結與信箱清楚可讀；未確認資格不投影。

### P03｜How we will work / 今天如何一起工作

- Step 01 / 13；版型 T1；3 分鐘。
- 行動：
  1. Work in teams of 4–5. / 每組 4–5 人合作。
  2. Use languages everyone in your team can follow. / 使用每位組員都能參與的語言。
  3. Share across teams in simple English; help each other translate. / 跨組以簡單英文交流，彼此協助翻譯。
- 原理：Make participation possible for everyone. / 讓每個人都能理解並參與。
- 產出：Shared expectations for participation. / 對參與方式有共同理解。
- 工具：Language agreement / 語言約定。
- 視覺：行動為主；下方可列五個中性動作節點：Form teams → Clarify → Choose → Create → Learn，中文為「組隊→釐清→選題→實作→學習」。這些僅為動作摘要，不作 Opening–Closing 階段標籤、不出現在後續進度導航。
- 完成條件：團隊內語言彈性與跨組英文分享原則都可見。

### P04｜Fill your Introduction Card / 填寫自我介紹卡

- Step 02 / 13；子活動 1 / 3；T2；3 分鐘。
- 行動：
  1. Write your preferred name and 1–2 strengths. / 寫下希望大家怎麼稱呼您，以及 1–2 項長處。
  2. List languages you can work in and your preferred discussion language. / 寫下可使用的語言與偏好的討論語言。
  3. Write clearly. You have 2 minutes to write. / 清楚書寫；填卡時間 2 分鐘。
- 範例一行：Listening · Asking questions · Organizing ideas / 傾聽・提問・整理想法。
- 原理：Make your strengths and language needs visible. / 讓彼此看見能力與語言需要。
- 產出：One completed Introduction Card per person. / 每人一張填妥的自我介紹卡。
- 工具：個人 Introduction Card。
- 視覺：卡片四欄示意「Name / Strengths / Working languages / Preferred language」；此為資訊示意，不仿製未提供的實體卡版面。
- 完成條件：卡片四項欄位齊全。

### P05｜Skills marketplace / 技能交流市集

- Step 02 / 13；子活動 2 / 3；T2；5 分鐘。
- 行動：
  1. Move around and meet at least 3 people. / 移動交流，至少認識三位夥伴。
  2. Share your strengths and language preferences. / 分享您的長處與語言偏好。
  3. Look for complementary strengths. / 尋找能相互補足的長處。
- 原理：Explore who you could work well with. / 探索可以如何與不同夥伴合作。
- 產出：At least 3 new connections and possible teammates. / 至少三次交流，找到可能合作的夥伴。
- 工具：Introduction Card。
- 視覺：大字「Meet at least 3 people / 至少認識三人」，其餘保持簡潔。
- 完成條件：交流對象數與交流內容皆可讀出。

### P06｜Choose your team / 自主組隊

- Step 02 / 13；子活動 3 / 3；T2；4 分鐘。
- 行動：
  1. Form a team of 4–5 and find a workspace. / 組成 4–5 人團隊，找到工作位置。
  2. Check that everyone can join the discussion. / 確認每個人都能參與討論。
  3. Agree how to share key points in English. / 約定如何用英文分享重點。
- 原理：Self-selection gives the team choice and shared responsibility. / 自主組隊帶來選擇權，也帶來共同責任。
- 產出：A team with a workable language arrangement. / 一個具備可行語言安排的團隊。
- 工具：Introduction Card。
- 完成條件：顯示組隊條件；提醒「Need a team? Ask Percy. / 需要組隊協助，請找 Percy。」

### P07｜Roles and agreements / 角色與合作約定

- Step 03 / 13；T2；5 分鐘。
- 行動：
  1. Choose a facilitator; agree who captures and shares the work. / 選出引導者，約定紀錄與分享責任。
  2. Agree on 2–3 ways to work well together, including language. / 訂定 2–3 項合作約定，包含語言安排。
  3. Write them where everyone can see them. / 寫在全組都看得到的位置。
- 原理：Make responsibilities and collaboration expectations explicit. / 說清楚責任與合作期待。
- 產出：Agreed roles and 2–3 visible working agreements. / 明確角色與 2–3 項可見的合作約定。
- 工具：Group notes / 小組紀錄；有實體角色 token 時才顯示其提示。
- 輔助：Facilitator: time, every voice, completion checks. / 引導者：顧時間、聽見每個人、協助完成檢查。
- 完成條件：不把引導者描述為單獨決策者或唯一發言者。

### P08｜Challenge and acceptance criteria / 挑戰與驗收條件

- Step 04 / 13；子活動 1 / 3；T3；2 分鐘。
- 行動：
  1. Describe one real situation, challenge, and impact. / 描述一個真實情境、挑戰與影響。
  2. State 1–2 conditions that would make a response useful. / 寫出讓回應對您有用的 1–2 項條件。
  3. Keep the two cards together. / 將兩張卡片配對放置。
- 原理：Acceptance criteria describe what useful means for this challenge. / 驗收條件說明這一題怎樣才算有用。
- 產出：Understand what to put on each card. / 理解兩張卡片各自要寫的內容。
- 工具：Challenge Card＋Acceptance Criteria Card。
- 視覺：兩張資訊示意並排；挑戰卡顯示 When I am… / The challenge I face is… / This affects my work by…；AC 卡顯示 A useful response would… / 有用的回應應能……。
- 範例：A short checklist to review an AI-generated workshop agenda. / 一份檢查 AI 生成工作坊議程的短清單。Criteria: include questions that reveal missing information. / 條件：包含可找出遺漏資訊的檢查問題。
- 完成條件：此頁是說明頁；倒數與工具仍保留。範例不得被誤認為每組必選題目。

### P09｜Write quietly / 個人安靜書寫

- Step 04 / 13；子活動 2 / 3；T2；3 分鐘。
- 行動：
  1. Complete your situation, challenge, and impact. / 完成情境、挑戰與影響。
  2. Write 1–2 acceptance criteria on your AC Card. / 在 AC 卡寫下 1–2 項驗收條件。
  3. Write your name or matching ID on both cards. / 兩張卡寫上相同姓名或配對編號。
- 原理：Quiet writing gives every person space before group discussion. / 先安靜書寫，讓每個人都有表達空間。
- 產出：One paired challenge and AC set per person. / 每人一組配對的挑戰卡與驗收條件卡。
- 工具：Challenge Card＋Acceptance Criteria Card。
- 視覺：大字 Quiet writing / 安靜書寫，不做打字動畫。
- 完成條件：同一組卡片有可辨識的配對方式。

### P10｜Check readiness / 用 DoR 檢查

- Step 04 / 13；子活動 3 / 3；T3；4 分鐘。
- 行動：
  1. Re-read your cards using the team's DoR Card. / 依小組 DoR Card 重讀自己的卡片。
  2. Clarify any missing context or unclear words. / 補充缺少的背景與不清楚的文字。
  3. Narrow the challenge if needed. / 必要時縮小挑戰範圍。
- 原理：Shared readiness checks help us start with enough understanding. / 共同的就緒檢查協助團隊帶著足夠理解開始。
- 產出：Cards clear enough to share and select. / 清楚到足以分享與選擇的卡片。
- 工具：個人 Challenge Card＋AC Card；小組 DoR Card。
- 視覺：三項檢查：Situation, challenge, impact are clear / 情境、挑戰、影響清楚；AC are understandable / 驗收條件可理解；Useful progress is possible today / 今天能有實質進展。
- 完成條件：用詞為「今天可推進」，不保證今天徹底解決。

### P11｜Share and clarify / 分享與釐清

- Step 05 / 13；T2；14 分鐘。
- 行動：
  1. Take turns: up to 2 minutes each to share your challenge and AC. / 輪流分享挑戰與 AC，每人最多 2 分鐘。
  2. Listen, then ask questions to understand. / 先聽，再提問理解。
  3. Improve the wording before choosing a challenge. / 先讓內容更清楚，再進入選題。
- 原理：Refinement adds useful detail for shared understanding and decisions. / 釐清與細化提供理解和決策所需的細節。
- 產出：Everyone has shared; every challenge is understood well enough to choose. / 每人都分享過，每題都清楚到足以選擇。
- 工具：Challenge Card＋AC Card＋DoR Card。
- 視覺：提醒「Clarify first / 先釐清」；倒數為整組活動 14 分鐘。可選的 2 分鐘發言計時只在引導者控制台，不取代主倒數，也不自動切換發言者。
- 完成條件：不要求每題在此階段已產生解法。

### P12｜What counts as done? / 什麼才算完成？

- Step 06 / 13；T3；3 分鐘。
- 行動：
  1. Review the team's DoD Card. / 一起確認小組 DoD Card。
  2. Include the challenge, AC, and solution on one readable poster. / 每張海報清楚呈現挑戰、AC 與解法。
  3. Show how the solution meets the AC. / 說明解法如何符合驗收條件。
- 原理：A shared Definition of Done makes completion visible. / 共同完成標準讓成果狀態可被理解。
- 產出：A shared standard for every completed poster. / 對每張完成海報有共同標準。
- 工具：DoD Card。
- 視覺：成果示意三欄 Challenge / AC / Solution；旁註 Usable or testable / 可以使用或嘗試。這是成果資訊結構，不強制重畫實體海報。
- 固定提醒：One challenge at a time. Start the next after this one is done. / 一次處理一題，完成後再開始下一題。
- 完成條件：清楚區分個別題目的 AC 與每份成果共同遵守的 DoD。

### P13｜Vote quietly / 安靜投票

- Step 07 / 13；子活動 1 / 3；T3；2 分鐘。
- 行動：
  1. Red: one dot on each challenge you have experienced, including your own. / 紅點：每個自己經歷過的挑戰各貼一點，可包含自己的題目。
  2. Green: one dot per person for your first choice today. / 綠點：每人只有一點，投給今天最想處理的題目。
  3. Vote quietly before discussing. / 先安靜投票，再討論。
- 原理：See shared experience and interest separately. / 分別看見共同經驗與處理意願。
- 產出：Red and green votes on the challenges. / 每題的紅、綠票數。
- 工具：Challenge Card＋AC Card、紅點與綠點貼紙。
- 視覺：紅 R＝Experienced / 經歷過；綠 G＝First choice / 優先選擇。兩種投票規則等大並列。
- 完成條件：不可誤寫成每人總共只有一個紅點；不可把紅點寫成問題嚴重程度。

### P14｜Map your challenges / 放入挑戰矩陣

- Step 07 / 13；子活動 2 / 3；T3；3 分鐘。
- 行動：
  1. Count red and green dots on each challenge. / 計算每題紅點與綠點數。
  2. Place each challenge at its matching counts. / 依票數將挑戰放在對應位置。
  3. Place ties side by side; keep each AC Card paired. / 同票並排，AC 卡保持配對。
- 原理：Make the voting pattern visible before deciding. / 決策前先看見票數分布。
- 產出：A matrix of shared experience and first choices. / 一張共同經驗與優先意願的挑戰矩陣。
- 工具：Challenge Card＋AC Card、矩陣海報。
- 視覺：X 軸 Red dots: shared experience / 紅點：共同經驗，向右增加；Y 軸 Green dots: first choices / 綠點：優先意願，向上增加。兩軸 0 至組員人數 N；N 由設定取得，實際每組不同時顯示 0、1、2…N 的通用示意並註記 N＝組員數，不假設所有組同人數。
- 完成條件：不自行加入四象限價值判斷、不用紅綠票相加為總分。

### P15｜Choose where to start / 決定從哪一題開始

- Step 07 / 13；子活動 3 / 3；T2；3 分鐘。
- 行動：
  1. Discuss the pattern, scope, and acceptance criteria. / 一起看分布、範圍與驗收條件。
  2. Agree on the first challenge and a possible order for the rest. / 決定第一題與其他題目的暫定順序。
  3. If tied, choose where useful progress is possible in today's time. / 難以取捨時，選擇今天能有實質進展的題目。
- 原理：Votes inform the team's decision. / 票數提供決策依據，團隊共同做選擇。
- 產出：One first challenge and a visible remaining queue. / 一個優先挑戰與可見的待處理題目。
- 工具：挑戰矩陣、Challenge Card＋AC Card。
- 完成條件：不自動宣告最高票必須獲選；後續順序可依學習調整。

### P16｜Plan the first challenge / 第一題的目標與做法

- Step 08 / 13；T2；5 分鐘。
- 行動：
  1. Why: what useful result do we want? / 為何：希望得到什麼有用結果？
  2. What: what will go on the poster? / 做什麼：海報要呈現什麼？
  3. How: how will we use the time and each person's contribution? / 如何：怎麼用時間，讓每個人貢獻？
- 原理：Shared purpose, scope, and approach help the team begin together. / 共同目的、範圍與做法協助團隊一起開始。
- 產出：A first goal, an approach, and someone to capture the result. / 第一題的目標、做法與紀錄安排。
- 工具：已選 Challenge Card＋AC Card、DoD Card。
- 視覺：Why / What / How 三項依序呈現；所有文案進頁時即可見，不逐點動畫。
- 完成條件：不是重新填 Introduction Card；貢獻聚焦本題。

### P17｜Work one challenge at a time / 一次完成一個挑戰

- Step 09 / 13；T3；27 分鐘。
- 行動：
  1. Develop a useful solution and capture it on one poster. / 發展有用的解法，整理成一張海報。
  2. Check the AC and DoD together. / 一起檢查 AC 與 DoD。
  3. When done, check time, choose the next challenge, and repeat. / 完成後確認時間，再選下一題並重複。
- 原理：Focus on completing useful work before starting more. / 先完成有用成果，再開始更多工作。
- 產出：Completed posters; clearly marked work in progress if unfinished. / 完成的成果海報；未完成者清楚標示進行中。
- 工具：Challenge Card＋AC Card＋DoD Card、成果海報。
- 視覺：主區為「Work → Capture → Check → Next if time allows / 實作→記錄→檢查→時間允許再選下一題」循環；AC 與 DoD 提醒固定可見，右側超大倒數。
- 剩餘 10 分鐘提醒：Check your AC. Decide how to use the remaining time. / 對照驗收條件，決定剩餘時間如何運用。
- 剩餘 3 分鐘提醒：Finish and capture the current challenge. Mark unfinished work clearly. / 聚焦完成目前題目並記錄，未完成請標示狀態。
- 特殊狀態：提醒以底部固定高度提示帶取代一般輔助句，保留核心行動、不用遮罩。引導者可關閉。到時不強制宣告所有作品完成。
- 完成條件：無海報數量競賽、無要求所有題目都完成。

### P18｜Prepare your posters / 整理成果與展示準備

- Step 10 / 13；T2；5 分鐘。
- 行動：
  1. Check readability, team name, challenge, AC, solution, and status. / 檢查可讀性、組名、挑戰、AC、解法與狀態。
  2. Display the posters and photograph completed work. / 展示海報，拍照保存完成成果。
  3. Choose one host for the first gallery round. / 選一位第一輪留守解說者。
- 原理：Visible results make review possible. / 成果可見，才能一起檢視。
- 產出：Displayed posters, saved photos, and a first-round host. / 展示好的海報、保存的照片與第一輪解說者。
- 工具：成果海報、手機。
- 條件區塊：只有設定有效 uploadUrl 時才顯示「Upload photos if available. / 可連線時上傳照片。」及 QR Code；網址缺省時完全移除此區塊，版面自動回收空間。
- 完成條件：上傳不是參與成果交流的必要條件；完成與進行中作品標示不同。

### P19｜Gallery walk: round 1 / 成果交流：第一輪

- Step 11 / 13；子活動 1 / 3；T2；5 分鐘。
- 行動：
  1. One host stays; others visit other teams. / 一人留守解說，其餘組員參觀。
  2. Read the challenge, AC, and solution; ask to understand. / 閱讀挑戰、AC 與解法，提問理解。
  3. Leave a useful observation, question, or suggestion. / 留下有用的觀察、問題或建議。
- 原理：Inspect results together to learn what is useful. / 一起檢視成果，理解其價值。
- 產出：Feedback notes on the posters. / 海報上的回饋便條。
- 工具：成果海報、便條紙；簡單英文與翻譯互助。
- 完成條件：留守與參觀分工明確；不把參觀變成上台逐組報告。

### P20｜Switch hosts / 換手參觀

- Step 11 / 13；子活動 2 / 3；T2；7 分鐘。
- 行動：
  1. Switch hosts so the first host can visit. / 更換留守者，讓第一輪解說者也能參觀。
  2. Continue visiting and leaving clear feedback. / 繼續參觀並留下清楚回饋。
  3. Help each other communicate in simple English. / 以簡單英文互助交流。
- 原理：Everyone gets a chance to learn across teams. / 每個人都有跨組學習的機會。
- 產出：A chance for everyone to visit and more feedback. / 全員皆有參觀機會，持續蒐集回饋。
- 工具：成果海報、便條紙。
- 視覺：主標「Switch hosts now / 現在換手」醒目；進頁不播放音效，換手由引導者提醒。
- 完成條件：第二輪預設七分鐘，倒數與內文一致。

### P21｜Respond to feedback / 回組回應回饋

- Step 11 / 13；子活動 3 / 3；T2；3 分鐘。
- 行動：
  1. Return to your team and read the feedback. / 回到小組，閱讀回饋。
  2. Discuss what others noticed. / 討論其他人看見了什麼。
  3. Choose what to clarify, improve, or test next. / 決定接下來要釐清、改善或驗證什麼。
- 原理：Review helps decide what to do next. / 檢視成果協助決定下一步。
- 產出：A next step informed by feedback. / 一個回應回饋的下一步。
- 工具：成果海報、回饋便條。
- 完成條件：聚焦成果及其後續，不混入下一步的團隊合作回顧。

### P22｜Reflect quietly / 個人安靜反思

- Step 12 / 13；子活動 1 / 3；T2；1 分鐘。
- 行動：
  1. What helped us work well together? / 什麼幫助我們合作得更好？
  2. What would we change next time? / 下次我們會改變什麼？
- 原理：Individual reflection creates space before group discussion. / 先個人反思，再進入團隊對話。
- 產出：Your observations about the team's way of working. / 個人對團隊合作方式的觀察。
- 工具：Quiet reflection / 安靜反思。
- 視覺：兩個問題大字呈現，留白充分，不強制新增書寫物料。
- 完成條件：反思焦點是合作過程。

### P23｜Team retrospective / 團隊回顧

- Step 12 / 13；子活動 2 / 3；T2；3 分鐘。
- 行動：
  1. Share what helped and what you would change. / 分享有幫助的做法與想改變的地方。
  2. Hear from everyone. / 聽見每一位組員。
  3. Choose one change to try next time. / 選定下次要嘗試的一項改變。
- 原理：Turn reflection into a small improvement experiment. / 把反思轉成一個小型改善嘗試。
- 產出：One agreed change for future collaboration. / 一項共同同意的合作改善。
- 工具：Group notes / 小組紀錄。
- 完成條件：產出是一項可嘗試的改變，不要求完整改善專案計畫。

### P24｜Feedback wall / 回饋牆

- Step 12 / 13；子活動 3 / 3；T3；3 分鐘。
- 行動：
  1. Note 1: a message for Percy—what helped or could improve? / 第一張：給 Percy 的回饋，什麼有幫助、什麼可改善？
  2. Note 2: one practice you will take back, and where you will try it. / 第二張：要帶走的一項實務，以及打算在哪裡嘗試。
  3. Post each note in the matching section. / 分別貼到對應區域。
- 原理：Capture feedback and connect learning to real work. / 留下回饋，並將學習連結到工作。
- 產出：Two short notes per person. / 每人兩張短便條。
- 工具：便條紙、回饋牆。
- 視覺：兩個欄位 Feedback for Percy / 給 Percy 的回饋、My next experiment / 我的下一次嘗試。文字與實體牆標題須一致；如實體牆另有命名，於資料中覆蓋。
- 語言註記：Use a language you are comfortable with; add short English if possible. / 可使用熟悉的語言，方便時補上簡短英文。
- 完成條件：兩張便條的用途清楚區分。

### P25｜Take one practice with you / 帶一項實務回去

- Step 13 / 13；T1；3 分鐘。
- 主標：What will you try next? / 下一次，您想嘗試什麼？
- 行動：Choose one practice and a real place to try it. / 選一項實務，連結到一個真實的應用情境。
- 原理：Adapt each practice to the people and situation. / 依參與者與情境調整每一項實務。
- 產出：One intention for your next workshop or team session. / 一個下次工作坊或團隊活動中的行動意圖。
- 工具：Your next session / 您的下一場活動。
- 結語：Thank you for your ideas, participation, and support. / 謝謝各位的想法、參與與彼此支持。
- 聯絡：Percy Hsu｜agiletalks@gmail.com；顯示公司 Logo。
- 視覺：白底配黑字與橘色強調；信箱至少 36 px，保持完整一行。三分鐘結束後留在此頁，倒數可由引導者隱藏，保留聯絡資訊。
- 完成條件：email 正確可讀，不放未提供的社群、網站或報名連結。

## 7. 前端互動與計時規格

### 7.1 計時狀態

計時狀態與流程安排分開保存。每個正式頁有 `timerState`：idle（未開始）、running（進行中）、paused（暫停）、expired（到時）；另有 `planState`：scheduled（仍排入流程）、deferred（已略過待處理）、completed（已結束）。P00 不具有活動倒數。只有目前正式頁允許 running。

| 計時狀態 | 參與者畫面 | 允許操作 |
|---|---|---|
| idle | 目前配額＋Ready / 尚未開始 | 開始、換頁、調時、重設 |
| running | MM:SS 即時倒數 | 暫停、換頁、調時、重設 |
| paused | 保留剩餘數字＋Paused / 已暫停 | 繼續、換頁、調時、重設 |
| expired | 00:00＋Time is up / 時間到 | 加時、換頁、重設 |

#### 開始、換頁與略過

- 全場開始時間 `workshopStartedAt` 首次建立後不因換頁、返回 P00、重設單頁或重新整理而改變；只有「清除本場進度」會清除。
- P00 首次按「開始工作坊」：進 P01，啟動其倒數並建立全場開始時間。P00 的 Space 執行相同操作。已有本場進度時，按鈕與 Space 均只返回 `lastActivityPage`，保持暫停或到時狀態，不重新開始。
- 直接導航到正式頁不計時。首次在任一正式頁按開始／Space，或執行「下一頁並開始」，若尚無全場開始時間，則同步建立；早於該頁而未執行的頁面列為 deferred。
- 普通上一頁、下一頁與索引跳轉：先按時間戳結算離開頁並暫停，保存其剩餘。目標頁保留自己的計時狀態與剩餘，原為 running 者轉 paused；首次進入為 idle，到時頁維持 expired。到時不自動換頁。
- 向前移動時，離開頁若剩餘大於零，該剩餘列為 deferred；途中仍為 scheduled 的頁也列為 deferred。剩餘為零的離開頁列為 completed。這些動作不把未用時間當作已消耗。
- 向後移動不略過中間頁。離開的 scheduled 頁保留在流程中。回看 deferred／completed 頁只預覽，不自動重新排入；開始 deferred 頁會將其剩餘重新排入並計時；completed 頁須先加時或重設才可開始。
- P01 上一頁回 P00，暫停活動但保留其流程安排與 `lastActivityPage`；從 P00 返回原頁不略過活動。P25 下一頁與「下一頁並開始」均無動作。
- 額外提供「下一頁並開始」按鈕與 Shift＋→／Shift＋PageDown：先完成普通向前換頁規則，再啟動目標頁的非零倒數；若目標頁為 deferred，重新排入。已到時頁不自動重設。長按快捷鍵不連續翻頁，忽略 `event.repeat`。
- 控制台列出 deferred 頁、保留秒數與合計，提供「重新排入」「捨棄剩餘」「轉移剩餘至指定頁」；不自動將省下時間加到下一頁。重新排入只改安排，不自動啟動；捨棄後剩餘歸零並列 completed；轉移須原子扣除來源剩餘與配額、增加目標剩餘與配額，不重複計算，來源清空後列 completed，目標列 scheduled；目標原為 expired 時改為 paused。使用中的目標須先結算，並依原 running 狀態重建截止時間。

#### 計算與調時

- `baseDurationSec` 是第 5 節原始配額，合計固定 7,200 秒；`allocatedSec` 是可調配額；`remainingSec` 是目前未用時間。每頁另累計實際啟動倒數的 `activeElapsedSec`，重設與轉移不回寫已用時間。
- 大倒數顯示目前頁剩餘。步驟剩餘＝同一步驟所有 scheduled 頁的剩餘總和；deferred 配額另列於控制台，不混入投影小倒數。回看已略過頁時顯示「回看／尚未重新排入」，避免把其頁面剩餘誤認為已排入。
- 不允許負值。running 以截止時間戳計算剩餘，tick 只更新顯示；暫停先結算再清除截止時間戳。到零即 expired，流程安排轉 completed。使用毫秒精度保存，顯示向上取整為 MM:SS。
- 加減一分鐘與指定剩餘：先結算，將剩餘限制在零以上，以實際差額同步調整 `allocatedSec`。例如剩 30 秒減一分鐘只減 30 秒。running 調時後非零則保持 running 並重建截止時間；idle／paused 保持原狀；expired 加時後轉 paused、重新排入。deferred 頁調時不自動重新排入；任何狀態調至零均轉 expired／completed。
- 「重設本頁」還原該頁原始配額與完整剩餘，清除本頁提醒及音效觸發紀錄，設為 idle 並重新排入；不刪全場開始時間與已累計活動時間，也不回收其他頁曾取得的轉移時間，因此可能改變全場總配額，控制台須反映。
- 全場實際經過＝目前時刻減全場開始時間，未開始時顯示尚未開始。活動暫停、回看、控制台開啟與返回 P00 時仍前進，不與活動倒數混用。
- 預估完成時間＝目前時刻＋所有 scheduled 頁的剩餘總和；當前頁若已在 scheduled 中只計一次。deferred 不計入；重新排入後才計入。此值假設接下來連續執行、不再暫停，控制台須標示此假設。尚未開始時標為「若現在開始」；所有排入活動都結束時顯示「已排入活動結束」，另列待處理配額，不持續產生誤導的完成預估。
- 到時後尚有其他 scheduled 頁時，等待換頁的實際時間使預估完成順延。目標結束使用場次日期與 Asia/Shanghai 時區，預設 2026-11-01 10:30；與預估之差用「預計提早／超時」加分鐘顯示，不用電腦時區替代場次時區。
- 重新整理還原目前頁、流程安排、截止時間與提醒紀錄。還原 running 時先依截止時間結算；若已到時則轉 expired／completed。背景回來與重新整理須走同一套到時處理，避免重複累計或觸發音效。

#### 必須通過的操作案例

| 案例 | 預期結果 |
|---|---|
| P00 首次開始 | 進 P01、倒數 running、全場開始時間只建立一次 |
| 直接進 P04 再按開始 | P01–P03 列 deferred，P04 running，建立全場開始時間 |
| P04 剩 60 秒，普通下一頁 | P04 paused／deferred；P05 idle；Step 02 排入剩餘為 5＋4＝9 分鐘，待處理另列 1 分鐘 |
| P05 再跳 P07，P05 尚有 5 分鐘 | P05 的 5 分鐘與 P06 的 4 分鐘列 deferred，P07 不自動開始 |
| 回看 P04，再按開始 | 回看時不改安排；按開始才重新排入其 60 秒，步驟剩餘與預估同步增加 |
| P04 轉移 60 秒給 P07 | 來源剩餘清零；目標增加 60 秒；流程內加上待處理的未用總量守恆 |
| running 期間重新整理 | 截止時間不重建；扣除離開期間時間，已到時則歸零且不跳頁 |
| P25 歸零後按下一頁 | 留在 P25，仍可隱藏倒數與顯示聯絡資訊 |

### 7.2 提醒

- 一般提醒門檻依本頁最近一次重設或初始化的原始配額計算，加減時間不改變門檻。預設剩餘 20% 時，進度條由黑變橘，附 Almost time / 即將到時；剩餘 10% 時加文字 Please wrap up / 請準備收尾。顏色變化不作唯一提醒。
- 原始配額一分鐘以內的頁面僅在剩餘 10 秒顯示收尾提示，避免剛啟動就提醒。
- P17 額外保有 10 分鐘、3 分鐘內容提醒；優先顯示三分鐘提醒，再顯示一般收尾提示。
- 門檻以「剩餘值從門檻以上跨到以下」觸發一次；加時後不自動重複已確認的內容提醒，可由控制台重播。只有「重設本頁」才重設觸發紀錄，暫停後繼續不重設。若跨背景或重新整理一次越過多個門檻，只顯示當下最優先的一則；已過期的較早提醒標為已處理，不依序補播。
- 音效預設關閉；若啟用，需經明確使用者操作解鎖音訊，每頁自初始化或重設起只在首次到時播放一次短音。音效關閉時到時也記為已處理，之後開啟不補播；加時後再次到時不重播。不可自動播放背景音樂。

### 7.3 引導者控制台

第一版採單視窗控制面板，P 鍵或右下控制圖示開關。平時隱藏，滑鼠移動時僅顯示低干擾入口；面板開啟時不暫停倒數。控制台內容會出現在投影，須在操作說明中明確提示；此版本不假設有私密講者視窗。

面板需提供：

- 上一頁、下一頁、下一頁並開始、頁面索引跳轉；P00 已有進度時可返回目前活動。
- 開始／暫停、加減一分鐘、指定剩餘時間、重設本頁。
- 全螢幕、隱藏／顯示倒數、音效開關。
- 全場實際經過時間、預估完成時間、與目標結束時間差異；已略過頁的待處理配額清單、重新排入、捨棄與轉移功能；重要提醒的關閉與重播。
- 組隊人數、場次資訊、可選上傳網址、語言顯示模式設定。
- 「清除本場進度」需二次確認；一般換頁、暫停、調時不要求確認。
- 素材待補的管理備註與巡組提問預設收合，只在控制台展開。控制台也會被投影，這些是非預設投影內容，不是私密資訊；不可儲存需要隱私的備註。

| 快捷鍵 | 操作 |
|---|---|
| → / PageDown | 下一頁，進頁後等待開始 |
| Shift＋→ / Shift＋PageDown | 下一頁並開始 |
| ← / PageUp | 上一頁 |
| Space | 開始／暫停 |
| + / = | 加一分鐘 |
| - | 減一分鐘 |
| F | 進入／退出全螢幕 |
| P | 開關控制面板 |
| T | 顯示／隱藏倒數 |
| Esc | 關閉控制面板；瀏覽器原生全螢幕退出優先 |

輸入欄位、下拉選單、對話框正在操作時停用全域快捷鍵；按鍵需 preventDefault 避免 Space 捲頁。所有操作也須有可點擊按鈕。一般簡報器 PageUp/PageDown 可直接使用。

### 7.3.1 巡組提問（手動展開，不自動投影）

依 PDF 第 9 頁整理，供 P11、P16、P17、P21 引導時選用，不增加頁面與時間：

- What does the challenge owner need? / 挑戰提出者需要什麼？
- Which acceptance criterion are you addressing? / 目前在回應哪一項驗收條件？
- What would make this usable? / 怎樣才能讓它可用？
- Let us hear from someone who has not spoken yet. / 聽聽還沒發言的夥伴。
- Could you give us a specific example? / 可以給一個具體例子嗎？
- What still needs to be completed? / 還有什麼需要完成？
- What would you need to check before trying this in your own work? / 在工作中嘗試前，需要先確認什麼？

### 7.4 語言與閱讀

- 預設雙語；控制台可切 English only / 中文 / 雙語。
- 切換語言不重設計時、不改頁、不改物料名稱。卡片英文名稱保持可辨識。
- 螢幕閱讀器對倒數不每秒朗讀；僅在暫停、開始、到時與重要提醒時宣告。
- 操作按鈕具 aria-label、可鍵盤焦點、清楚焦點框。語意狀態不得只用顏色表示。

## 8. 內容資料與素材管理

內容與渲染程式分離。每頁至少具有以下欄位，命名可依專案慣例調整，但語意不得省略。

```ts
type Localized = { en: string; zhTW: string };
type Slide = {
  id: string; // P00–P25，永久穩定識別
  stepId: number | null; // 1–13；不含 Opening–Closing 對應
  substepIndex?: number;
  substepCount?: number;
  template: 'T0' | 'T1' | 'T2' | 'T3';
  title: Localized;
  stepTitle?: Localized;
  durationSec: number;
  actions: Localized[];
  why?: Localized;
  output?: Localized;
  tools: Localized[];
  supportingText?: Localized[];
  visualType?: 'logo' | 'profile' | 'card-pair' | 'checklist' | 'matrix' | 'cycle' | 'two-notes';
  alerts?: { remainingSec: number; message: Localized }[];
  posterAssetId?: string; // 可選素材，未提供時不虛構
  facilitatorNotes?: string[]; // 只在控制台手動展開；控制台仍會被投影
};
```

另有 workshopConfig：title、facilitatorName、email、eventDate、timezone（Asia/Shanghai）、scheduledStart、scheduledEnd、teamSizeMin、teamSizeMax、languageMode、uploadUrl、logoDataUri、feedbackWallLabels。組隊範圍預設 4–5；矩陣 N 代表實際小組人數，不直接使用 teamSizeMax 假裝為所有小組票數。

執行狀態另與 Slide 內容資料分開，至少保存：

```ts
type PageProgress = {
  timerState: 'idle' | 'running' | 'paused' | 'expired';
  planState: 'scheduled' | 'deferred' | 'completed';
  allocatedSec: number;
  remainingSec: number;
  activeElapsedSec: number;
  deadlineAtMs: number | null;
  lastAccountedAtMs: number | null; // 防止還原或 tick 重複累計
  handledAlertIds: string[];
  dismissedAlertIds: string[];
  expirySoundHandled: boolean;
};
```

`Slide.durationSec` 對應不可變的 baseDurationSec。localStorage 使用具版本的鍵名保存 schemaVersion、activePage、lastActivityPage、上述各頁執行狀態、全場開始時間與設定。載入時驗證欄位與數值；不相容或毀損資料不自動覆寫，控制台提示可清除後開始；新場狀態先在記憶體中運作，待明確清除才替換舊資料。儲存失敗時保留記憶體操作能力，控制台顯示簡短提醒，不阻擋工作坊。相同 HTML 的不同分頁不支援同時控制同一場，使用說明要求僅開啟一個操作分頁。

### 素材表

| 素材 | 來源／狀態 | 實作方式 |
|---|---|---|
| 公司 Logo | 已取得本次上傳 JPG，1231 × 1277，保存為 projection/assets/agility-logo.jpg | 原圖 bytes 內嵌，保留白底與做舊效果；P00、P01、P02、P25 顯著呈現 |
| 講稿 | 已取得並核讀 Agile_Sprint_Lab_Speaking_Script.pdf，共 9 頁 | 作內容來源；原檔保持不變，不將整頁 PDF 當投影片 |
| 手繪海報 | 尚未提供 | 主流程可先完成；日後以各頁 posterAssetId 掛接，不自行創作替代內容 |
| 卡片照片 | 尚未提供 | 先用欄位示意與正確名稱；取得素材後再換成實體卡圖 |
| 個人照片 | 未提供 | 此版本不需要 |
| 網站 QR Code | 網址未提供 | 預設隱藏；有效網址才生成，離線生成程式須內嵌 |

素材待補不阻礙其餘頁面開發。現有手繪海報由引導者現場指向；投影不擅自重製其五階段分類。

## 9. 視覺與前端驗收

### 視覺驗收

- P00–P25 均有完整設計；活動頁在後排能辨識步驟、行動、產出、工具與倒數。
- Logo 未變形、未裁切、未擅自改色；所有頁一致使用橘、黑、白。
- 1920 × 1080 與 1280 × 720 均無裁切、重疊、捲軸；矩陣軸名與 email 完整可讀。
- 一般活動頁英文最多三項行動，每項中文緊鄰；原理保持一句，不擴寫為教科書。
- 畫面中沒有 Opening–Closing 的階段標籤或對應。
- AC、DoR、DoD 分工正確；Challenge Card 與 AC Card 以兩張實體卡呈現。
- P13 的紅點多選／綠點單選正確；P14 的 X/Y 軸正確。

### 功能驗收

- 正式頁配額加總 7,200 秒；P00 不列入。
- 開始、暫停、繼續、調時、換頁、返回、跳頁均符合狀態規則；歸零不跳頁、不顯示負數。
- P04–P06 等子頁的步驟剩餘與頁面剩餘有清楚差別；跨頁不重設整個步驟配額。7.1 的八項操作案例全部通過，略過、回看、重新排入與轉移不重複計算。
- 重新整理及切背景後計時依時間戳恢復，無重複音效或提醒；加時、減時歸零、指定剩餘、單頁重設及全場清除符合規則；重設單頁不改全場開始時間。
- P17 的十分鐘及三分鐘提醒內容正確，可關閉、不遮住核心指引。
- 語言切換保留目前頁與計時；未填上傳網址時不顯示空白 QR 或假連結。
- 瀏覽器無網路時可直接開啟交付 HTML，Logo、字體、圖示、計時、控制均可用；無 CDN 或外部字型依賴。
- 以當前 Chrome、Edge、Safari 桌面版完成實際瀏覽器檢查，記錄版本與測試日期；未執行的瀏覽器標示未驗證，不以其他瀏覽器模擬代替。特別檢查 file:// 直接開啟時的儲存與音訊；儲存不可用時依記憶體降級規則運作。全螢幕不支援時仍可一般視窗使用。
- 中文／英文信箱文字均為 agiletalks@gmail.com，無自動替換或拼字修正。

### 開發交付

1. 可離線開啟的單一 HTML，含嵌入素材。
2. 可維護的內容資料與原始碼；若開發採多檔，另提供上述單檔輸出版。
3. 簡短操作說明：啟動、全螢幕、快捷鍵、暫停與加時、恢復進度、清除本場進度。
4. 視覺檢查截圖：至少封面、Percy 簡介、一般活動、雙卡說明、紅綠投票、矩陣、實作提醒、結語，以及 idle / running / paused / expired 狀態。
5. 逐頁檢核表與計時驗證結果。

## 10. 第一版採用的預設

可直接依本文件開始設計與開發。以下均為可覆寫預設，不要求先等待補件：英文為主的雙語畫面、每組 4–5 人、26 個畫面、正式流程 120 分鐘、單視窗控制台、音效關閉、上傳區隱藏、沒有主持人人像。

本文件已納入可核實的 Percy 身分、公司 Logo 使用規則、聯絡信箱與建議配色。未確認的延伸簡介與資格先不投影；Logo 原圖已補齊並內嵌，正式品牌畫面須確認原比例、白底與安全留白。卡片與海報照片可後補，不阻礙流程原型。已收到的口語稿雖有 Opening 到 Closing 標法，本版仍依第 1 節不呈現；只有使用者明確變更投影需求時才修訂。

## 11. v1.1 修訂摘要

- 已核讀 9 頁口語稿，確認 13 個步驟與 120 分鐘配置；加入獨立 AC 卡、五分鐘後換手及無網址時的口語替換指示。
- 更正 Logo 取得狀態，區分可核實的身分與待確認簡介，保留原 PDF 不修改。
- 分離計時狀態與流程安排，定義首次開始、提早換頁、回看、重新排入、捨棄與配額轉移，以及可驗收案例。
- 補上「下一頁並開始」、提醒跨門檻處理、資料還原規則、密集版面驗證、巡組提問與現場時間調整原則。
- 保留 P00–P25、13 步驟、7,200 秒原始配額；本次僅修訂規格，不代表已交付或驗收 HTML。

### Logo 素材補齊（2026-10-28）

已取得使用者提供的 Logo，原檔不經重繪或壓縮保存，並內嵌於單檔 HTML。舊場次儲存若沒有 Logo，重新整理可補入原圖而保留頁面與倒數；已自訂的其他 Logo 不自動覆蓋。
