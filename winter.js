function wdNextMatchDetails(match, events) {
  var date = parseClanDate(match.week);
  var key = date ? calendarDateKey(date) : '';
  var title = String(match.title || '').trim();
  var sides = title.split(/\s+(?:vs\.?|versus|v\.)\s+/i);
  var isWD = function(value) { return /^(?:white\s*dragon(?:\s*\[wd\])?|wd(?:\s*\[wd\])?)$/i.test(value.trim()); };
  var opponent = sides.length === 2 && (isWD(sides[0]) || isWD(sides[1])) ? (isWD(sides[0]) ? sides[1] : sides[0]).trim() : '';
  var norm = function(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]/g,''); };
  var linked = (events || []).filter(function(event) {
    if (!key || event.date !== key) return false;
    return event.matchId ? String(event.matchId) === String(match.id) : norm(event.title) === norm(title);
  });
  var note = String(match.note || '');
  var zone = String(match.tz || match.timezone || '').toUpperCase();
  var time = typeof match.time === 'string' ? match.time : '';
  if (!time && linked.length === 1) { time = linked[0].time || ''; zone = String(linked[0].tz || '').toUpperCase(); }
  if (!time) {
    var found = note.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(CET|CEST|EST|EDT|ET)\b/i);
    if (found) {
      var hour = Number(found[1]), minute = Number(found[2] || 0), period = (found[3] || '').toLowerCase();
      if ((!period && hour < 24 || period && hour >= 1 && hour <= 12) && minute < 60) {
        if (period) hour = hour % 12 + (period === 'pm' ? 12 : 0);
        time = String(hour).padStart(2,'0') + ':' + String(minute).padStart(2,'0'); zone = found[4].toUpperCase();
      }
    }
  }
  var dual = null;
  if (key && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) && /^(CET|CEST|EST|EDT|ET)$/.test(zone)) {
    dual = getDualTimeStrings(key, time, /^(EST|EDT|ET)$/.test(zone) ? 'EST' : 'CET');
  }
  var maps = [];
  if (typeof match.maps === 'string' && match.maps.trim()) maps.push(match.maps.trim());
  if (Array.isArray(match.maps)) match.maps.forEach(function(map) { if (typeof map === 'string' && map.trim()) maps.push(map.trim()); });
  if (!maps.length) {
    var pattern = /\b([12](?:v|n)[12])\s*(?:MOTW|maps?)\s*:\s*([^|\n]+)/gi, item;
    while ((item = pattern.exec(note))) maps.push(item[1].replace(/n/i,'v') + ': ' + item[2].trim());
    if (!maps.length) { var plain = note.match(/\bmaps?\s*:\s*([^\n]+)/i); if (plain) maps.push(plain[1].trim()); }
  }
  return { date:date, dateKey:key, opponent:opponent, title:title, maps:maps, dual:dual };
}

