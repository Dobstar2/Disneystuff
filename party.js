(function(){
  const PARTY_KEY = 'currentParty';
  function getCurrentPartyId() {
    const params = new URLSearchParams(location.search);
    const id = params.get('party');
    if (id) localStorage.setItem(PARTY_KEY, id);
    return id || localStorage.getItem(PARTY_KEY);
  }
  function updateUI() {
    const id = getCurrentPartyId();
    const leaveBtn = document.getElementById('leave-party-btn');
    if (leaveBtn) leaveBtn.style.display = id ? 'inline-block' : 'none';
    if (id) {
      const url = location.origin + location.pathname + '?party=' + id;
      const ta = document.getElementById('party-code');
      if (ta) ta.value = url;
      const qr = document.getElementById('qr-code');
      if (qr && window.QRCode) {
        qr.innerHTML = '';
        new QRCode(qr, {text: url, width:128, height:128});
      }
    }
  }
  function createParty() {
    const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    localStorage.setItem(PARTY_KEY, id);
    saveParty();
    updateUI();
  }
  function joinPartyManual() {
    const val = document.getElementById('party-code').value.trim();
    const idx = val.indexOf('?party=');
    const id = idx>=0 ? val.substring(idx+7) : val;
    if (!id) return alert('Invalid party link');
    localStorage.setItem(PARTY_KEY, id);
    loadParty();
    updateUI();
  }
  function leaveParty() {
    localStorage.removeItem(PARTY_KEY);
    updateUI();
  }
  function saveParty() {
    const id = getCurrentPartyId();
    if (!id) return;
    const data = {
      rides: JSON.parse(localStorage.getItem('hiddenParkFullScreenCharlieRides') || '{}'),
      foodDone: JSON.parse(localStorage.getItem('hiddenParkFoodStatus') || '{}'),
      foodFav: JSON.parse(localStorage.getItem('hiddenParkFoodFav') || '{}'),
      achievements: JSON.parse(localStorage.getItem('parkAchievements') || '{}'),
      hunts: JSON.parse(localStorage.getItem('photoHunts') || '{}'),
      dayPlan: JSON.parse(localStorage.getItem('dayPlan') || '[]'),
      notes: JSON.parse(localStorage.getItem('otherNotes') || '[]')
    };
    localStorage.setItem('party-' + id, JSON.stringify(data));
  }
  function loadParty() {
    const id = getCurrentPartyId();
    if (!id) return;
    const str = localStorage.getItem('party-' + id);
    if (!str) return;
    try {
      const data = JSON.parse(str);
      if (data.rides) localStorage.setItem('hiddenParkFullScreenCharlieRides', JSON.stringify(data.rides));
      if (data.foodDone) localStorage.setItem('hiddenParkFoodStatus', JSON.stringify(data.foodDone));
      if (data.foodFav) localStorage.setItem('hiddenParkFoodFav', JSON.stringify(data.foodFav));
      if (data.achievements) localStorage.setItem('parkAchievements', JSON.stringify(data.achievements));
      if (data.hunts) localStorage.setItem('photoHunts', JSON.stringify(data.hunts));
      if (data.dayPlan) localStorage.setItem('dayPlan', JSON.stringify(data.dayPlan));
      if (data.notes) localStorage.setItem('otherNotes', JSON.stringify(data.notes));
    } catch(e){ console.error('Party load failed', e); }
  }
  window.partyModule = {createParty, joinPartyManual, leaveParty, saveParty, loadParty, getCurrentPartyId, updateUI};
  document.addEventListener('DOMContentLoaded', () => {
    if (getCurrentPartyId()) {
      loadParty();
      updateUI();
    }
    window.addEventListener('beforeunload', saveParty);
  });
})();
