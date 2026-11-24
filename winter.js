function wdRecordedMatchResult(match,today) {
  if(!match)return null;
  var date=parseClanDate(match.week);if(!date||calendarDateKey(date)>today)return null;
  var state=String(match.resultType||'').trim().toUpperCase();
  if(/^(CANCELLED|CANCELED|POSTPONED)$/.test(state))return null;
  var number=String(match.score||'').match(/\b(\d+)\s*[-:–]\s*(\d+)\b/);
  var score=number?number[1]+' – '+number[2]:'';
  if(/^(WIN|LOSS|DRAW)$/.test(state))return {outcome:state,score:score,statusPending:false};
  if(!/^(UPCOMING|PENDING)$/.test(state)||!number)return null;
  var sets=Array.isArray(match.sets)?match.sets:typeof match.sets==='string'?match.sets.split(/\r?\n/):[];
  sets=sets.filter(function(set){return typeof set!=='string'||set.trim();});
  if(!sets.length||!sets.every(function(set){return Boolean(wdParseStatsSet(set));}))return null;
  return {outcome:Number(number[1])>Number(number[2])?'WIN':Number(number[1])<Number(number[2])?'LOSS':'DRAW',score:score,statusPending:true};
}
function wdLatestCompletedMatch(matches, today) {
  return (Array.isArray(matches)?matches:[]).filter(function(match){
    return Boolean(wdRecordedMatchResult(match,today));
  }).slice().sort(function(a,b){return parseClanDate(b.week)-parseClanDate(a.week)||String(a.id||'').localeCompare(String(b.id||''));})[0] || null;
}
function wdAppendLastMatch(container) {
  var match=wdLatestCompletedMatch(getMatchesList(),calendarDateKey(new Date()));
  var panel=document.createElement('div');panel.className='last-match-summary';
  var heading=document.createElement('span');heading.className='last-match-label';heading.textContent='Last match result';panel.appendChild(heading);
  if(!match){var empty=document.createElement('span');empty.textContent='No completed match recorded.';panel.appendChild(empty);container.appendChild(panel);return;}
  var row=document.createElement('div');row.className='last-match-row';
  var identity=document.createElement('div');identity.className='last-match-identity';
  var details=wdNextMatchDetails(match,[]);
  var marks=document.createElement('div');marks.className='last-match-marks';
  function addMark(file,label){if(!file)return;var logo=document.createElement('img');logo.src=file;logo.alt=label;logo.width=42;logo.height=42;logo.onerror=function(){this.hidden=true;};marks.appendChild(logo);}
  addMark(wdClanLogoPath('White Dragon'),'White Dragon');
  if(details.opponent){var logoPath=wdClanLogoPath(details.opponent);if(logoPath){var versus=document.createElement('span');versus.className='last-match-vs';versus.textContent='VS';marks.appendChild(versus);addMark(logoPath,details.opponent);}}
  identity.appendChild(marks);
  var text=document.createElement('div');var title=document.createElement('strong');title.textContent=String(match.title||'Match');var date=document.createElement('small');date.textContent=parseClanDate(match.week).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});text.append(title,date);identity.appendChild(text);
  var recorded=wdRecordedMatchResult(match,calendarDateKey(new Date()));
  var result=document.createElement('strong');result.className='last-match-result result-'+recorded.outcome.toLowerCase();
  // Show only a recorded fixture score; do not infer a clan-war score from individual maps.
  var score=String(match.score||'').trim();var number=score.match(/\b(\d+)\s*[-:–]\s*(\d+)\b/);
  result.textContent=recorded.outcome+(recorded.score?' · '+recorded.score:'');
  if(recorded.statusPending)result.title='Recorded score; fixture status has not yet been updated.';
  var button=document.createElement('button');button.type='button';button.className='last-match-details';button.textContent='Details →';button.onclick=function(){openCalendarMatch(match.id);};
  row.append(identity,result,button);panel.appendChild(row);container.appendChild(panel);
}

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
    dual = wdMatchDualTime(key, time, /^(EST|EDT|ET)$/.test(zone) ? 'EST' : 'CET');
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
  if (!next) { container.appendChild(element('p','winter-empty','No upcoming match scheduled.'));wdAppendLastMatch(container);return; }
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
    var eastern=[details.dual.source,details.dual.target].find(function(value){return /EDT|EST/.test(value);}) || '';
    var label=/EDT/.test(eastern)?'Time (EDT)':'Time (EST)';
    field(label,eastern.replace(/\s+(?:EST|EDT)\b/,'') || 'TBA');
  } else field('Time (EST)','TBA');
  field('Maps',details.maps.length ? details.maps.join(' · ') : 'To be confirmed');
  var footer=element('div','next-footer');footer.appendChild(metadata);container.appendChild(footer);
  var button=element('button','winter-primary','Match details →');button.type='button';button.onclick=function(){openCalendarMatch(next.id);};footer.appendChild(button);
  wdAppendLastMatch(container);
}

function wdUpcomingCalendarItems(allItems, today) {
  return (Array.isArray(allItems)?allItems:[]).filter(function(item){
    if(!item || !/^\d{4}-\d{2}-\d{2}$/.test(String(item.key||'')) || item.key<today)return false;
    if(item.kind==='match')return /^(UPCOMING|PENDING)$/i.test(String(item.result||'UPCOMING').trim());
    return !/^(CANCELLED|CANCELED|COMPLETED|POSTPONED)$/i.test(String(item.result||item.status||'').trim());
  }).slice().sort(function(a,b){return a.key.localeCompare(b.key)||(Number(a.time)||0)-(Number(b.time)||0)||String(a.title||'').localeCompare(String(b.title||''));});
}

function renderWDCalendarAgenda(allItems) {
  var list=document.getElementById('winter-agenda-list');if(!list)return;
  list.replaceChildren();
  var upcoming=wdUpcomingCalendarItems(allItems,calendarDateKey(new Date()));
  document.getElementById('winter-agenda-title').textContent='Upcoming events';
  if(!upcoming.length){var empty=document.createElement('p');empty.className='winter-empty';empty.textContent='No upcoming events scheduled.';list.appendChild(empty);}
  upcoming.slice(0,4).forEach(function(item){
    var button=document.createElement('button');button.type='button';button.className='winter-event';
    var date=document.createElement('time');date.dateTime=item.key;
    var parts=item.key.split('-').map(Number);date.textContent=new Date(parts[0],parts[1]-1,parts[2]).toLocaleDateString('en-US',{month:'short',day:'numeric'});
    var text=document.createElement('span'),title=document.createElement('strong'),category=document.createElement('small');
    title.textContent=item.title||'Event';category.textContent=calendarCategoryLabel(item);
    text.append(title,category);button.append(date,text);button.onclick=function(){selectClanCalendarDay(item.key);};list.appendChild(button);
  });
  if(upcoming.length>4){var more=document.createElement('p');more.className='winter-empty';more.textContent='+'+(upcoming.length-4)+' more upcoming · select dates in the calendar';list.appendChild(more);}
  winterRefreshNextMatch();
}

(function() {
  var notice = document.getElementById('webmaster-banner');
  var topbar = document.querySelector('.hero-banner');
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
