<script setup lang="ts">
/**
 * Ported from the old game.html. Fixes carried over from that version:
 *  - `dt` was an implicit global, read in detectCollision() before being
 *    assigned in draw(). That only worked in sloppy mode; in a module it throws.
 *    It is now a parameter.
 *  - game over called document.location.reload(), which would tear down the
 *    whole SPA. It now resets game state in place.
 *  - the speed/multiplier intervals were never cleared, and resize was bound
 *    twice. Both are cleaned up on unmount.
 */

// --- tunables -------------------------------------------------------------
// Note: speed compounds every SPEED_EVERY_MS and the multiplier climbs every
// MULT_EVERY_MS, so runs get unwinnable fast and scores explode. Kept as the
// original played; adjust here rather than hunting through the loop.
const BASE_SPEED = 180        // px per second
const SPEED_STEP = 1.1        // multiplied every interval
const SPEED_EVERY_MS = 5000
const MULT_EVERY_MS = 10000
const MAX_BOUNCE = Math.PI / 3
const ASPECT = 480 / 320
const MAX_WIDTH = 480
// --------------------------------------------------------------------------

const canvasRef = ref<HTMLCanvasElement | null>(null)
const score = ref(0)
const highScore = ref(0)
const multiplier = ref(1)

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let speedTimer: ReturnType<typeof setInterval> | undefined
let multTimer: ReturnType<typeof setInterval> | undefined
let lastTime: number | null = null

const g = {
  x: 0, y: 0, dx: BASE_SPEED, dy: -BASE_SPEED,
  r: 10, paddleX: 0, paddleW: 75, paddleH: 10
}
let leftPressed = false
let rightPressed = false

function sizeCanvas() {
  const c = canvasRef.value
  if (!c) return
  let width = Math.min(window.innerWidth * 0.98, MAX_WIDTH)
  let height = width / ASPECT
  if (height > window.innerHeight * 0.7) {
    height = window.innerHeight * 0.7
    width = height * ASPECT
  }
  c.width = width
  c.height = height
  g.paddleW = c.width * 0.18
  g.paddleH = c.height * 0.03
  g.r = Math.max(8, c.width * 0.02)
  g.paddleX = Math.min(g.paddleX, c.width - g.paddleW)
  resetBall()
}

function resetBall() {
  const c = canvasRef.value
  if (!c) return
  g.x = c.width / 2
  g.y = c.height - 30
  g.paddleX = (c.width - g.paddleW) / 2
}

function resetGame() {
  if (score.value > highScore.value) {
    highScore.value = score.value
    try { localStorage.setItem('solfest.highScore', String(highScore.value)) } catch { /* private mode */ }
  }
  score.value = 0
  multiplier.value = 1
  g.dx = BASE_SPEED
  g.dy = -BASE_SPEED
  resetBall()
  startTimers()
}

function startTimers() {
  stopTimers()
  speedTimer = setInterval(() => { g.dx *= SPEED_STEP; g.dy *= SPEED_STEP }, SPEED_EVERY_MS)
  multTimer = setInterval(() => { multiplier.value += 1 }, MULT_EVERY_MS)
}
function stopTimers() {
  if (speedTimer) { clearInterval(speedTimer); speedTimer = undefined }
  if (multTimer) { clearInterval(multTimer); multTimer = undefined }
}

function step(dt: number) {
  const c = canvasRef.value
  if (!c) return

  // Walls
  if (g.x + g.dx * dt < g.r) { g.x = g.r; g.dx = -g.dx }
  else if (g.x + g.dx * dt > c.width - g.r) { g.x = c.width - g.r; g.dx = -g.dx }
  if (g.y + g.dy * dt < g.r) { g.y = g.r; g.dy = -g.dy }

  // Paddle
  const nextY = g.y + g.dy * dt
  const paddleY = c.height - g.r
  if (g.y <= paddleY && nextY >= paddleY && g.x > g.paddleX && g.x < g.paddleX + g.paddleW) {
    const hit = ((g.x - g.paddleX) - g.paddleW / 2) / (g.paddleW / 2)
    let angle = hit * MAX_BOUNCE
    if (Math.abs(angle) < 0.05) angle += (Math.random() - 0.5) * 0.2
    const speed = Math.hypot(g.dx, g.dy)
    g.dx = speed * Math.sin(angle)
    g.dy = -Math.abs(speed * Math.cos(angle))
    score.value += multiplier.value
  } else if (nextY > c.height - g.r) {
    resetGame()
    return
  }

  // Paddle movement
  const paddleSpeed = c.width * 1.2
  if (rightPressed) g.paddleX = Math.min(g.paddleX + paddleSpeed * dt, c.width - g.paddleW)
  else if (leftPressed) g.paddleX = Math.max(g.paddleX - paddleSpeed * dt, 0)

  g.x += g.dx * dt
  g.y += g.dy * dt
}

function render() {
  const c = canvasRef.value
  if (!c || !ctx) return
  ctx.clearRect(0, 0, c.width, c.height)

  ctx.fillStyle = '#0095DD'
  ctx.beginPath()
  ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2)
  ctx.fill()
  ctx.closePath()

  ctx.beginPath()
  ctx.rect(g.paddleX, c.height - g.paddleH, g.paddleW, g.paddleH)
  ctx.fill()
  ctx.closePath()

  ctx.font = `${Math.floor(c.height / 16)}px Arial`
  ctx.fillText(`Score: ${score.value}`, 8, 20)

  const hs = `High Score: ${highScore.value}`
  ctx.fillText(hs, c.width - ctx.measureText(hs).width - 12, 20)

  ctx.font = `${Math.floor(c.height / 18)}px Arial`
  const mult = `x${multiplier.value}`
  ctx.fillText(mult, (c.width - ctx.measureText(mult).width) / 2, 20)
}

function loop(timestamp: number) {
  if (lastTime === null) lastTime = timestamp
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05) // clamp after a tab switch
  lastTime = timestamp
  step(dt)
  render()
  raf = requestAnimationFrame(loop)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') rightPressed = true
  else if (e.key === 'ArrowLeft') leftPressed = true
}
function onKeyUp(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') rightPressed = false
  else if (e.key === 'ArrowLeft') leftPressed = false
}
function onTouch(e: TouchEvent) {
  const c = canvasRef.value
  if (!c || !e.touches[0]) return
  e.preventDefault()
  const rect = c.getBoundingClientRect()
  const touchX = (e.touches[0].clientX - rect.left) * (c.width / rect.width)
  g.paddleX = Math.max(0, Math.min(touchX - g.paddleW / 2, c.width - g.paddleW))
}

onMounted(() => {
  const c = canvasRef.value
  if (!c) return
  ctx = c.getContext('2d')

  try {
    highScore.value = Number(localStorage.getItem('solfest.highScore') ?? 0) || 0
  } catch { /* private mode */ }

  sizeCanvas()
  window.addEventListener('resize', sizeCanvas)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
  c.addEventListener('touchstart', onTouch, { passive: false })
  c.addEventListener('touchmove', onTouch, { passive: false })

  startTimers()
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  stopTimers()
  window.removeEventListener('resize', sizeCanvas)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
  const c = canvasRef.value
  if (c) {
    c.removeEventListener('touchstart', onTouch)
    c.removeEventListener('touchmove', onTouch)
  }
})
</script>

<template>
  <canvas ref="canvasRef" width="480" height="320" />
</template>
