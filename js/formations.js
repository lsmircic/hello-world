/* ============================================
   Football Tactics Board - Formation Generator
   ============================================ */

var Formations = (function () {

  // Generate normalized positions from a formation line array
  // Returns array of {x, y} with index 0 = GK
  // For the home team (left side): GK at left, attack toward right
  function generatePositions(lines) {
    var positions = [];

    // GK position
    positions.push({ x: 0.04, y: 0.50 });

    var numLines = lines.length;
    var xStart = 0.13;
    var xEnd = 0.46;
    var yStart = 0.12;
    var yEnd = 0.88;

    for (var li = 0; li < numLines; li++) {
      var count = lines[li];
      var x = numLines === 1
        ? (xStart + xEnd) / 2
        : xStart + (xEnd - xStart) * (li / (numLines - 1));

      for (var pi = 0; pi < count; pi++) {
        var y = count === 1
          ? 0.50
          : yStart + (yEnd - yStart) * (pi / (count - 1));
        positions.push({ x: x, y: y });
      }
    }

    return positions;
  }

  // Mirror positions for away team (right side)
  function mirrorPositions(positions) {
    return positions.map(function (p) {
      return { x: 1 - p.x, y: p.y };
    });
  }

  // Get available formations for a given outfield count
  function getFormationsForCount(count) {
    return FORMATION_DEFS[count] || [];
  }

  // Get the first formation for a count (default)
  function getDefaultFormation(count) {
    var formations = getFormationsForCount(count);
    return formations.length > 0 ? formations[0] : null;
  }

  // Generate player array for a team
  function createTeamPlayers(outfieldCount, formationName, team) {
    var formations = getFormationsForCount(outfieldCount);
    var formation = formations.find(function (f) { return f.name === formationName; });
    if (!formation) formation = formations[0];
    if (!formation) return [];

    var positions = generatePositions(formation.lines);

    // Mirror for away team
    if (team === 'away') {
      positions = mirrorPositions(positions);
    }

    var players = [];
    for (var i = 0; i < positions.length; i++) {
      players.push({
        x: positions[i].x,
        y: positions[i].y,
        number: i + 1,
        isGoalkeeper: i === 0,
        name: ''
      });
    }

    return players;
  }

  // Reposition existing players to formation (preserving names)
  function applyFormation(players, outfieldCount, formationName, team) {
    var formations = getFormationsForCount(outfieldCount);
    var formation = formations.find(function (f) { return f.name === formationName; });
    if (!formation) formation = formations[0];
    if (!formation) return players;

    var positions = generatePositions(formation.lines);
    if (team === 'away') {
      positions = mirrorPositions(positions);
    }

    var totalNeeded = outfieldCount + 1; // +1 for GK

    // Resize player array if needed
    while (players.length < totalNeeded) {
      players.push({
        x: 0.5,
        y: 0.5,
        number: players.length + 1,
        isGoalkeeper: false,
        name: ''
      });
    }
    while (players.length > totalNeeded) {
      players.pop();
    }

    // Update positions and numbers
    for (var i = 0; i < players.length; i++) {
      players[i].x = positions[i].x;
      players[i].y = positions[i].y;
      players[i].number = i + 1;
      players[i].isGoalkeeper = i === 0;
    }

    return players;
  }

  return {
    generatePositions: generatePositions,
    mirrorPositions: mirrorPositions,
    getFormationsForCount: getFormationsForCount,
    getDefaultFormation: getDefaultFormation,
    createTeamPlayers: createTeamPlayers,
    applyFormation: applyFormation
  };

})();
