function winterRefreshNextMatch() {
  var container = document.getElementById('winter-next-content');
  if (!container) return;
  container.replaceChildren();
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var next = firestoreMatches.filter(function(match) {
    var date = parseClanDate(match.week);
    return String(match.resultType || '').trim().toUpperCase() === 'UPCOMING' && (!date || date >= today);
  }).sort(function(a, b) {
    var left = parseClanDate(a.week), right = parseClanDate(b.week);
    return (left ? left.getTime() : Infinity) - (right ? right.getTime() : Infinity);
  })[0];
  var crest = document.createElement('img');
  crest.src = 'christmas-logo.jpg';
  crest.alt = 'White Dragon';
  container.appendChild(crest);
  var name = document.createElement('strong');
  name.textContent = next ? next.title || 'Upcoming match' : 'No upcoming match scheduled';
  container.appendChild(name);
  var date = document.createElement('p');
  date.textContent = next ? next.week || 'Date TBD' : 'Check the clan calendar for events.';
  container.appendChild(date);
  if (next) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'winter-primary';
    button.textContent = 'View match →';
    button.onclick = function() { openCalendarMatch(next.id); };
    container.appendChild(button);
  }
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
