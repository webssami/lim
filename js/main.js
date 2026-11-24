/* ==========================================================
   임경미 UI/UX 포트폴리오 - main.js  (순수 JavaScript, 라이브러리 없음)
   1. 설정값
   2. 부드러운 스크롤 / 헤더 / 메뉴 활성화
   3. 모바일 메뉴 열기·닫기
   4. 포트폴리오 탭 필터 + 더보기
   5. 문의하기 팝업 + 메일 전송
   ========================================================== */
(function () {
  'use strict';

  /* ───────── 1. 설정값 (필요하면 여기만 수정하세요) ───────── */
  var HEADER_OFFSET = 90;       // 고정 헤더 높이만큼 보정해서 스크롤
  var DEFAULT_VISIBLE = 4;      // 포트폴리오 기본 노출 개수
  var CONTACT_EMAIL = 'gyungmi0803@naver.com';   // 문의 메일을 받을 주소

  // 메일 전송 방식: FormSubmit (무료 · 회원가입 불필요 · 서버 필요 없음)
  //  - 방문자가 "문의 보내기"를 누르면 FormSubmit 이 위 메일 주소로 내용을 대신 보내 줍니다.
  //  - 최초 1회 : 사이트를 웹에 올린 뒤 직접 테스트 전송 → 네이버 메일(스팸함 포함)로 오는
  //               FormSubmit "Activate Form" 버튼을 누르면 이후부터 계속 받아집니다.
  //  - 다른 서비스(Formspree, Web3Forms 등)로 바꾸려면 아래 주소만 교체하세요.
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + CONTACT_EMAIL;
  var LABEL_MORE = '전체 프로젝트 보기';
  var LABEL_LESS = '접기';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ───────── 2. 부드러운 스크롤 / 헤더 / 메뉴 활성화 ───────── */
  var header = $('.header');
  var nav = $('#nav');
  var toggleBtn = $('#menuToggle');
  var navLinks = $$('.header__nav a[data-scroll]');
  var sectionIds = navLinks.map(function (a) { return a.getAttribute('data-scroll'); });
  var menuOpen = false;

  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = id === 'home' ? 0 : el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  // data-scroll="섹션id" 가 붙은 링크/버튼을 누르면 해당 섹션으로 이동
  $$('[data-scroll]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      // 헤더 안의 메뉴를 눌렀을 때만 모바일 메뉴를 닫음
      if (header.contains(el)) setMenu(false);
      scrollToSection(el.getAttribute('data-scroll'));
    });
  });

  // 스크롤 위치에 따라 헤더 배경 / 현재 메뉴 표시
  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 20 || menuOpen);
  }

  function updateActiveNav() {
    var line = HEADER_OFFSET + window.innerHeight * 0.25;
    var current = sectionIds[0];
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) current = id;
    });
    // 페이지 맨 아래에 닿으면 마지막 메뉴 활성화
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = sectionIds[sectionIds.length - 1];
    }
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-scroll') === current);
    });
  }

  function onScroll() {
    updateHeader();
    updateActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateActiveNav);
  onScroll();

  /* ───────── 3. 모바일 메뉴 열기·닫기 ───────── */
  function setMenu(open) {
    menuOpen = open;
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-menu-open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    toggleBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    updateHeader();
  }
  toggleBtn.addEventListener('click', function () { setMenu(!menuOpen); });

  /* ───────── 4. 포트폴리오 탭 필터 + 더보기 ───────── */
  var tabs = $$('.pf-tab');
  var headGrid = $('#pfHead');
  var moreWrap = $('#pfMore');
  var moreGrid = $('#pfMoreGrid');
  var moreBtnWrap = $('#pfMoreBtn');
  var moreBtn = $('#pfMoreToggle');
  var moreLabel = $('#pfMoreLabel');

  // HTML 에 적힌 카드 8개를 순서대로 모아둡니다.
  var cards = $$('.pf-card');
  var currentTab = 'all';
  var expanded = false;

  function renderPortfolio() {
    var list = currentTab === 'all'
      ? cards
      : cards.filter(function (c) { return c.getAttribute('data-category') === currentTab; });

    headGrid.innerHTML = '';
    moreGrid.innerHTML = '';

    if (list.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'pf-empty';
      empty.textContent = '등록된 프로젝트가 없습니다.';
      headGrid.appendChild(empty);
    }
    list.slice(0, DEFAULT_VISIBLE).forEach(function (c) { headGrid.appendChild(c); });
    list.slice(DEFAULT_VISIBLE).forEach(function (c) { moreGrid.appendChild(c); });

    var hasRest = list.length > DEFAULT_VISIBLE;
    moreWrap.hidden = !hasRest;
    moreBtnWrap.hidden = !hasRest;

    moreWrap.classList.toggle('is-open', expanded);
    moreWrap.setAttribute('aria-hidden', String(!expanded));
    moreBtn.classList.toggle('is-open', expanded);
    moreBtn.setAttribute('aria-expanded', String(expanded));
    moreLabel.textContent = expanded ? LABEL_LESS : LABEL_MORE;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      currentTab = tab.getAttribute('data-tab');
      expanded = false;
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      renderPortfolio();
    });
  });

  moreBtn.addEventListener('click', function () {
    expanded = !expanded;
    renderPortfolio();
  });

  renderPortfolio();

  /* ───────── 5. 문의하기 팝업 + 메일 전송 ───────── */
  var modal = $('#contactModal');
  var form = $('#contactForm');
  var msgOk = $('#msgOk');
  var msgErr = $('#msgErr');
  var mailFallback = $('#mailFallback');
  var msgErrText = $('#msgErrText');
  var submitBtn = $('#submitBtn');

  var MSG_DEFAULT_ERR = '전송에 실패했습니다. 아래 버튼으로 메일 앱에서 직접 보내주세요.';
  var MSG_LOCAL_FILE = '파일을 더블클릭해서 연 상태에서는 메일 전송이 제한됩니다. 웹에 올린 주소(또는 Live Server)에서 다시 시도하거나, 아래 버튼으로 메일 앱에서 직접 보내주세요.';
  var MSG_ACTIVATE = '메일 수신 활성화가 아직 완료되지 않았습니다. 네이버 메일함(스팸함 포함)에 도착한 FormSubmit 확인 메일의 "Activate Form" 버튼을 눌러 주세요. 그 전에는 아래 버튼으로 메일 앱에서 직접 보내주세요.';

  function setStatus(status, errText) { // idle | sending | success | error
    msgOk.hidden = status !== 'success';
    msgErr.hidden = status !== 'error';
    msgErrText.textContent = errText || MSG_DEFAULT_ERR;
    submitBtn.disabled = status === 'sending';
    submitBtn.textContent = status === 'sending' ? '전송 중...' : '문의 보내기';
  }

  function openModal() {
    form.reset();
    setStatus('idle');
    modal.hidden = false;
    document.body.style.overflow = 'hidden'; // 배경 스크롤 잠금
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  $('#openContact').addEventListener('click', openModal);
  $('#closeContact').addEventListener('click', closeModal);

  // 어두운 배경을 누르면 닫기
  modal.addEventListener('mousedown', function (e) {
    if (e.target === modal) closeModal();
  });

  // ESC 로 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#cf-name').value.trim();
    var phone = $('#cf-phone').value.trim();
    var message = $('#cf-message').value.trim();

    // 스팸 방지: 숨김 칸이 채워져 있으면 로봇으로 보고 전송하지 않음 (사람에게는 성공처럼 보임)
    if ($('#cf-honey').value) { setStatus('success'); form.reset(); return; }

    setStatus('sending');

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        '이름': name,
        '연락처': phone,
        '문의내용': message,
        _subject: '[포트폴리오 문의] ' + name,
        _template: 'table',
        _captcha: 'false'
      })
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          var failed = !res.ok || data.success === 'false' || data.success === false;
          if (failed) {
            var err = new Error(data.message || 'send failed');
            err.serverMessage = data.message || '';
            throw err;
          }
        });
      })
      .then(function () {
        setStatus('success');
        form.reset();
      })
      .catch(function (err) {
        // 실패 시 "메일 앱으로 보내기" 링크를 준비해서 문의 내용을 잃지 않도록 함
        mailFallback.href = 'mailto:' + CONTACT_EMAIL +
          '?subject=' + encodeURIComponent('[포트폴리오 문의] ' + name) +
          '&body=' + encodeURIComponent('이름: ' + name + '\n연락처: ' + phone + '\n\n' + message);

        var text = MSG_DEFAULT_ERR;
        if (/activat/i.test(err.serverMessage || '')) text = MSG_ACTIVATE;
        else if (location.protocol === 'file:') text = MSG_LOCAL_FILE;
        setStatus('error', text);
      });
  });
})();