function winterRefreshNextMatch() {
  var container = document.getElementById('winter-next-content');
  if (!container) return;
  container.replaceChildren();
  var today = new Date(); today.setHours(0,0,0,0);
  var next = firestoreMatches.filter(function(match) {
    var date = parseClanDate(match.week);
    return String(match.resultType || '').trim().toUpperCase() === 'UPCOMING' && (!date || date >= today);
  }).sort(function(a,b) { var x=parseClanDate(a.week),y=parseClanDate(b.week);return (x?x.getTime():Infinity)-(y?y.getTime():Infinity); })[0];
  var element = function(tag, cls, text) { var node=document.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node; };
  if (!next) { container.appendChild(element('p','winter-empty','No upcoming match scheduled.'));return; }
  var details = wdNextMatchDetails(next, typeof clanEvents !== 'undefined' ? clanEvents : []);
  var teams=element('div','next-teams');
  function team(name, file) {
    var box=element('div','next-team');
    if (file) { var img=element('img','next-clan-logo');img.src=file;img.alt='';img.width=90;img.height=90;img.onerror=function(){this.hidden=true;};box.appendChild(img); }
    box.appendChild(element('strong','',name));return box;
  }
  teams.append(team('White Dragon','christmas-logo.jpg'),element('span','next-versus','VS'),team(details.opponent || 'Opponent TBA', details.opponent ? wdClanLogoPath(details.opponent) : ''));
  container.appendChild(teams);
  if (!details.opponent) container.appendChild(element('p','next-raw-title',details.title));
  var metadata=element('dl','next-metadata');
  function field(label,value){var group=element('div','next-meta-field'+(label==='Maps'?' next-meta-maps':''));group.append(element('dt','',label),element('dd','',value));metadata.appendChild(group);}
  field('Date',details.date ? details.date.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}) : 'Date to be confirmed');
  if (details.dual) {
    var values=[details.dual.source,details.dual.target];
    field('Germany',values.find(function(v){return /CEST|CET/.test(v);}) || 'Time to be confirmed');
    field('US Eastern',values.find(function(v){return /EDT|EST/.test(v);}) || 'Time to be confirmed');
  } else field('Time · CET / EST','To be confirmed');
  field('Maps',details.maps.length ? details.maps.join(' · ') : 'To be confirmed');
  var footer=element('div','next-footer');footer.appendChild(metadata);container.appendChild(footer);
  var button=element('button','winter-primary','Match details →');button.type='button';button.onclick=function(){openCalendarMatch(next.id);};footer.appendChild(button);
}

function renderWDCalendarAgenda(allItems) {
  var list = document.getElementById('winter-agenda-list');
  if (!list) return;
  list.replaceChildren();
  var today = calendarDateKey(new Date());
  var selected = selectedCalendarKey || today;
  var selectedItems = allItems.filter(function(item) { return item.key === selected; });
  var items = selectedItems.length ? selectedItems : allItems.filter(function(item) { return item.key >= today; });
  document.getElementById('winter-agenda-title').textContent = selectedItems.length ? 'Selected day' : 'Upcoming events';
  items = items.slice().sort(function(a, b) { return a.time - b.time; }).slice(0, 4);
  if (!items.length) {
    var empty = document.createElement('p');
    empty.className = 'winter-empty';
    empty.textContent = 'No upcoming events scheduled.';
    list.appendChild(empty);
  }
  items.forEach(function(item) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'winter-event';
    var date = document.createElement('time');
    date.dateTime = item.key;
    date.textContent = new Date(item.time).toLocaleDateString('en-US', { month:'short', day:'numeric' });
    var text = document.createElement('span');
    var title = document.createElement('strong');
    title.textContent = item.title;
    var category = document.createElement('small');
    category.textContent = calendarCategoryLabel(item);
    text.append(title, category);
    button.append(date, text);
    button.onclick = function() { selectClanCalendarDay(item.key); };
    list.appendChild(button);
  });
  winterRefreshNextMatch();
}

(function() {
  var notice = document.getElementById('webmaster-banner');
  var topbar = document.querySelector('.winter-topbar');
  if (notice && topbar) topbar.before(notice);
  var tools = document.getElementById('winter-account-tools');
  var auth = document.getElementById('floatingAuthBtn');
  var privacy = document.getElementById('floatingPrivacyBtn');
  var traffic = document.getElementById('traffic-monitor-hud');
  if (auth) tools.prepend(auth);
  var footer = document.getElementById('winter-footer-tools');
  if (traffic) footer.appendChild(traffic);
  if (privacy) footer.appendChild(privacy);
  var register = document.getElementById('winter-register');
  register.onclick = function() {
    openAuthModal();
    if (!currentReplayUser()) switchAuthView('register');
  };
  function authChanged() { register.hidden = Boolean(currentReplayUser()); }
  if (auth) new MutationObserver(authChanged).observe(auth, { childList:true, subtree:true, attributes:true, attributeFilter:['class'] });
  authChanged();
  renderClanCalendar();
})();
