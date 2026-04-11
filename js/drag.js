/* ============================================
   Football Tactics Board - Drag & Drop Engine
   ============================================ */

var DragEngine = (function () {

  var dragState = null;  // { type: 'player'|'ball', team: string, index: number }
  var canvas = null;
  var onDragMove = null;
  var onDragEnd = null;
  var animFrameId = null;

  function init(canvasEl, callbacks) {
    canvas = canvasEl;
    onDragMove = callbacks.onMove;
    onDragEnd = callbacks.onEnd;

    // Mouse events
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);
  }

  function getCanvasCoords(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    // Use logical dimensions (pre-DPR) to match rendering coordinates
    var logW = canvas._logicalWidth || rect.width;
    var logH = canvas._logicalHeight || rect.height;
    return {
      x: (clientX - rect.left) * (logW / rect.width),
      y: (clientY - rect.top) * (logH / rect.height)
    };
  }

  // Find what was clicked: returns { type, team, index } or null
  function findTarget(px, py, state, fr) {
    var bestDist = Infinity;
    var best = null;

    // Check ball first
    if (state.ball) {
      var d = PlayerRenderer.hitTest(px, py, state.ball, fr, true);
      if (d >= 0 && d < bestDist) {
        bestDist = d;
        best = { type: 'ball', team: null, index: -1 };
      }
    }

    // Check all players (iterate in reverse so top-rendered = first picked)
    var teams = ['away', 'home'];
    for (var t = 0; t < teams.length; t++) {
      var team = teams[t];
      var players = state[team].players;
      for (var i = players.length - 1; i >= 0; i--) {
        var d = PlayerRenderer.hitTest(px, py, players[i], fr, false);
        if (d >= 0 && d < bestDist) {
          bestDist = d;
          best = { type: 'player', team: team, index: i };
        }
      }
    }

    return best;
  }

  function handleStart(e) {
    var coords = getCanvasCoords(e.clientX, e.clientY);
    startDrag(coords.x, coords.y);
  }

  function handleMove(e) {
    if (!dragState) {
      // Update cursor
      var coords = getCanvasCoords(e.clientX, e.clientY);
      updateCursor(coords.x, coords.y);
      return;
    }
    var coords = getCanvasCoords(e.clientX, e.clientY);
    moveDrag(coords.x, coords.y);
  }

  function handleEnd() {
    endDrag();
  }

  function handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    var touch = e.touches[0];
    var coords = getCanvasCoords(touch.clientX, touch.clientY);
    startDrag(coords.x, coords.y);
  }

  function handleTouchMove(e) {
    if (!dragState) return;
    e.preventDefault();
    var touch = e.touches[0];
    var coords = getCanvasCoords(touch.clientX, touch.clientY);
    moveDrag(coords.x, coords.y);
  }

  function handleTouchEnd() {
    endDrag();
  }

  function startDrag(px, py) {
    // Get current state and field rect from the app
    var state = App.getState();
    var fr = Field.getFieldRect(canvas._logicalWidth || canvas.width, canvas._logicalHeight || canvas.height);
    var target = findTarget(px, py, state, fr);
    if (target) {
      dragState = target;
      canvas.style.cursor = 'grabbing';
    }
  }

  function moveDrag(px, py) {
    if (!dragState) return;

    var fr = Field.getFieldRect(canvas._logicalWidth || canvas.width, canvas._logicalHeight || canvas.height);
    var norm = PlayerRenderer.toNormalized(px, py, fr);

    // Clamp to field bounds
    norm.nx = Math.max(0, Math.min(1, norm.nx));
    norm.ny = Math.max(0, Math.min(1, norm.ny));

    if (onDragMove) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(function () {
        onDragMove(dragState, norm.nx, norm.ny);
        animFrameId = null;
      });
    }
  }

  function endDrag() {
    if (dragState && onDragEnd) {
      onDragEnd(dragState);
    }
    dragState = null;
    canvas.style.cursor = 'default';
  }

  function updateCursor(px, py) {
    var state = App.getState();
    var fr = Field.getFieldRect(canvas._logicalWidth || canvas.width, canvas._logicalHeight || canvas.height);
    var target = findTarget(px, py, state, fr);
    canvas.style.cursor = target ? 'grab' : 'default';
  }

  function getDragState() {
    return dragState;
  }

  return {
    init: init,
    getDragState: getDragState
  };

})();
