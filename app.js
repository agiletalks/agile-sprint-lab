// ==========================================================================
// Agile Sprint Lab Prework Collection System - Logic (Dynamic Multi-Challenge)
// ==========================================================================

// [管理員設定] 如果您希望學員打開網頁時直接連線，請在下方引號中貼入部署好的 Apps Script URL。
// 如果留空，系統將會預設為「模擬模式」，使用者可手動點擊網頁右上角齒輪進行個人設定。
const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbzgUxhFYfOFLseJlfdB58y0VIVsKmLIjfKobqc6OuH6BhYUTNfkraITp86vm3OP0IOkVg/exec";

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const form = document.getElementById('preworkForm');
  const pName = document.getElementById('pName');
  const pRole = document.getElementById('pRole');
  const pEmail = document.getElementById('pEmail');
  const roleTags = document.querySelectorAll('.suggestion-tag');
  
  // Dynamic Challenges Elements
  const dynamicContainer = document.getElementById('dynamic-challenges-container');
  const addChallengeBtn = document.getElementById('addChallengeBtn');
  
  // Progress Bar
  const progressBar = document.getElementById('progressBar');
  const progressPercent = document.getElementById('progressPercent');
  
  // Settings Modal Elements
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const gasUrlInput = document.getElementById('gasUrl');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const resetSettingsBtn = document.getElementById('resetSettingsBtn');
  const statusBadge = document.getElementById('statusBadge');
  
  // Success Modal Elements
  const successModal = document.getElementById('successModal');
  const summaryDetails = document.getElementById('summaryDetails');
  const downloadBackupBtn = document.getElementById('downloadBackupBtn');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const submitBtn = document.getElementById('submitBtn');
  
  // Preview Modal Elements
  const previewModal = document.getElementById('previewModal');
  const closePreviewBtn = document.getElementById('closePreviewBtn');
  const backToEditBtn = document.getElementById('backToEditBtn');
  const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
  const previewNotesContainer = document.getElementById('previewNotesContainer');
  
  // Global States
  let challengeCounter = 2; // Challenge 1 and 2 are static
  let cachedPayload = null;

  // ==========================================================================
  // Settings API Configurations
  // ==========================================================================
  
  // Load saved Google Apps Script URL
  function loadSettings() {
    const savedUrl = localStorage.getItem('agile_sprint_lab_gas_url') || DEFAULT_GAS_URL;
    if (savedUrl) {
      gasUrlInput.value = savedUrl;
      statusBadge.textContent = '連線模式 (Web App)';
      statusBadge.className = 'status-badge live';
    } else {
      gasUrlInput.value = '';
      statusBadge.textContent = '模擬模式';
      statusBadge.className = 'status-badge simulated';
    }
  }

  // Open Settings Modal
  settingsBtn.addEventListener('click', () => {
    loadSettings();
    settingsModal.classList.add('open');
  });

  // Close Settings Modal
  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('open');
  });

  // Save Settings Modal
  saveSettingsBtn.addEventListener('click', () => {
    const url = gasUrlInput.value.trim();
    if (url === '') {
      localStorage.removeItem('agile_sprint_lab_gas_url');
    } else {
      localStorage.setItem('agile_sprint_lab_gas_url', url);
    }
    settingsModal.classList.remove('open');
    updateSubmitTips();
  });

  // Reset Settings Modal
  resetSettingsBtn.addEventListener('click', () => {
    gasUrlInput.value = '';
    localStorage.removeItem('agile_sprint_lab_gas_url');
    statusBadge.textContent = '模擬模式';
    statusBadge.className = 'status-badge simulated';
  });

  function updateSubmitTips() {
    const tips = document.querySelector('.submit-tips');
    const isLive = localStorage.getItem('agile_sprint_lab_gas_url') || DEFAULT_GAS_URL;
    if (isLive) {
      tips.textContent = '資料將即時寫入活動專屬 Google Sheets。';
    } else {
      tips.textContent = '目前為模擬模式，送出後可下載 JSON 資料備份。';
    }
  }
  updateSubmitTips();

  // ==========================================================================
  // Autocomplete suggestions
  // ==========================================================================
  roleTags.forEach(tag => {
    tag.addEventListener('click', () => {
      pRole.value = tag.textContent;
      pRole.focus();
      validateForm(false);
    });
  });

  // ==========================================================================
  // Dynamic Challenge Card Generation
  // ==========================================================================
  
  function createChallengeCardHTML(num) {
    return `
      <div class="challenge-card mt-4" id="challenge${num}-container" data-number="${num}">
        <div class="challenge-header">
          <h4 class="challenge-title-text">痛點問題 #${num} (Challenge #${num}) <span class="optional-badge">選填</span></h4>
          <button type="button" class="remove-challenge-btn" data-target="${num}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            移除此問題
          </button>
        </div>
        
        <div class="form-group">
          <label for="c${num}Problem">真實痛點問題描述 (Problem) <span class="required-indicator" style="display:none;" id="c${num}ReqIndicator">*</span></label>
          <div class="guidance-tip">
            <span class="guidance-tag">【非工程 / 業務流程範例】</span>
            <span class="bad-example"><strong>❌ 避開開規格的寫法：</strong>希望公司採購一套 AI 招募分析系統或請顧問來協助流程優化。</span>
            <span class="good-example"><strong>💡 推薦描述真實痛點：</strong>主管要求我們在一週內找出「在現有工作流程中如何用 AI 輔助」，但團隊對 AI 的能力與限制缺乏認識，不知道該如何開始評估。</span>
          </div>
          <textarea id="c${num}Problem" class="challenge-problem" name="c${num}_problem" rows="3" placeholder="請描述您遭遇的真實痛點/問題本身，而非預期的解決方案。"></textarea>
          <span class="error-msg" id="c${num}ProblemError">若已填寫此欄位，問題描述不可空白</span>
        </div>

        <div class="form-group">
          <label for="c${num}Value">解決後的價值與效益 (Expected Value) <span class="required-indicator" style="display:none;" id="c${num}ValReqIndicator">*</span></label>
          <div class="guidance-tip">
            <span class="guidance-tag">【非工程 / 業務流程範例】</span>
            <span class="bad-example"><strong>❌ 避開開規格的寫法：</strong>希望部門能舉辦一次 AI 流程應用訓練課程。</span>
            <span class="good-example"><strong>💡 推薦描述期望價值：</strong>團隊能建立一套簡單的流程分析指標，自主找出最適合引入 AI 的節點，並有信心向主管報告可行的優化方案。</span>
          </div>
          <textarea id="c${num}Value" class="challenge-value" name="c${num}_value" rows="3" placeholder="如果這個問題被解決，能為您、團隊或客戶創造什麼價值？請聚焦在效益與狀態，而非實作細節。"></textarea>
          <span class="error-msg" id="c${num}ValueError">若已填寫此欄位，效益描述不可空白</span>
        </div>

        <div class="form-group">
          <label>議題分類 <span class="required-indicator" style="display:none;" id="c${num}CatReqIndicator">*</span></label>
          <div class="category-grid" id="c${num}CategoryGroup">
            <label class="category-pill">
              <input type="radio" class="challenge-category" name="c${num}_category" value="Individual Work">
              <span>個人工作效率</span>
            </label>
            <label class="category-pill">
              <input type="radio" class="challenge-category" name="c${num}_category" value="Team Collaboration">
              <span>團隊協作</span>
            </label>
            <label class="category-pill">
              <input type="radio" class="challenge-category" name="c${num}_category" value="Process & Workflow">
              <span>流程與工作流</span>
            </label>
            <label class="category-pill">
              <input type="radio" class="challenge-category" name="c${num}_category" value="Tools & Technology">
              <span>工具與技術</span>
            </label>
            <label class="category-pill">
              <input type="radio" class="challenge-category" name="c${num}_category" value="Leadership & Organization">
              <span>領導力與組織</span>
            </label>
            <label class="category-pill">
              <input type="radio" class="challenge-category" name="c${num}_category" value="Others">
              <span>其他</span>
            </label>
          </div>
          <span class="error-msg" id="c${num}CategoryError">請選擇一個分類</span>
        </div>

        <div class="form-group">
          <label for="c${num}Attempts">過去嘗試過的做法或擁有的資源 (Previous Attempts / Resources) <span class="optional-label">(選填)</span></label>
          <textarea id="c${num}Attempts" class="challenge-attempts" name="c${num}_attempts" rows="2" placeholder="您或團隊曾嘗試過哪些做法來解決此痛點？不論成功或失敗皆可；或填寫您擁有的經驗、技能等資源。"></textarea>
        </div>
      </div>
    `;
  }

  // Append new challenge card
  addChallengeBtn.addEventListener('click', () => {
    challengeCounter++;
    
    // Create element from HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = createChallengeCardHTML(challengeCounter).trim();
    const newCard = tempDiv.firstChild;
    
    dynamicContainer.appendChild(newCard);
    
    // Setup listeners on new elements
    const problemTextarea = newCard.querySelector('.challenge-problem');
    problemTextarea.addEventListener('input', () => validateForm(false));
    
    const categoryRadios = newCard.querySelectorAll('.challenge-category');
    categoryRadios.forEach(radio => {
      radio.addEventListener('change', () => validateForm(false));
    });
    
    const valueTextarea = newCard.querySelector('.challenge-value');
    valueTextarea.addEventListener('input', () => validateForm(false));
    
    // Setup remove listener
    const removeBtn = newCard.querySelector('.remove-challenge-btn');
    removeBtn.addEventListener('click', () => {
      newCard.remove();
      reorderChallenges();
      validateForm(false);
    });

    // Scroll to the newly added challenge card
    newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    validateForm(false);
  });

  // Re-number remaining dynamic challenges to keep indices consecutive (e.g. 3, 4, 5...)
  function reorderChallenges() {
    const cards = dynamicContainer.querySelectorAll('.challenge-card');
    challengeCounter = 2; // reset dynamic index pointer

    cards.forEach((card, index) => {
      const num = index + 3;
      challengeCounter = num;

      // Update card metadata
      card.setAttribute('data-number', num);
      card.id = `challenge${num}-container`;

      // Update Card Header Title Text
      const titleText = card.querySelector('.challenge-title-text');
      titleText.innerHTML = `痛點問題 #${num} (Challenge #${num}) <span class="optional-badge">選填</span>`;

      // Update Problem field attributes
      const labelProblem = card.querySelector('label[for^="c"][for$="Problem"]');
      if (labelProblem) labelProblem.setAttribute('for', `c${num}Problem`);
      
      const inputProblem = card.querySelector('.challenge-problem');
      inputProblem.id = `c${num}Problem`;
      inputProblem.name = `c${num}_problem`;
      
      const reqInd = card.querySelector('span[id^="c"][id$="ReqIndicator"]');
      if (reqInd) reqInd.id = `c${num}ReqIndicator`;
      
      const errProblem = card.querySelector('span[id^="c"][id$="ProblemError"]');
      if (errProblem) errProblem.id = `c${num}ProblemError`;

      // Update Category field attributes
      const catReqInd = card.querySelector('span[id^="c"][id$="CatReqIndicator"]');
      if (catReqInd) catReqInd.id = `c${num}CatReqIndicator`;
      
      const catGroupDiv = card.querySelector('.category-grid');
      catGroupDiv.id = `c${num}CategoryGroup`;
      
      const categoryInputs = card.querySelectorAll('.challenge-category');
      categoryInputs.forEach(input => {
        input.name = `c${num}_category`;
      });
      
      const errCategory = card.querySelector('span[id^="c"][id$="CategoryError"]');
      if (errCategory) errCategory.id = `c${num}CategoryError`;

      // Update Value field attributes
      const labelValue = card.querySelector('label[for^="c"][for$="Value"]');
      if (labelValue) labelValue.setAttribute('for', `c${num}Value`);
      
      const inputValue = card.querySelector('.challenge-value');
      inputValue.id = `c${num}Value`;
      inputValue.name = `c${num}_value`;
      
      const valReqInd = card.querySelector('span[id^="c"][id$="ValReqIndicator"]');
      if (valReqInd) valReqInd.id = `c${num}ValReqIndicator`;
      
      const errValue = card.querySelector('span[id^="c"][id$="ValueError"]');
      if (errValue) errValue.id = `c${num}ValueError`;

      // Update Attempts field attributes
      const labelAttempts = card.querySelector('label[for^="c"][for$="Attempts"]');
      if (labelAttempts) labelAttempts.setAttribute('for', `c${num}Attempts`);
      
      const inputAttempts = card.querySelector('.challenge-attempts');
      inputAttempts.id = `c${num}Attempts`;
      inputAttempts.name = `c${num}_attempts`;

      // Update remove button reference
      const rmBtn = card.querySelector('.remove-challenge-btn');
      rmBtn.setAttribute('data-target', num);
    });
  }

  // ==========================================================================
  // Form Validation & Progress Tracker
  // ==========================================================================
  
  function getSelectedRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : null;
  }

  function setFieldError(fieldId, errorMsgId, show) {
    const field = document.getElementById(fieldId);
    if (field) {
      const group = field.closest('.form-group');
      if (group) {
        if (show) {
          group.classList.add('invalid');
        } else {
          group.classList.remove('invalid');
        }
      }
    }
  }

  function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
      const group = field.closest('.form-group');
      if (group) group.classList.remove('invalid');
    }
  }

  // Calculate fields completion and validation
  function validateForm(showErrors = false) {
    let isValid = true;
    let completedRequiredCount = 0;
    
    // Core Required Fields List (Total 8 fields)
    // 1. Name
    const nameVal = pName.value.trim();
    if (nameVal === '') {
      isValid = false;
      if (showErrors) setFieldError('pName', 'pNameError', true);
    } else {
      completedRequiredCount++;
      setFieldError('pName', 'pNameError', false);
    }

    // 2. Role
    const roleVal = pRole.value.trim();
    if (roleVal === '') {
      isValid = false;
      if (showErrors) setFieldError('pRole', 'pRoleError', true);
    } else {
      completedRequiredCount++;
      setFieldError('pRole', 'pRoleError', false);
    }

    // Email (Optional - formats validation only if filled)
    const emailVal = pEmail.value.trim();
    if (emailVal !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        isValid = false;
        if (showErrors) setFieldError('pEmail', 'pEmailError', true);
      } else {
        setFieldError('pEmail', 'pEmailError', false);
      }
    } else {
      setFieldError('pEmail', 'pEmailError', false);
    }

    // 3. Challenge 1 Problem
    const c1ProbVal = document.getElementById('c1Problem').value.trim();
    if (c1ProbVal === '') {
      isValid = false;
      if (showErrors) setFieldError('c1Problem', 'c1ProblemError', true);
    } else {
      completedRequiredCount++;
      setFieldError('c1Problem', 'c1ProblemError', false);
    }

    // 4. Challenge 1 Category
    const c1CatVal = getSelectedRadioValue('c1_category');
    const c1CatGroup = document.getElementById('c1CategoryGroup');
    if (!c1CatVal) {
      isValid = false;
      if (showErrors && c1CatGroup) {
        c1CatGroup.closest('.form-group').classList.add('invalid');
      }
    } else {
      completedRequiredCount++;
      if (c1CatGroup) c1CatGroup.closest('.form-group').classList.remove('invalid');
    }

    // 5. Challenge 1 Expected Value
    const c1ValVal = document.getElementById('c1Value').value.trim();
    if (c1ValVal === '') {
      isValid = false;
      if (showErrors) setFieldError('c1Value', 'c1ValueError', true);
    } else {
      completedRequiredCount++;
      setFieldError('c1Value', 'c1ValueError', false);
    }

    // 6. Challenge 2 Problem
    const c2ProbVal = document.getElementById('c2Problem').value.trim();
    if (c2ProbVal === '') {
      isValid = false;
      if (showErrors) setFieldError('c2Problem', 'c2ProblemError', true);
    } else {
      completedRequiredCount++;
      setFieldError('c2Problem', 'c2ProblemError', false);
    }

    // 7. Challenge 2 Category
    const c2CatVal = getSelectedRadioValue('c2_category');
    const c2CatGroup = document.getElementById('c2CategoryGroup');
    if (!c2CatVal) {
      isValid = false;
      if (showErrors && c2CatGroup) {
        c2CatGroup.closest('.form-group').classList.add('invalid');
      }
    } else {
      completedRequiredCount++;
      if (c2CatGroup) c2CatGroup.closest('.form-group').classList.remove('invalid');
    }

    // 8. Challenge 2 Expected Value
    const c2ValVal = document.getElementById('c2Value').value.trim();
    if (c2ValVal === '') {
      isValid = false;
      if (showErrors) setFieldError('c2Value', 'c2ValueError', true);
    } else {
      completedRequiredCount++;
      setFieldError('c2Value', 'c2ValueError', false);
    }

    // Dynamic Challenges Validation (N >= 3)
    const dynamicCards = dynamicContainer.querySelectorAll('.challenge-card');
    dynamicCards.forEach(card => {
      const num = card.getAttribute('data-number');
      
      const problemField = document.getElementById(`c${num}Problem`);
      const probVal = problemField ? problemField.value.trim() : '';
      
      const catVal = getSelectedRadioValue(`c${num}_category`);
      const catGroup = document.getElementById(`c${num}CategoryGroup`);
      
      const valueField = document.getElementById(`c${num}Value`);
      const valVal = valueField ? valueField.value.trim() : '';
      
      const reqIndicator = document.getElementById(`c${num}ReqIndicator`);
      const catReqIndicator = document.getElementById(`c${num}CatReqIndicator`);
      const valReqIndicator = document.getElementById(`c${num}ValReqIndicator`);

      // If any of the three is filled, all three become required
      if (probVal !== '' || catVal || valVal !== '') {
        if (reqIndicator) reqIndicator.style.display = 'inline';
        if (catReqIndicator) catReqIndicator.style.display = 'inline';
        if (valReqIndicator) valReqIndicator.style.display = 'inline';
        
        if (probVal === '') {
          isValid = false;
          if (showErrors) setFieldError(`c${num}Problem`, `c${num}ProblemError`, true);
        } else {
          setFieldError(`c${num}Problem`, `c${num}ProblemError`, false);
        }
        
        if (!catVal) {
          isValid = false;
          if (showErrors && catGroup) catGroup.closest('.form-group').classList.add('invalid');
        } else {
          if (catGroup) catGroup.closest('.form-group').classList.remove('invalid');
        }

        if (valVal === '') {
          isValid = false;
          if (showErrors) setFieldError(`c${num}Value`, `c${num}ValueError`, true);
        } else {
          setFieldError(`c${num}Value`, `c${num}ValueError`, false);
        }
      } else {
        // If completely empty, remove validation requirements and indicators
        if (reqIndicator) reqIndicator.style.display = 'none';
        if (catReqIndicator) catReqIndicator.style.display = 'none';
        if (valReqIndicator) valReqIndicator.style.display = 'none';
        
        setFieldError(`c${num}Problem`, `c${num}ProblemError`, false);
        if (catGroup) catGroup.closest('.form-group').classList.remove('invalid');
        setFieldError(`c${num}Value`, `c${num}ValueError`, false);
      }
    });

    // Progress percentage
    const progress = Math.min(Math.round((completedRequiredCount / 8) * 100), 100);
    progressBar.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;

    return isValid;
  }

  // Setup input change event listeners for core fields
  const inputFields = form.querySelectorAll('input[required], textarea[required], input[type="email"]');
  inputFields.forEach(input => {
    input.addEventListener('input', () => {
      validateForm(false);
    });
  });

  const radioInputs = form.querySelectorAll('input[type="radio"]');
  radioInputs.forEach(radio => {
    radio.addEventListener('change', () => {
      validateForm(false);
    });
  });

  function getFriendlyCategory(cat) {
    const list = {
      'Individual Work': '個人工作',
      'Team Collaboration': '團隊協作',
      'Process & Workflow': '流程流轉',
      'Tools & Technology': '工具技術',
      'Leadership & Organization': '領導組織',
      'Others': '其他議題'
    };
    return list[cat] || cat;
  }

  // ==========================================================================
  // Form Submission & Preview
  // ==========================================================================
  
  // Show structural concept preview of User Stories in Chinese on sticky notes
  function showPreviewModal() {
    if (!cachedPayload) return;
    
    previewNotesContainer.innerHTML = '';
    
    cachedPayload.challenges.forEach((challenge, index) => {
      // Alternating tilts: -1deg, 1.5deg, -0.8deg, 1.2deg
      const angles = [-1, 1.5, -0.8, 1.2];
      const angle = angles[index % angles.length];
      
      const cardHtml = `
        <div class="preview-sticky-note" style="transform: rotate(${angle}deg);">
          <div class="sticky-note-title">痛點問題 #${index + 1}</div>
          <div class="sticky-note-content">
            <div class="sticky-note-line">
              <span class="sticky-note-role"><strong>作為一個</strong></span> ${escapeHtml(cachedPayload.role)}，
            </div>
            <div class="sticky-note-line">
              <span class="sticky-note-role"><strong>我想要</strong></span> 探索克服此痛點的對策：「${escapeHtml(challenge.problem)}」，
            </div>
            <div class="sticky-note-line">
              <span class="sticky-note-role"><strong>以便於</strong></span> ${escapeHtml(challenge.expectedValue)}。
            </div>
          </div>
        </div>
      `;
      previewNotesContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
    
    previewModal.classList.add('open');
  }

  // Preview Modal events
  closePreviewBtn.addEventListener('click', () => {
    previewModal.classList.remove('open');
  });

  backToEditBtn.addEventListener('click', () => {
    previewModal.classList.remove('open');
  });

  confirmSubmitBtn.addEventListener('click', () => {
    previewModal.classList.remove('open');
    executeSubmission();
  });

  // Actual Submission to Google Apps Script
  async function executeSubmission() {
    if (!cachedPayload) return;

    // Show button loading state
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    
    btnText.textContent = '傳送中...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;

    const gasUrl = localStorage.getItem('agile_sprint_lab_gas_url') || DEFAULT_GAS_URL;

    if (!gasUrl) {
      // Simulated Local Mode
      setTimeout(() => {
        resetBtnState(btnText, spinner);
        showSuccessModal(cachedPayload, true);
      }, 1200);
    } else {
      // Production API Mode
      try {
        const response = await fetch(gasUrl, {
          method: 'POST',
          mode: 'no-cors', // Google Apps Script Web App redirects trigger CORS. no-cors is robust.
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify(cachedPayload)
        });

        resetBtnState(btnText, spinner);
        showSuccessModal(cachedPayload, false);
      } catch (err) {
        console.error('Submission failed:', err);
        resetBtnState(btnText, spinner);
        showSuccessModal(cachedPayload, false, true);
      }
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Run full validation and show errors
    const isFormValid = validateForm(true);
    
    if (!isFormValid) {
      // Scroll to first error
      const firstError = document.querySelector('.form-group.invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Construct Payload
    const challenges = [];
    
    // Challenge 1
    challenges.push({
      category: getSelectedRadioValue('c1_category'),
      problem: document.getElementById('c1Problem').value.trim(),
      expectedValue: document.getElementById('c1Value').value.trim(),
      previousAttempts: document.getElementById('c1Attempts').value.trim()
    });

    // Challenge 2
    challenges.push({
      category: getSelectedRadioValue('c2_category'),
      problem: document.getElementById('c2Problem').value.trim(),
      expectedValue: document.getElementById('c2Value').value.trim(),
      previousAttempts: document.getElementById('c2Attempts').value.trim()
    });

    // Dynamic challenges (Challenge 3+)
    const dynamicCards = dynamicContainer.querySelectorAll('.challenge-card');
    dynamicCards.forEach(card => {
      const num = card.getAttribute('data-number');
      const problemField = document.getElementById(`c${num}Problem`);
      const probVal = problemField ? problemField.value.trim() : '';
      const catVal = getSelectedRadioValue(`c${num}_category`);
      const valueField = document.getElementById(`c${num}Value`);
      const valVal = valueField ? valueField.value.trim() : '';
      
      // Only compile dynamic card if it has valid inputs
      if (probVal !== '' && catVal && valVal !== '') {
        challenges.push({
          category: catVal,
          problem: probVal,
          expectedValue: valVal,
          previousAttempts: document.getElementById(`c${num}Attempts`).value.trim()
        });
      }
    });

    const payload = {
      name: pName.value.trim(),
      email: pEmail.value.trim(),
      role: pRole.value.trim(),
      challenges: challenges
    };

    cachedPayload = payload;

    // Trigger Preview Modal
    showPreviewModal();
  });

  function resetBtnState(btnText, spinner) {
    btnText.textContent = '提交 prework 資料';
    spinner.classList.add('hidden');
    submitBtn.disabled = false;
  }

  function showSuccessModal(payload, isSimulated = false, isFailedNetwork = false) {
    summaryDetails.innerHTML = '';
    
    // Generate simple summary
    let summaryHtml = `
      <div class="summary-row">
        <span class="summary-label">姓名：</span>
        <span class="summary-val">${escapeHtml(payload.name)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">角色：</span>
        <span class="summary-val">${escapeHtml(payload.role)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">信箱：</span>
        <span class="summary-val">${escapeHtml(payload.email || '(無)')}</span>
      </div>
    `;

    payload.challenges.forEach((c, idx) => {
      summaryHtml += `
        <div class="summary-row">
          <span class="summary-label">問題 #${idx + 1}：</span>
          <span class="summary-val"><strong>[${escapeHtml(getFriendlyCategory(c.category))}]</strong> ${escapeHtml(c.problem)}</span>
        </div>
      `;
    });

    summaryDetails.innerHTML = summaryHtml;

    if (isSimulated) {
      downloadBackupBtn.classList.remove('hidden');
      document.querySelector('#successModal h2').textContent = '模擬提交完成！';
      document.querySelector('#successModal p').textContent = '目前處於「模擬模式」，並未寫入 Google Sheets。您可以下載下方 JSON 資料備份並寄送給主辦人。';
    } else if (isFailedNetwork) {
      downloadBackupBtn.classList.remove('hidden');
      document.querySelector('#successModal h2').textContent = '寫入 API 失敗';
      document.querySelector('#successModal p').textContent = '連線至 Google Sheet 時發生錯誤（可能是 API 位址不正確或網路阻擋）。請點選下方下載 JSON 資料，並手動提供給主辦人。';
    } else {
      downloadBackupBtn.classList.add('hidden');
      document.querySelector('#successModal h2').textContent = '提交成功！';
      document.querySelector('#successModal p').textContent = '您的 Prework 議題資料已成功送出。感謝您為 Agile Sprint Lab 的精彩討論注入能量！';
    }

    successModal.classList.add('open');
  }

  // Close Success Modal and reset form
  closeSuccessBtn.addEventListener('click', () => {
    successModal.classList.remove('open');
    form.reset();
    dynamicContainer.innerHTML = ''; // Clear dynamic fields
    challengeCounter = 2; // Reset counter
    validateForm(false);
  });

  // Download Backup JSON file
  downloadBackupBtn.addEventListener('click', () => {
    if (!cachedPayload) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cachedPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    
    const formattedDate = new Date().toISOString().slice(0,10);
    const fileName = `Agile_Sprint_Lab_Prework_${cachedPayload.name.replace(/\s+/g, '_')}_${formattedDate}.json`;
    downloadAnchor.setAttribute("download", fileName);
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // HTML escape helper
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initial Run
  loadSettings();
  validateForm(false);
});
