(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('site-header');
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('site-nav');
  var mq = window.matchMedia('(max-width: 1079px)');

  /* Header shadow on scroll */
  function onScroll(){ header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  /* Mobile menu */
  function setMenu(open, returnFocus){
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    toggle.querySelector('span').textContent = open ? 'Close' : 'Menu';
    if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    else if (returnFocus) { toggle.focus(); }
  }
  toggle.addEventListener('click', function(){ setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function(e){ if (e.target.closest('a') && mq.matches) setMenu(false); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', function(e){
    if (mq.matches && toggle.getAttribute('aria-expanded') === 'true' && !header.contains(e.target)) setMenu(false);
  });
  mq.addEventListener('change', function(e){ if (!e.matches) setMenu(false); });

  /* Image fallbacks if an image failed before this script ran */
  document.querySelectorAll('.team-photo img').forEach(function(img){
    if (img.complete && img.naturalWidth === 0) img.remove();
  });

  /* BASTON details: See more / Show less */
  var region = document.getElementById('baston-details');
  var toggles = document.querySelectorAll('.js-baston-toggle');
  var mainToggle = document.getElementById('baston-toggle');
  function setDetails(open, fromBottom){
    region.hidden = !open;
    toggles.forEach(function(b){ b.setAttribute('aria-expanded', String(open)); });
    mainToggle.querySelector('.t').textContent = open ? 'Show less about BASTON' : 'See more about BASTON';
    if (open){
      if (!reduce){ region.classList.remove('opening'); void region.offsetWidth; region.classList.add('opening'); }
    } else if (fromBottom){
      document.getElementById('products').scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
      mainToggle.focus({preventScroll:true});
    }
  }
  toggles.forEach(function(b){
    b.addEventListener('click', function(){
      var open = region.hidden;
      setDetails(open, b !== mainToggle);
      if (open){ var first = document.getElementById('need'); if (first) first.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'}); }
    });
  });
  /* Links to content inside the collapsed region open it first */
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.getElementById(a.getAttribute('href').slice(1));
    if (t && region.contains(t) && region.hidden) setDetails(true, false);
  });
  if (location.hash){
    var h = document.getElementById(location.hash.slice(1));
    if (h && region.contains(h)){ setDetails(true, false); setTimeout(function(){ h.scrollIntoView(); }, 0); }
  }

  if (!('IntersectionObserver' in window)) return;

  /* Active nav link */
  var links = {};
  nav.querySelectorAll('a[href^="#"]').forEach(function(a){ links[a.getAttribute('href').slice(1)] = a; });
  var map = {home:'home', intro:'home', 'core-values':'core-values', mission:'mission', products:'products', need:'products', 'baston-about':'products', technology:'products', system:'products', features:'products', research:'products', faq:'products', 'about-us':'about-us', contact:'contact'};
  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      var key = map[en.target.id];
      Object.keys(links).forEach(function(k){ links[k].removeAttribute('aria-current'); });
      if (key && links[key]) links[key].setAttribute('aria-current','true');
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  Object.keys(map).forEach(function(id){ var el=document.getElementById(id); if (el) spy.observe(el); });

  if (reduce) return;

  /* Gentle reveal for content below the first screen (content is visible at rest) */
  var vh = window.innerHeight;
  var revealObs = new IntersectionObserver(function(entries, obs){
    entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); obs.unobserve(en.target); } });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(el){
    if (el.getBoundingClientRect().top > vh) revealObs.observe(el);
  });

  /* Process connectors draw in once */
  var proc = document.getElementById('process');
  if (proc && proc.getBoundingClientRect().top > vh){
    new IntersectionObserver(function(en, obs){ if (en[0].isIntersecting){ proc.classList.add('animate'); obs.disconnect(); } }, {threshold:.35}).observe(proc);
  }

  /* Research figures count up once, ending on the exact reported value */
  var metrics = document.getElementById('metrics');
  if (metrics && metrics.getBoundingClientRect().top > vh){
    new IntersectionObserver(function(en, obs){
      if (!en[0].isIntersecting) return; obs.disconnect();
      metrics.querySelectorAll('[data-count]').forEach(function(el){
        var finalText = el.textContent, target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '';
        var dec = (el.dataset.count.split('.')[1] || '').length, start = null, dur = 1100;
        el.setAttribute('aria-label', finalText);
        function step(ts){
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = p < 1 ? (target * eased).toFixed(dec) + suffix : finalText;
          if (p < 1) requestAnimationFrame(step); else el.removeAttribute('aria-label');
        }
        requestAnimationFrame(step);
      });
    }, {threshold:.4}).observe(metrics);
  }
})();

/* Contact form: accessible validation and honest status messages */
(function(){
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var submit = document.getElementById('cf-submit');
  var alertIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-alert"/></svg>';
  var fields = {
    name: {el: document.getElementById('cf-name'), msg: function(v){ return v.trim() ? '' : 'Enter your name.'; }},
    email: {el: document.getElementById('cf-email'), msg: function(v){
      if (!v.trim()) return 'Enter your email address.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email address in the format name@example.com.';
    }},
    message: {el: document.getElementById('cf-message'), msg: function(v){
      if (!v.trim()) return 'Enter a message.';
      return v.trim().length < 10 ? 'Your message is a little short. Add a few more details (at least 10 characters).' : '';
    }}
  };
  function show(key){
    var f = fields[key], m = f.msg(f.el.value), err = document.getElementById(f.el.id + '-error');
    if (m){ f.el.setAttribute('aria-invalid','true'); err.innerHTML = alertIcon + '<span>' + m + '</span>'; err.hidden = false; }
    else { f.el.removeAttribute('aria-invalid'); err.hidden = true; err.textContent = ''; }
    return !m;
  }
  Object.keys(fields).forEach(function(k){
    fields[k].el.addEventListener('blur', function(){ if (fields[k].el.value) show(k); });
    fields[k].el.addEventListener('input', function(){ if (fields[k].el.getAttribute('aria-invalid') === 'true') show(k); });
  });
  function setStatus(type, html){
    var icon = type === 'success' ? '#i-check' : type === 'error' ? '#i-alert' : '#i-info';
    status.innerHTML = '<div class="status-box ' + type + '"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="' + icon + '"/></svg><div>' + html + '</div></div>';
  }
  function esc(s){ return s.replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    status.innerHTML = '';
    var firstBad = null;
    Object.keys(fields).forEach(function(k){ if (!show(k) && !firstBad) firstBad = fields[k].el; });
    if (firstBad){
      setStatus('error', 'Please fix the highlighted fields and try again.');
      firstBad.focus();
      return;
    }
    if (document.getElementById('cf-company').value) return; /* spam trap */

    var name = esc(fields.name.el.value.trim().split(' ')[0]);
    var endpoint = form.dataset.endpoint;
    if (!endpoint){
      setStatus('info', '<strong>Thanks, ' + name + '.</strong> Your message looks good, but this form is not connected to an inbox yet, so it has not been sent.');
      return;
    }
    submit.setAttribute('aria-busy','true'); submit.disabled = true;
    fetch(endpoint, {method:'POST', body:new FormData(form), headers:{'Accept':'application/json'}})
      .then(function(r){
        if (!r.ok) throw new Error('bad');
        form.reset();
        setStatus('success', '<strong>Thanks, ' + name + '. Your message has been sent.</strong>');
      })
      .catch(function(){
        setStatus('error', 'Your message could not be sent. Check your connection and try again.');
      })
      .then(function(){ submit.removeAttribute('aria-busy'); submit.disabled = false; });
  });
})();
