/* ======================================================
   MahaVidya ΓÇö Platform JavaScript
   5-Pillar: Accessibility, Slider, Command Bar, AI Chat, OTP
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {

    /* ======================================================
       PILLAR 1 ΓÇö ACCESSIBILITY (GIGW 3.0 / WCAG 2.1)
    ====================================================== */

    // --- Language Toggle ---
    const langBtns = document.querySelectorAll('.lang-btn');
    const enEls = document.querySelectorAll('.lang-en');
    const mrEls = document.querySelectorAll('.lang-mr');
    let currentLang = 'en';

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === currentLang) return;
            currentLang = lang;

            langBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            if (lang === 'mr') {
                enEls.forEach(el => el.classList.add('hidden'));
                mrEls.forEach(el => el.classList.remove('hidden'));
                document.getElementById('html-root').setAttribute('lang', 'mr');
            } else {
                mrEls.forEach(el => el.classList.add('hidden'));
                enEls.forEach(el => el.classList.remove('hidden'));
                document.getElementById('html-root').setAttribute('lang', 'en');
            }
        });
    });

    // --- High Contrast Toggle ---
    const contrastBtn = document.getElementById('contrast-toggle');
    let highContrast = false;
    if (contrastBtn) {
        contrastBtn.addEventListener('click', () => {
            highContrast = !highContrast;
            document.getElementById('body-root').classList.toggle('high-contrast', highContrast);
            contrastBtn.classList.toggle('active', highContrast);
            contrastBtn.setAttribute('aria-pressed', String(highContrast));
        });
    }

    // --- Font Size Controls ---
    const fontSizes = [0.9, 1, 1.12, 1.25];
    let fontIdx = 1;
    const fontInc = document.getElementById('font-increase');
    const fontDec = document.getElementById('font-decrease');
    const fontReset = document.getElementById('font-reset');

    function applyFontSize(idx) {
        document.documentElement.style.fontSize = fontSizes[idx] + 'rem';
        fontReset.classList.toggle('active', idx === 1);
    }

    if (fontInc) fontInc.addEventListener('click', () => { fontIdx = Math.min(fontIdx + 1, fontSizes.length - 1); applyFontSize(fontIdx); });
    if (fontDec) fontDec.addEventListener('click', () => { fontIdx = Math.max(fontIdx - 1, 0); applyFontSize(fontIdx); });
    if (fontReset) fontReset.addEventListener('click', () => { fontIdx = 1; applyFontSize(fontIdx); });

    /* ======================================================
       PILLAR 2 ΓÇö HERO SLIDER
    ====================================================== */
    const slidesWrapper = document.getElementById('hero-slides-wrapper');
    const slideDots = document.querySelectorAll('.slide-dot');
    const slidePrev = document.getElementById('slide-prev');
    const slideNext = document.getElementById('slide-next');
    let currentSlide = 0;
    const totalSlides = 2;
    let slideTimer;

    function goToSlide(idx) {
        currentSlide = (idx + totalSlides) % totalSlides;
        slidesWrapper.style.transform = `translateX(-${currentSlide * 50}%)`;
        slideDots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }

    function startAutoSlide() {
        clearInterval(slideTimer);
        slideTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
    }

    if (slidePrev) slidePrev.addEventListener('click', () => { goToSlide(currentSlide - 1); startAutoSlide(); });
    if (slideNext) slideNext.addEventListener('click', () => { goToSlide(currentSlide + 1); startAutoSlide(); });
    slideDots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); startAutoSlide(); }));

    // Keyboard navigation for slider
    document.addEventListener('keydown', e => {
        if (document.activeElement.classList.contains('slide-arrow') || document.activeElement.classList.contains('slide-dot')) {
            if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
            if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
        }
    });

    startAutoSlide();

    /* ======================================================
       PILLAR 2 ΓÇö COMMAND BAR (Cmd+K / Ctrl+K)
    ====================================================== */
    const cmdOverlay = document.getElementById('cmd-overlay');
    const cmdInput = document.getElementById('cmd-input');
    const cmdResults = document.getElementById('cmd-results');

    const cmdShortcuts = [
        { icon: 'fa-magnifying-glass', title: 'Search School Directory', sub: '60,000+ ZP Schools', action: () => openSearchOverlay() },
        { icon: 'fa-right-to-bracket', title: 'Teacher / Admin Login', sub: 'Secure portal entry', action: () => openLoginModal('staff') },
        { icon: 'fa-mobile-screen', title: 'Parent OTP Login', sub: 'Phone-based secure access', action: () => openLoginModal('otp') },
        { icon: 'fa-chart-line', title: 'View Analytics Dashboard', sub: 'Attendance & competency data', action: () => document.getElementById('analytics').scrollIntoView({ behavior: 'smooth' }) },
        { icon: 'fa-images', title: 'View School Gallery', sub: 'Schools across Maharashtra', action: () => document.getElementById('campus').scrollIntoView({ behavior: 'smooth' }) },
        { icon: 'fa-robot', title: 'Ask Vishwa-Mitra AI', sub: 'AI School Assistant', action: () => openVMChat() },
        { icon: 'fa-circle-half-stroke', title: 'Toggle High Contrast', sub: 'Accessibility mode', action: () => contrastBtn.click() },
    ];

    function openCmdBar() {
        cmdOverlay.classList.add('active');
        setTimeout(() => cmdInput.focus(), 50);
        renderCmdResults(cmdShortcuts);
    }

    function closeCmdBar() {
        cmdOverlay.classList.remove('active');
        cmdInput.value = '';
    }

    function renderCmdResults(items) {
        cmdResults.innerHTML = items.length
            ? items.map((item, i) =>
                `<div class="cmd-result-item" tabindex="0" data-idx="${i}" role="option">
                    <div class="cmd-result-icon"><i class="fa-solid ${item.icon}"></i></div>
                    <div>
                        <div class="cmd-result-title">${item.title}</div>
                        <div class="cmd-result-sub">${item.sub}</div>
                    </div>
                </div>`
              ).join('')
            : `<div style="padding:1.5rem;text-align:center;color:#64748b;">No results found</div>`;

        cmdResults.querySelectorAll('.cmd-result-item').forEach((el, i) => {
            el.addEventListener('click', () => { cmdShortcuts[i].action(); closeCmdBar(); });
            el.addEventListener('keydown', e => { if (e.key === 'Enter') { cmdShortcuts[i].action(); closeCmdBar(); } });
        });
    }

    const cmdBarBtn = document.getElementById('cmd-bar-btn');
    if (cmdBarBtn) cmdBarBtn.addEventListener('click', openCmdBar);
    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); cmdOverlay.classList.contains('active') ? closeCmdBar() : openCmdBar(); }
        if (e.key === 'Escape') closeCmdBar();
    });
    cmdOverlay.addEventListener('click', e => { if (e.target === cmdOverlay) closeCmdBar(); });
    if (cmdInput) {
        cmdInput.addEventListener('input', e => {
            const q = e.target.value.toLowerCase();
            if (!q) { renderCmdResults(cmdShortcuts); return; }
            const filtered = cmdShortcuts.filter(item => item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q));
            renderCmdResults(filtered);
        });
    }

    /* ======================================================
       SEARCH DIRECTORY OVERLAY
    ====================================================== */
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearch = document.getElementById('close-search');
    const schoolSearch = document.getElementById('school-search');

    function openSearchOverlay() {
        if (searchOverlay) { searchOverlay.classList.add('active'); setTimeout(() => schoolSearch.focus(), 100); }
    }

    const dbSearchBtn = document.getElementById('cmd-bar-btn');
    if (closeSearch) closeSearch.addEventListener('click', () => searchOverlay.classList.remove('active'));
    searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) searchOverlay.classList.remove('active'); });

    const searchDrop = document.getElementById('search-results');
    let debounceTimer;
    if (schoolSearch) {
        schoolSearch.addEventListener('input', e => {
            const q = e.target.value.trim();
            searchDrop.innerHTML = '';
            if (q.length < 2) return;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetch(`http://localhost:8000/api/schools/search?q=${encodeURIComponent(q)}`)
                    .then(r => r.json())
                    .then(results => {
                        if (results.length) {
                            results.forEach(school => {
                                const item = document.createElement('div');
                                item.className = 'search-item';
                                item.setAttribute('role', 'option');
                                item.setAttribute('tabindex', '0');
                                item.innerHTML = `<strong>${school.name}</strong><br><span class="text-xs text-muted">UDISE: ${school.udise} | ${school.district}</span>`;
                                item.addEventListener('click', () => {
                                    alert(`[Backend Connected]\nNavigating to ZP School Dashboard:\n${school.name}\nUDISE: ${school.udise}`);
                                    searchOverlay.classList.remove('active');
                                });
                                searchDrop.appendChild(item);
                            });
                        } else {
                            searchDrop.innerHTML = `<div class="p-sm text-muted">No schools found for "${q}"</div>`;
                        }
                    }).catch(() => { searchDrop.innerHTML = `<div class="p-sm text-muted">Server offline ΓÇö search unavailable</div>`; });
            }, 300);
        });
    }

    /* ======================================================
       PILLAR 3 ΓÇö LOGIN MODAL + OTP FLOW
    ====================================================== */
    const loginOverlay = document.getElementById('login-overlay');
    const loginNavBtn = document.getElementById('login-nav-btn');
    const closeLoginBtn = document.getElementById('close-login');
    const submitLoginBtn = document.getElementById('submit-login-btn');
    const errorBox = document.getElementById('login-error');
    const userField = document.getElementById('login-username');
    const passField = document.getElementById('login-password');
    const pwToggle = document.getElementById('pw-toggle');

    function openLoginModal(tab = 'staff') {
        if (loginOverlay) {
            loginOverlay.classList.add('active');
            switchTab(tab);
            setTimeout(() => userField.focus(), 150);
        }
    }

    if (loginNavBtn) loginNavBtn.addEventListener('click', () => openLoginModal('staff'));
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => loginOverlay.classList.remove('active'));
    loginOverlay.addEventListener('click', e => { if (e.target === loginOverlay) loginOverlay.classList.remove('active'); });

    // Tab Switching
    const tabs = document.querySelectorAll('.modal-tab');
    function switchTab(tabName) {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) { activeTab.classList.add('active'); activeTab.setAttribute('aria-selected', 'true'); }
        document.getElementById('panel-staff').classList.toggle('hidden', tabName !== 'staff');
        document.getElementById('panel-otp').classList.toggle('hidden', tabName !== 'otp');
    }
    tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

    // Password visibility toggle
    if (pwToggle) {
        pwToggle.addEventListener('click', () => {
            const isType = passField.type === 'password';
            passField.type = isType ? 'text' : 'password';
            pwToggle.innerHTML = isType ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
        });
    }

    // Staff Login Submit
    if (submitLoginBtn) {
        submitLoginBtn.addEventListener('click', () => {
            const username = userField.value.trim();
            const password = passField.value.trim();
            if (!username || !password) return;

            submitLoginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
            submitLoginBtn.disabled = true;
            errorBox.classList.add('hidden');

            fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    // Use dynamic redirect to handle Admin vs Teacher
                    window.location.href = data.redirect || 'dashboard.html';
                } else {
                    errorBox.classList.remove('hidden');
                    submitLoginBtn.innerHTML = '<span class="lang-en">Sign In Securely</span> <i class="fa-solid fa-arrow-right-to-bracket"></i>';
                    submitLoginBtn.disabled = false;
                }
            })
            .catch(() => {
                errorBox.querySelector('span.lang-en').textContent = 'Network error ΓÇö server offline.';
                errorBox.classList.remove('hidden');
                submitLoginBtn.innerHTML = '<span class="lang-en">Sign In Securely</span> <i class="fa-solid fa-arrow-right-to-bracket"></i>';
                submitLoginBtn.disabled = false;
            });
        });
    }

    // OTP Flow
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const otpStep1 = document.getElementById('otp-step-1');
    const otpStep2 = document.getElementById('otp-step-2');
    let generatedOTP = '';

    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => {
            const phone = document.getElementById('otp-phone').value.trim();
            if (!phone || phone.length < 10) return;

            sendOtpBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            sendOtpBtn.disabled = true;

            fetch('http://localhost:8000/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            })
            .then(r => r.json())
            .then(data => {
                generatedOTP = String(data.otp);
                document.getElementById('demo-otp-display').textContent = generatedOTP;
                otpStep1.classList.add('hidden');
                otpStep2.classList.remove('hidden');
                setTimeout(() => document.getElementById('otp-input').focus(), 100);
            })
            .catch(() => {
                // Fallback: generate OTP client-side for demo
                generatedOTP = String(Math.floor(100000 + Math.random() * 900000));
                document.getElementById('demo-otp-display').textContent = generatedOTP;
                otpStep1.classList.add('hidden');
                otpStep2.classList.remove('hidden');
            });
        });
    }

    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', () => {
            const entered = document.getElementById('otp-input').value.trim();
            if (entered === generatedOTP) {
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('otp-input').style.borderColor = '#C62828';
                setTimeout(() => { document.getElementById('otp-input').style.borderColor = ''; }, 2000);
            }
        });
    }

    // Mobile Nav
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    if (menuToggle) menuToggle.addEventListener('click', () => mainNav.classList.toggle('active'));

    /* ======================================================
       PILLAR 4 ΓÇö VISHWA-MITRA AI CHAT + VOICE
    ====================================================== */
    const vmFab = document.getElementById('vm-fab-btn');
    const vmPanel = document.getElementById('vm-panel');
    const vmInput = document.getElementById('vm-input');
    const vmSend = document.getElementById('vm-send-btn');
    const vmMessages = document.getElementById('vm-messages');
    const vmVoice = document.getElementById('vm-voice-btn');
    const closeVm = document.getElementById('close-vm');
    let vmOpen = false;

    const vmResponses = {
        en: {
            default: "I'm here to help! You can ask me about school fees, homework schedules, exam dates, teacher contacts, or student progress. ≡ƒÿè",
            fees: "School fees for the current academic year are Γé╣0 (ZP schools are free under RTE Act). For uniform allowance or scholarship queries, contact your school's HM.",
            homework: "Homework schedules are uploaded by teachers every Friday. You can view the digital homework board in the Student Portal after login.",
            attendance: "Current average district attendance is 87.4%. For your child's individual attendance, please login to the Parent Portal.",
            exam: "Next exam dates: Unit Test 2 ΓÇö 18 March 2026. Final Exam ΓÇö 12ΓÇô20 April 2026. Results within 7 days of exam completion.",
            progress: "Student progress reports are generated monthly from AI analysis of teacher inputs. Login to view the detailed competency breakdown.",
        },
        mr: {
            default: "αñ«αÑÇ αñ«αñªαññ αñòαñ░αñúαÑìαñ»αñ╛αñ╕αñ╛αñáαÑÇ αñ»αÑçαñÑαÑç αñåαñ╣αÑç! αñ╢αñ╛αñ│αñ╛ αñ╢αÑüαñ▓αÑìαñò, αñùαÑâαñ╣αñ¬αñ╛αñá, αñ¬αñ░αÑÇαñòαÑìαñ╖αñ╛ αññαñ╛αñ░αñûαñ╛, αñòαñ┐αñéαñ╡αñ╛ αñ╡αñ┐αñªαÑìαñ»αñ╛αñ░αÑìαñÑαÑÇ αñ¬αÑìαñ░αñùαññαÑÇαñ¼αñªαÑìαñªαñ▓ αñ╡αñ┐αñÜαñ╛αñ░αñ╛. ≡ƒÿè",
            fees: "ZP αñ╢αñ╛αñ│αñ╛αñéαñ«αñºαÑìαñ»αÑç RTE αñòαñ╛αñ»αñªαÑìαñ»αñ╛αñ¿αÑüαñ╕αñ╛αñ░ αñ╢αÑüαñ▓αÑìαñò αñ¿αñ╛αñ╣αÑÇ. αñ╢αñ┐αñ╖αÑìαñ»αñ╡αÑâαññαÑìαññαÑÇ αñòαñ┐αñéαñ╡αñ╛ αñùαñúαñ╡αÑçαñ╢αñ╛αñ╕αñ╛αñáαÑÇ αñ«αÑüαñûαÑìαñ»αñ╛αñºαÑìαñ»αñ╛αñ¬αñòαñ╛αñéαñ╢αÑÇ αñ╕αñéαñ¬αñ░αÑìαñò αñòαñ░αñ╛.",
            homework: "αñùαÑâαñ╣αñ¬αñ╛αñá αñ╡αÑçαñ│αñ╛αñ¬αññαÑìαñ░αñò αñ╢αñ┐αñòαÑìαñ╖αñò αñªαñ░ αñ╢αÑüαñòαÑìαñ░αñ╡αñ╛αñ░αÑÇ αñàαñ¬αñ▓αÑïαñí αñòαñ░αññαñ╛αññ. αñ▓αÑëαñùαñ┐αñ¿ αñòαÑçαñ▓αÑìαñ»αñ╛αñ¿αñéαññαñ░ αñ╡αñ┐αñªαÑìαñ»αñ╛αñ░αÑìαñÑαÑÇ αñ¬αÑïαñ░αÑìαñƒαñ▓αñ╡αñ░ αñ¬αñ╣αñ╛.",
            attendance: "αñ╕αñºαÑìαñ»αñ╛αñÜαÑÇ αñ╕αñ░αñ╛αñ╕αñ░αÑÇ αñëαñ¬αñ╕αÑìαñÑαñ┐αññαÑÇ 87.4% αñåαñ╣αÑç. αññαÑüαñ«αñÜαÑìαñ»αñ╛ αñ«αÑüαñ▓αñ╛αñÜαÑÇ αñëαñ¬αñ╕αÑìαñÑαñ┐αññαÑÇ αñ¬αñ╛αñ▓αñò αñ¬αÑïαñ░αÑìαñƒαñ▓αñ╡αñ░ αñ¬αñ╣αñ╛.",
            exam: "αñ¬αÑüαñóαÑÇαñ▓ αñ¬αñ░αÑÇαñòαÑìαñ╖αñ╛: αñ»αÑüαñ¿αñ┐αñƒ αñƒαÑçαñ╕αÑìαñƒ 2 ΓÇö 18 αñ«αñ╛αñ░αÑìαñÜ 2026. αñàαñéαññαñ┐αñ« αñ¬αñ░αÑÇαñòαÑìαñ╖αñ╛ ΓÇö 12-20 αñÅαñ¬αÑìαñ░αñ┐αñ▓ 2026.",
            progress: "αñ«αñ╛αñ╕αñ┐αñò AI αñ¬αÑìαñ░αñùαññαÑÇ αñàαñ╣αñ╡αñ╛αñ▓ αñ¬αÑìαñ░αññαÑìαñ»αÑçαñò αñ«αñ╣αñ┐αñ¿αÑìαñ»αñ╛αñÜαÑìαñ»αñ╛ αñ¬αñ╣αñ┐αñ▓αÑìαñ»αñ╛ αññαñ╛αñ░αñûαÑçαñ▓αñ╛ αñëαñ¬αñ▓αñ¼αÑìαñº αñ╣αÑïαññαÑï.",
        }
    };

    function openVMChat() {
        vmOpen = true;
        vmPanel.classList.remove('hidden');
        setTimeout(() => { vmPanel.classList.add('visible'); vmInput.focus(); }, 10);
        vmFab.setAttribute('aria-expanded', 'true');
    }
    function closeVMChat() {
        vmOpen = false;
        vmPanel.classList.remove('visible');
        setTimeout(() => vmPanel.classList.add('hidden'), 350);
        vmFab.setAttribute('aria-expanded', 'false');
    }

    if (vmFab) vmFab.addEventListener('click', () => vmOpen ? closeVMChat() : openVMChat());
    if (closeVm) closeVm.addEventListener('click', closeVMChat);

    function addVMMessage(text, isUser = false) {
        const div = document.createElement('div');
        div.className = `vm-msg ${isUser ? 'vm-msg-user' : 'vm-msg-bot'}`;
        div.innerHTML = `<div class="vm-bubble">${text}</div>`;
        vmMessages.appendChild(div);
        vmMessages.scrollTop = vmMessages.scrollHeight;
    }

    function showTyping() {
        const t = document.createElement('div');
        t.className = 'vm-msg vm-msg-bot';
        t.id = 'vm-typing-indicator';
        t.innerHTML = `<div class="vm-bubble vm-typing"><span></span><span></span><span></span></div>`;
        vmMessages.appendChild(t);
        vmMessages.scrollTop = vmMessages.scrollHeight;
    }

    function getVMResponse(query) {
        const q = query.toLowerCase();
        const lang = currentLang;
        const r = vmResponses[lang] || vmResponses['en'];
        if (q.includes('fee') || q.includes('αñ╢αÑüαñ▓αÑìαñò')) return r.fees;
        if (q.includes('homework') || q.includes('αñùαÑâαñ╣αñ¬αñ╛αñá')) return r.homework;
        if (q.includes('attendance') || q.includes('αñëαñ¬αñ╕αÑìαñÑαñ┐αññαÑÇ')) return r.attendance;
        if (q.includes('exam') || q.includes('αñ¬αñ░αÑÇαñòαÑìαñ╖αñ╛')) return r.exam;
        if (q.includes('progress') || q.includes('αñ¬αÑìαñ░αñùαññαÑÇ')) return r.progress;
        return r.default;
    }

    function sendVMMessage() {
        const text = vmInput.value.trim();
        if (!text) return;
        addVMMessage(text, true);
        vmInput.value = '';
        showTyping();
        // Fetch from backend or use local fallback
        fetch('http://localhost:8000/api/vishwa-mitra/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, lang: currentLang })
        })
        .then(r => r.json())
        .then(data => {
            document.getElementById('vm-typing-indicator')?.remove();
            addVMMessage(data.reply);
        })
        .catch(() => {
            document.getElementById('vm-typing-indicator')?.remove();
            addVMMessage(getVMResponse(text));
        });
    }

    if (vmSend) vmSend.addEventListener('click', sendVMMessage);
    if (vmInput) vmInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendVMMessage(); });

    // Voice Input (Web Speech API)
    if (vmVoice) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognizer = new SpeechRecognition();
            recognizer.continuous = false;
            recognizer.interimResults = false;

            vmVoice.addEventListener('click', () => {
                recognizer.lang = currentLang === 'mr' ? 'mr-IN' : 'en-IN';
                recognizer.start();
                vmVoice.classList.add('listening');
                vmVoice.setAttribute('aria-label', 'Listening...');
            });
            recognizer.onresult = e => {
                vmInput.value = e.results[0][0].transcript;
                vmVoice.classList.remove('listening');
                vmVoice.setAttribute('aria-label', 'Start voice input');
                sendVMMessage();
            };
            recognizer.onerror = () => {
                vmVoice.classList.remove('listening');
                vmVoice.setAttribute('aria-label', 'Start voice input');
            };
        } else {
            vmVoice.title = "Voice not supported in this browser";
            vmVoice.style.opacity = '0.5';
        }
    }

    /* ======================================================
       CHARTS ΓÇö Attendance & Competency
    ====================================================== */
    let attChart = null;
    let compChart = null;

    function fetchAttendanceData() {
        fetch('http://localhost:8000/api/analytics/attendance')
            .then(r => r.json())
            .then(data => {
                const ctx = document.getElementById('attendanceChart');
                if (!ctx) return;
                if (attChart) attChart.destroy();
                attChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.labels,
                        datasets: [
                            { label: 'Avg Attendance (%)', data: data.attendance, borderColor: '#1A237E', backgroundColor: 'rgba(26,35,126,0.08)', fill: true, tension: 0.4, borderWidth: 3, pointBackgroundColor: '#fff', pointBorderColor: '#1A237E', pointRadius: 5 },
                            { label: 'Dropout Risk', data: data.dropout, borderColor: '#FF9933', backgroundColor: 'transparent', borderDash: [5,5], tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#FF9933' }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, max: 100 }, x: { grid: { display: false } } }, animation: { duration: 1500 } }
                });
            })
            .catch(err => console.warn("Analytics API offline:", err));
    }

    function fetchCompetencyData() {
        fetch('http://localhost:8000/api/analytics/competency')
            .then(r => r.json())
            .then(data => {
                const ctx = document.getElementById('competencyChart');
                if (!ctx) return;
                if (compChart) compChart.destroy();
                compChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [
                            { label: 'Current Mastery (%)', data: data.mastery, backgroundColor: '#1A237E', borderRadius: 6 },
                            { label: 'State Benchmark (%)', data: data.benchmark, backgroundColor: '#FF9933', borderRadius: 6 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, max: 100 }, x: { grid: { display: false } } }, animation: { duration: 1500 } }
                });
            })
            .catch(err => console.warn("Analytics API offline:", err));
    }

    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            fetchAttendanceData();
            fetchCompetencyData();
        }
    }, 400);

    const refAtt = document.getElementById('refresh-att');
    const refComp = document.getElementById('refresh-comp');
    if (refAtt) refAtt.addEventListener('click', fetchAttendanceData);
    if (refComp) refComp.addEventListener('click', fetchCompetencyData);

    /* ======================================================
       AI TEACHER ASSISTANT (Slide 2 Widget)
    ====================================================== */
    function runAIEngine() {
        const introBubble = document.getElementById('ai-intro-bubble');
        const badge = document.getElementById('ai-badge');
        const statusTxt = document.getElementById('ai-status-text');
        const typeTarget = document.querySelector('.type-target');
        const activitiesBox = document.getElementById('ai-activities-box');
        const activitiesList = document.getElementById('ai-activities-list');
        const dlBtn = document.getElementById('dl-btn');
        if (!badge || !statusTxt) return;

        fetch('http://localhost:8000/api/ai/generate_lesson')
            .then(r => r.json())
            .then(data => {
                if (introBubble) introBubble.style.display = 'block';
                badge.className = 'badge-sm';
                badge.style.cssText = 'background:#2E7D32;color:#fff;border-color:#2E7D32;';
                badge.innerHTML = '<i class="fa-solid fa-bolt"></i> Ready';
                statusTxt.innerText = 'Streaming Response...';

                const text = data.intro_text;
                typeTarget.classList.add('typing-cursor');
                let i = 0;
                const interval = setInterval(() => {
                    typeTarget.textContent += text.charAt(i); i++;
                    if (i >= text.length) {
                        clearInterval(interval);
                        typeTarget.classList.remove('typing-cursor');
                        statusTxt.innerText = 'Lesson Generation Complete';
                        setTimeout(() => {
                            activitiesBox.classList.remove('hidden');
                            data.activities.forEach((act, idx) => {
                                setTimeout(() => {
                                    const li = document.createElement('li'); li.textContent = act;
                                    li.style.cssText = 'opacity:0;transform:translateX(-10px);transition:all 0.4s;';
                                    activitiesList.appendChild(li);
                                    requestAnimationFrame(() => { li.style.opacity = '1'; li.style.transform = 'translateX(0)'; });
                                }, idx * 400);
                            });
                            if (dlBtn) { dlBtn.disabled = false; dlBtn.classList.replace('btn-outline', 'btn-primary'); }
                        }, 500);
                    }
                }, 40);
            })
            .catch(() => { if (statusTxt) statusTxt.innerText = "Agent Offline"; });
    }
    setTimeout(runAIEngine, 1200);

    /* ======================================================
       NOTICE BOARD + EVENTS (Landing Page)
    ====================================================== */

    // Set today's date in ticker
    const tickerDate = document.getElementById('ticker-date');
    if (tickerDate) {
        tickerDate.textContent = new Date().toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'});
    }

    const typeTagMap = {
        exam:    { cls:'tag-exam',    icon:'fa-file-pen',     label:'EXAM' },
        result:  { cls:'tag-result',  icon:'fa-award',        label:'RESULT' },
        holiday: { cls:'tag-holiday', icon:'fa-umbrella-beach', label:'HOLIDAY' },
        meeting: { cls:'tag-meeting', icon:'fa-users',        label:'MEETING' },
        event:   { cls:'tag-event',   icon:'fa-star',         label:'EVENT' },
    };

    async function loadNoticeBoard() {
        // Load ticker
        const ticker = document.getElementById('notice-ticker');
        const eventsList = document.getElementById('events-list');
        const resultsList = document.getElementById('results-list');
        if (!ticker && !eventsList) return;

        try {
            const [noticesData, eventsData, resultsData] = await Promise.all([
                fetch('http://localhost:8000/api/notices').then(r => r.json()),
                fetch('http://localhost:8000/api/events').then(r => r.json()),
                fetch('http://localhost:8000/api/results').then(r => r.json()),
            ]);

            // --- TICKER ---
            if (ticker) {
                const items = noticesData.notices || [];
                ticker.innerHTML = items.map(n =>
                    `<span style="color:rgba(255,255,255,.9);font-size:.82rem;font-weight:500;margin-right:3rem;">${n}</span>`
                ).join('') + items.map(n =>
                    `<span style="color:rgba(255,255,255,.9);font-size:.82rem;font-weight:500;margin-right:3rem;">${n}</span>`
                ).join('');
            }

            // --- EVENTS ---
            if (eventsList) {
                eventsList.innerHTML = eventsData.map(ev => {
                    const t = typeTagMap[ev.type] || typeTagMap.event;
                    return `<div class="event-card event-card-${ev.type}">
                        <div class="event-date-box"><div class="ed-day">${ev.day}</div><div class="ed-mon">${ev.month}</div></div>
                        <div>
                            <span class="event-tag ${t.cls}" style="margin-bottom:.35rem;display:inline-block;">
                                <i class="fa-solid ${t.icon}"></i> ${t.label}
                            </span>
                            <strong style="display:block;font-size:.9rem;color:#1C1C2E;" class="lang-en">${ev.title}</strong>
                            <strong style="display:block;font-size:.9rem;color:#1C1C2E;" class="lang-mr hidden">${ev.title_mr}</strong>
                            <span style="font-size:.78rem;color:#64748B;" class="lang-en">${ev.desc}</span>
                            <span style="font-size:.78rem;color:#64748B;" class="lang-mr hidden">${ev.desc_mr}</span>
                        </div>
                    </div>`;
                }).join('');
            }

            // --- RESULTS ---
            if (resultsList) {
                resultsList.innerHTML = resultsData.map(r =>
                    `<div class="result-row ${r.is_new ? 'result-new' : ''}">
                        <div>
                            <strong style="font-size:.88rem;" class="lang-en">${r.title}</strong>
                            <strong style="font-size:.88rem;" class="lang-mr hidden">${r.title_mr}</strong>
                            <div style="font-size:.73rem;color:#64748B;margin-top:.15rem;">${r.date}</div>
                        </div>
                        ${r.is_new ? '<span style="background:#E8F5E9;color:#2E7D32;font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap;">NEW Γ£ô</span>' : ''}
                    </div>`
                ).join('');
            }

        } catch(e) {
            // Fallback static ticker if offline
            if (ticker) {
                ticker.innerHTML = `<span style="color:rgba(255,255,255,.8);font-size:.82rem;padding:0 2rem;">≡ƒôó Unit Test 2 on 18 March 2026 &nbsp;|&nbsp; ≡ƒæ¿ΓÇì≡ƒæ⌐ΓÇì≡ƒæº Parent-Teacher Meeting 22 March &nbsp;|&nbsp; ≡ƒôï Unit Test 1 Results Declared &nbsp;|&nbsp; ≡ƒÄë Gudi Padwa Holiday 29 March</span>`;
            }
            if (eventsList) {
                eventsList.innerHTML = `<div class="event-card"><div class="event-date-box"><div class="ed-day">18</div><div class="ed-mon">MAR</div></div><div><strong>Unit Test 2 ΓÇö All Subjects</strong><br><span style="font-size:.78rem;color:#64748B">Class 5ΓÇô8 | 8:00 AM</span></div></div>`;
            }
        }
    }

    loadNoticeBoard();

});

