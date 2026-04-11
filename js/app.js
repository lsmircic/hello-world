/* ============================================
   Football Tactics Board - Main App Controller
   ============================================ */

var App = (function () {

  // === State ===
  var state = {
    home: {
      outfieldCount: 10,
      formation: '4-4-2',
      players: []
    },
    away: {
      outfieldCount: 10,
      formation: '4-4-2',
      players: []
    },
    ball: { x: 0.5, y: 0.5 },
    showNames: false
  };

  // === DOM references ===
  var canvas, ctx;
  var homeSlider, awaySlider, homeSliderVal, awaySliderVal;
  var homeFormSelect, awayFormSelect;
  var matchFormat;
  var btnReset, btnSwap, btnNamesToggle, btnRoster;
  var btnSave, btnExport, btnShare, btnDeleteSave;
  var saveNameInput, loadSelect;
  var rosterModal, homeRosterList, awayRosterList;

  // === Init ===
  function init() {
    // Canvas
    canvas = document.getElementById('pitch');
    ctx = canvas.getContext('2d');

    // Controls
    homeSlider = document.getElementById('home-players');
    awaySlider = document.getElementById('away-players');
    homeSliderVal = document.getElementById('home-players-val');
    awaySliderVal = document.getElementById('away-players-val');
    homeFormSelect = document.getElementById('home-formation');
    awayFormSelect = document.getElementById('away-formation');
    matchFormat = document.getElementById('match-format');

    // Buttons
    btnReset = document.getElementById('btn-reset');
    btnSwap = document.getElementById('btn-swap');
    btnNamesToggle = document.getElementById('btn-names-toggle');
    btnRoster = document.getElementById('btn-roster');
    btnSave = document.getElementById('btn-save');
    btnExport = document.getElementById('btn-export');
    btnShare = document.getElementById('btn-share');
    btnDeleteSave = document.getElementById('btn-delete-save');
    saveNameInput = document.getElementById('save-name');
    loadSelect = document.getElementById('load-select');

    // Modal
    rosterModal = document.getElementById('roster-modal');
    homeRosterList = document.getElementById('home-roster-list');
    awayRosterList = document.getElementById('away-roster-list');

    // Size canvas
    sizeCanvas();
    window.addEventListener('resize', function () {
      sizeCanvas();
      render();
    });

    // Initialize teams
    populateFormationDropdown('home');
    populateFormationDropdown('away');
    resetTeam('home');
    resetTeam('away');

    // Wire events
    homeSlider.addEventListener('input', function () {
      state.home.outfieldCount = parseInt(this.value);
      homeSliderVal.textContent = this.value;
      populateFormationDropdown('home');
      state.home.formation = homeFormSelect.value;
      resetTeam('home');
      updateMatchFormat();
      render();
    });

    awaySlider.addEventListener('input', function () {
      state.away.outfieldCount = parseInt(this.value);
      awaySliderVal.textContent = this.value;
      populateFormationDropdown('away');
      state.away.formation = awayFormSelect.value;
      resetTeam('away');
      updateMatchFormat();
      render();
    });

    homeFormSelect.addEventListener('change', function () {
      state.home.formation = this.value;
      Formations.applyFormation(state.home.players, state.home.outfieldCount, state.home.formation, 'home');
      render();
    });

    awayFormSelect.addEventListener('change', function () {
      state.away.formation = this.value;
      Formations.applyFormation(state.away.players, state.away.outfieldCount, state.away.formation, 'away');
      render();
    });

    btnReset.addEventListener('click', function () {
      resetTeam('home');
      resetTeam('away');
      state.ball = { x: 0.5, y: 0.5 };
      render();
    });

    btnSwap.addEventListener('click', swapSides);
    btnNamesToggle.addEventListener('click', toggleNames);
    btnRoster.addEventListener('click', openRoster);
    document.getElementById('btn-close-roster').addEventListener('click', closeRoster);
    document.getElementById('btn-save-roster').addEventListener('click', saveRoster);

    btnSave.addEventListener('click', saveSetup);
    btnExport.addEventListener('click', exportPNG);
    btnShare.addEventListener('click', shareImage);
    btnDeleteSave.addEventListener('click', deleteSetup);
    loadSelect.addEventListener('change', loadSetup);

    // Close modal on backdrop click
    rosterModal.addEventListener('click', function (e) {
      if (e.target === rosterModal) closeRoster();
    });

    // Check Web Share API support
    if (!navigator.share) {
      btnShare.style.display = 'none';
    }

    // Init drag
    DragEngine.init(canvas, {
      onMove: onDragMove,
      onEnd: onDragEnd
    });

    // Load saved setups list
    refreshSavesList();

    // Update display
    updateMatchFormat();
    render();
  }

  // === Canvas sizing ===
  function sizeCanvas() {
    var container = document.getElementById('canvas-container');
    var w = container.clientWidth;
    var h = Math.round(w / FIELD.aspectRatio);
    // Use device pixel ratio for sharp rendering
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Store logical dimensions for field rect calculation
    canvas._logicalWidth = w;
    canvas._logicalHeight = h;
  }

  // === Render ===
  function render() {
    var w = canvas._logicalWidth || canvas.width;
    var h = canvas._logicalHeight || canvas.height;

    ctx.clearRect(0, 0, w, h);
    var fr = Field.draw(ctx, w, h);
    var ds = DragEngine.getDragState();

    // Draw away team
    for (var i = 0; i < state.away.players.length; i++) {
      var sel = ds && ds.type === 'player' && ds.team === 'away' && ds.index === i;
      PlayerRenderer.drawPlayer(ctx, state.away.players[i], 'away', fr, sel, state.showNames);
    }

    // Draw home team
    for (var i = 0; i < state.home.players.length; i++) {
      var sel = ds && ds.type === 'player' && ds.team === 'home' && ds.index === i;
      PlayerRenderer.drawPlayer(ctx, state.home.players[i], 'home', fr, sel, state.showNames);
    }

    // Draw ball
    var ballSel = ds && ds.type === 'ball';
    PlayerRenderer.drawBall(ctx, state.ball, fr, ballSel);
  }

  // === Drag callbacks ===
  function onDragMove(target, nx, ny) {
    if (target.type === 'ball') {
      state.ball.x = nx;
      state.ball.y = ny;
    } else if (target.type === 'player') {
      state[target.team].players[target.index].x = nx;
      state[target.team].players[target.index].y = ny;
    }
    render();
  }

  function onDragEnd(target) {
    if (target.type === 'player') {
      // Mark as custom formation
      var select = target.team === 'home' ? homeFormSelect : awayFormSelect;
      if (select.value !== 'Custom') {
        // Add custom option if not present
        var hasCustom = false;
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].value === 'Custom') { hasCustom = true; break; }
        }
        if (!hasCustom) {
          var opt = document.createElement('option');
          opt.value = 'Custom';
          opt.textContent = 'Custom';
          select.appendChild(opt);
        }
        select.value = 'Custom';
        state[target.team].formation = 'Custom';
      }
    }
  }

  // === Team management ===
  function resetTeam(team) {
    var count = state[team].outfieldCount;
    var formation = state[team].formation;

    if (formation === 'Custom') {
      // Reset to first available formation
      var first = Formations.getDefaultFormation(count);
      formation = first ? first.name : '4-4-2';
      state[team].formation = formation;
      var select = team === 'home' ? homeFormSelect : awayFormSelect;
      select.value = formation;
    }

    // Preserve names
    var oldNames = {};
    if (state[team].players) {
      state[team].players.forEach(function (p) {
        oldNames[p.number] = p.name || '';
      });
    }

    state[team].players = Formations.createTeamPlayers(count, formation, team);

    // Restore names
    state[team].players.forEach(function (p) {
      if (oldNames[p.number]) {
        p.name = oldNames[p.number];
      }
    });
  }

  function populateFormationDropdown(team) {
    var select = team === 'home' ? homeFormSelect : awayFormSelect;
    var count = state[team].outfieldCount;
    var formations = Formations.getFormationsForCount(count);
    var currentVal = select.value;

    select.innerHTML = '';
    formations.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.name;
      opt.textContent = f.name;
      select.appendChild(opt);
    });

    // Try to keep current selection
    var found = formations.some(function (f) { return f.name === currentVal; });
    if (found) {
      select.value = currentVal;
    } else if (formations.length > 0) {
      select.value = formations[0].name;
    }
    state[team].formation = select.value;
  }

  function updateMatchFormat() {
    var homeTotal = state.home.outfieldCount + 1;
    var awayTotal = state.away.outfieldCount + 1;
    matchFormat.textContent = homeTotal + ' vs ' + awayTotal;
  }

  // === Swap sides ===
  function swapSides() {
    // Mirror all player positions
    state.home.players.forEach(function (p) { p.x = 1 - p.x; });
    state.away.players.forEach(function (p) { p.x = 1 - p.x; });
    state.ball.x = 1 - state.ball.x;

    // Swap team data
    var tmp = state.home;
    state.home = state.away;
    state.away = tmp;

    // Update UI
    homeSlider.value = state.home.outfieldCount;
    awaySlider.value = state.away.outfieldCount;
    homeSliderVal.textContent = state.home.outfieldCount;
    awaySliderVal.textContent = state.away.outfieldCount;
    populateFormationDropdown('home');
    populateFormationDropdown('away');
    homeFormSelect.value = state.home.formation;
    awayFormSelect.value = state.away.formation;
    updateMatchFormat();
    render();
  }

  // === Names toggle ===
  function toggleNames() {
    state.showNames = !state.showNames;
    btnNamesToggle.textContent = 'Names: ' + (state.showNames ? 'On' : 'Off');
    render();
  }

  // === Roster editing ===
  function openRoster() {
    rosterModal.classList.remove('hidden');
    buildRosterUI('home', homeRosterList);
    buildRosterUI('away', awayRosterList);
  }

  function closeRoster() {
    rosterModal.classList.add('hidden');
  }

  function buildRosterUI(team, container) {
    container.innerHTML = '';
    state[team].players.forEach(function (p, i) {
      var entry = document.createElement('div');
      entry.className = 'roster-entry';

      var num = document.createElement('span');
      num.className = 'player-num';
      num.textContent = '#' + p.number;

      var input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Player name...';
      input.value = p.name || '';
      input.maxLength = 15;
      input.dataset.team = team;
      input.dataset.index = i;

      entry.appendChild(num);
      entry.appendChild(input);
      container.appendChild(entry);
    });
  }

  function saveRoster() {
    // Read all inputs and update state
    var inputs = rosterModal.querySelectorAll('.roster-entry input');
    inputs.forEach(function (input) {
      var team = input.dataset.team;
      var index = parseInt(input.dataset.index);
      state[team].players[index].name = input.value.trim();
    });
    closeRoster();
    render();
  }

  // === Save / Load ===
  function getSaves() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function putSaves(saves) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  }

  function saveSetup() {
    var name = saveNameInput.value.trim();
    if (!name) {
      saveNameInput.focus();
      saveNameInput.style.borderColor = '#f87171';
      setTimeout(function () { saveNameInput.style.borderColor = ''; }, 1500);
      return;
    }

    var saves = getSaves();
    saves[name] = {
      home: {
        outfieldCount: state.home.outfieldCount,
        formation: state.home.formation,
        players: state.home.players.map(function (p) {
          return { x: p.x, y: p.y, number: p.number, isGoalkeeper: p.isGoalkeeper, name: p.name || '' };
        })
      },
      away: {
        outfieldCount: state.away.outfieldCount,
        formation: state.away.formation,
        players: state.away.players.map(function (p) {
          return { x: p.x, y: p.y, number: p.number, isGoalkeeper: p.isGoalkeeper, name: p.name || '' };
        })
      },
      ball: { x: state.ball.x, y: state.ball.y },
      showNames: state.showNames,
      timestamp: Date.now()
    };

    putSaves(saves);
    saveNameInput.value = '';
    refreshSavesList();
  }

  function loadSetup() {
    var name = loadSelect.value;
    if (!name) return;

    var saves = getSaves();
    var setup = saves[name];
    if (!setup) return;

    // Restore state
    state.home.outfieldCount = setup.home.outfieldCount;
    state.home.formation = setup.home.formation;
    state.home.players = setup.home.players;
    state.away.outfieldCount = setup.away.outfieldCount;
    state.away.formation = setup.away.formation;
    state.away.players = setup.away.players;
    state.ball = setup.ball || { x: 0.5, y: 0.5 };
    state.showNames = setup.showNames || false;

    // Update UI
    homeSlider.value = state.home.outfieldCount;
    awaySlider.value = state.away.outfieldCount;
    homeSliderVal.textContent = state.home.outfieldCount;
    awaySliderVal.textContent = state.away.outfieldCount;
    populateFormationDropdown('home');
    populateFormationDropdown('away');

    // Set formation select values
    if (state.home.formation === 'Custom') {
      addCustomOption(homeFormSelect);
    }
    homeFormSelect.value = state.home.formation;

    if (state.away.formation === 'Custom') {
      addCustomOption(awayFormSelect);
    }
    awayFormSelect.value = state.away.formation;

    btnNamesToggle.textContent = 'Names: ' + (state.showNames ? 'On' : 'Off');
    updateMatchFormat();
    render();

    // Reset dropdown
    loadSelect.value = '';
  }

  function deleteSetup() {
    var name = loadSelect.value;
    if (!name) return;

    var saves = getSaves();
    delete saves[name];
    putSaves(saves);
    refreshSavesList();
  }

  function refreshSavesList() {
    var saves = getSaves();
    var names = Object.keys(saves).sort(function (a, b) {
      return (saves[b].timestamp || 0) - (saves[a].timestamp || 0);
    });

    loadSelect.innerHTML = '<option value="">Load setup...</option>';
    names.forEach(function (name) {
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      loadSelect.appendChild(opt);
    });
  }

  function addCustomOption(select) {
    var hasCustom = false;
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === 'Custom') { hasCustom = true; break; }
    }
    if (!hasCustom) {
      var opt = document.createElement('option');
      opt.value = 'Custom';
      opt.textContent = 'Custom';
      select.appendChild(opt);
    }
  }

  // === Export PNG ===
  function exportPNG() {
    // Create a clean render for export (without highlight)
    render();

    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'tactics-board.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  // === Share (Web Share API) ===
  function shareImage() {
    render();

    canvas.toBlob(function (blob) {
      var file = new File([blob], 'tactics-board.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          title: 'Football Tactics Board',
          text: 'Check out this formation!',
          files: [file]
        }).catch(function () {
          // User cancelled or error - fall back to download
          exportPNG();
        });
      } else {
        // Fallback: direct download
        exportPNG();
      }
    }, 'image/png');
  }

  // === Public API ===
  function getState() {
    return state;
  }

  // Boot
  document.addEventListener('DOMContentLoaded', init);

  return {
    getState: getState
  };

})();
