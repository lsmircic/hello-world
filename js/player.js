/* ============================================
   Football Tactics Board - Player Rendering
   ============================================ */

var PlayerRenderer = (function () {

  function getRadius(fieldW) {
    var r = PLAYER.radiusFraction * fieldW;
    return Math.max(PLAYER.minRadius, Math.min(PLAYER.maxRadius, r));
  }

  function getBallRadius(fieldW) {
    var r = BALL.radiusFraction * fieldW;
    return Math.max(BALL.minRadius, Math.min(BALL.maxRadius, r));
  }

  // Convert normalized coords to pixel coords within field rect
  function toPixel(nx, ny, fr) {
    return {
      px: fr.x + nx * fr.w,
      py: fr.y + ny * fr.h
    };
  }

  // Convert pixel coords to normalized coords
  function toNormalized(px, py, fr) {
    return {
      nx: (px - fr.x) / fr.w,
      ny: (py - fr.y) / fr.h
    };
  }

  // Draw a single player dot
  function drawPlayer(ctx, player, team, fr, isSelected, showNames) {
    var colors = COLORS[team];
    var r = getRadius(fr.w);
    var pos = toPixel(player.x, player.y, fr);
    var px = pos.px;
    var py = pos.py;

    // Selection highlight
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(px, py, r + PLAYER.highlightWidth + 2, 0, Math.PI * 2);
      ctx.fillStyle = PLAYER.highlightColor;
      ctx.fill();
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = player.isGoalkeeper ? colors.gkFill : colors.fill;
    ctx.fill();
    ctx.strokeStyle = player.isGoalkeeper ? colors.gkStroke : colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Number
    var fontSize = Math.round(r * PLAYER.fontSize);
    if (player.number >= 10) fontSize = Math.round(fontSize * 0.85);
    ctx.font = 'bold ' + fontSize + 'px sans-serif';
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.number, px, py + 1);

    // Name label
    if (showNames && player.name) {
      var labelSize = Math.round(r * PLAYER.labelFontSize);
      if (labelSize < 8) labelSize = 8;
      ctx.font = labelSize + 'px sans-serif';
      ctx.fillStyle = colors.label;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(player.name, px, py + r + 3);
    }
  }

  // Draw the ball
  function drawBall(ctx, ball, fr, isSelected) {
    var r = getBallRadius(fr.w);
    var pos = toPixel(ball.x, ball.y, fr);
    var px = pos.px;
    var py = pos.py;

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(px, py, r + 3, 0, Math.PI * 2);
      ctx.fillStyle = PLAYER.highlightColor;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.ball.fill;
    ctx.fill();
    ctx.strokeStyle = COLORS.ball.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Small pentagon pattern hint
    ctx.beginPath();
    ctx.arc(px, py, r * 0.4, 0, Math.PI * 2);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Hit test: returns distance from point to player center, or -1 if outside radius
  function hitTest(px, py, player, fr, isBall) {
    var r = isBall ? getBallRadius(fr.w) : getRadius(fr.w);
    // Enlarge hit area slightly for easier touch
    var hitR = r + 6;
    var pos = toPixel(player.x, player.y, fr);
    var dx = px - pos.px;
    var dy = py - pos.py;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= hitR ? dist : -1;
  }

  return {
    drawPlayer: drawPlayer,
    drawBall: drawBall,
    hitTest: hitTest,
    toPixel: toPixel,
    toNormalized: toNormalized,
    getRadius: getRadius,
    getBallRadius: getBallRadius
  };

})();
