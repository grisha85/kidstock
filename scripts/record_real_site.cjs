const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRAMES_DIR = path.join(ROOT_DIR, '.recording_frames');
const OUTPUT_VIDEO = path.join(ROOT_DIR, 'kidstock_real_recording.mp4');
const ARTIFACT_VIDEO = '/Users/gregoryfreilikhman/.gemini/antigravity/brain/9d89645b-3a5d-4408-82af-e2775bc84eaf/kidstock_real_recording.mp4';

// Clean frames directory
if (fs.existsSync(FRAMES_DIR)) {
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAMES_DIR, { recursive: true });

async function main() {
  console.log('🎬 [KidStock Recorder] Starting 3-step recording:');
  console.log('   1. Start on Parent Page -> Add assets ($50.00) to Kid');
  console.log('   2. Go to Child Page -> Show updated $70.00 cash balance');
  console.log('   3. Buy Stock (Roblox $20.00) -> Confetti & updated portfolio');

  let chromeProcess = null;
  let pageTarget = null;

  async function getTargets() {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
      if (res.ok) return await res.json();
    } catch {
      return null;
    }
  }

  let targets = await getTargets();
  if (!targets) {
    console.log('🚀 Launching Chrome browser with DevTools...');
    chromeProcess = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--remote-debugging-address=127.0.0.1',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--window-size=1440,900',
      '--user-data-dir=/tmp/kidstock_rec_profile'
    ]);

    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 400));
      targets = await getTargets();
      if (targets) break;
    }
  }

  if (targets) {
    pageTarget = targets.find(t => t.type === 'page');
  }

  if (!pageTarget) {
    throw new Error('Could not find active Chrome tab target.');
  }

  console.log('🔌 Connected to DevTools:', pageTarget.id);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 0;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = ++id;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise(resolve => ws.addEventListener('open', resolve));

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  const evaluate = async (expr) => {
    const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    return res && res.result ? res.result.value : undefined;
  };

  // Navigate to site & prepare clean state
  console.log('🌐 Navigating to http://localhost:5173 ...');
  await send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 1800));

  await evaluate(`
    (() => {
      localStorage.setItem('kidstock_auth_user', JSON.stringify({
        email: 'gregory@kidstock.com',
        name: 'Gregory',
        role: 'parent',
        signedInAt: new Date().toISOString()
      }));
      localStorage.setItem('kidstock_guest_mode', 'true');
      localStorage.setItem('kidstock_tutorial_clicked', 'true');
      localStorage.removeItem('kidstock_family_data_v1');
      location.reload();
    })()
  `);
  await new Promise(r => setTimeout(r, 2000));

  // Inject Cursor & React-compatible Interaction Helpers
  console.log('🖱️ Injecting cursor & React input helpers...');
  await evaluate(`
    (() => {
      const cur = document.createElement('div');
      cur.id = 'virtual-cursor';
      cur.style.position = 'fixed';
      cur.style.top = '0';
      cur.style.left = '0';
      cur.style.width = '28px';
      cur.style.height = '28px';
      cur.style.pointerEvents = 'none';
      cur.style.zIndex = '9999999';
      cur.style.transform = 'translate(720px, 320px)';

      cur.innerHTML = \`
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
          <path d="M4 2L20 10L12 12L10 20L4 2Z" fill="#0f172a" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      \`;
      document.body.appendChild(cur);

      window.__curPos = { x: 720, y: 320 };

      window.__moveCursor = function(toX, toY, durationMs = 600) {
        return new Promise((resolve) => {
          const startX = window.__curPos.x;
          const startY = window.__curPos.y;
          const startTime = performance.now();

          function ease(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          }

          function frame(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / durationMs);
            const eased = ease(progress);

            const curX = startX + (toX - startX) * eased;
            const curY = startY + (toY - startY) * eased;

            cur.style.transform = 'translate(' + curX + 'px, ' + curY + 'px)';
            window.__curPos = { x: curX, y: curY };

            if (progress < 1) {
              requestAnimationFrame(frame);
            } else {
              resolve();
            }
          }
          requestAnimationFrame(frame);
        });
      };

      window.__clickRipple = function(x, y) {
        const ring = document.createElement('div');
        ring.style.position = 'fixed';
        ring.style.left = (x - 22) + 'px';
        ring.style.top = (y - 22) + 'px';
        ring.style.width = '44px';
        ring.style.height = '44px';
        ring.style.borderRadius = '50%';
        ring.style.border = '3px solid #3b82f6';
        ring.style.background = 'rgba(59, 130, 246, 0.3)';
        ring.style.pointerEvents = 'none';
        ring.style.zIndex = '9999998';
        ring.style.transform = 'scale(0.3)';
        ring.style.opacity = '1';
        ring.style.transition = 'all 0.45s cubic-bezier(0, 0, 0.2, 1)';
        document.body.appendChild(ring);

        requestAnimationFrame(() => {
          ring.style.transform = 'scale(1.6)';
          ring.style.opacity = '0';
        });

        setTimeout(() => ring.remove(), 500);
      };

      window.__clickElement = async function(el, durationMs = 650) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;
        await window.__moveCursor(targetX, targetY, durationMs);
        window.__clickRipple(targetX, targetY);
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: targetX, clientY: targetY }));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: targetX, clientY: targetY }));
        el.click();
        return true;
      };

      window.__setReactInputValue = function(input, val) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };

      window.__smoothScroll = function(targetY, durationMs = 800) {
        return new Promise((resolve) => {
          const startY = window.scrollY;
          const startTime = performance.now();
          function frame(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / durationMs);
            const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            window.scrollTo(0, startY + (targetY - startY) * eased);
            if (progress < 1) requestAnimationFrame(frame);
            else resolve();
          }
          requestAnimationFrame(frame);
        });
      };

      window.__smoothScrollContainer = function(container, targetY, durationMs = 800) {
        return new Promise((resolve) => {
          if (!container) return resolve();
          const startY = container.scrollTop;
          const startTime = performance.now();
          function frame(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / durationMs);
            const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            container.scrollTop = startY + (targetY - startY) * eased;
            if (progress < 1) requestAnimationFrame(frame);
            else resolve();
          }
          requestAnimationFrame(frame);
        });
      };
    })()
  `);

  // Open Parent Broker BEFORE recording starts so Frame 1 begins directly on Parent Page!
  console.log('🔒 Opening Parent Broker Vault before starting recording...');
  await evaluate(`
    (async () => {
      // 1. Click Kid Profile Switcher pill in header
      const header = document.querySelector('header');
      const switcherBtn = header ? header.querySelector('button.group') : null;
      if (switcherBtn) switcherBtn.click();
      await new Promise(r => setTimeout(r, 250));
      // 2. Click Parent Broker option inside dropdown
      const btns = Array.from(document.querySelectorAll('button'));
      const parentBtn = btns.find(b => b.textContent.includes('Parent Broker') || b.textContent.includes('Broker'));
      if (parentBtn) parentBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // Start Real-Time 25 FPS Frame Sampler (guarantees true 1:1 wall-clock timing!)
  let isRecording = true;
  let latestFrameBuffer = null;
  let frameCount = 0;

  // Capture initial frame before starting interval
  const firstShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
  if (firstShot && firstShot.data) {
    latestFrameBuffer = Buffer.from(firstShot.data, 'base64');
  }

  // Continuous screenshot updater loop
  (async () => {
    while (isRecording) {
      try {
        const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
        if (shot && shot.data) {
          latestFrameBuffer = Buffer.from(shot.data, 'base64');
        }
      } catch {}
      await new Promise(r => setTimeout(r, 15));
    }
  })();

  // Exact 25 FPS (40ms) frame writer
  const frameInterval = setInterval(() => {
    if (!isRecording || !latestFrameBuffer) return;
    frameCount++;
    fs.writeFileSync(path.join(FRAMES_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`), latestFrameBuffer);
  }, 40);

  console.log('📹 Recording started at exact 25 FPS real-time!');

  // ====================================================
  // STEP 1: START ON PARENT PAGE — ADD ASSETS TO KID
  // ====================================================
  console.log('💰 [Step 1] On Parent Page: adding $50.00 cash to Leo...');
  await new Promise(r => setTimeout(r, 1200)); // Hold on Parent Page

  // Move cursor to Deposit Amount input & type 50.00 using React setter
  const depositBtnText = await evaluate(`
    (async () => {
      const forms = Array.from(document.querySelectorAll('form'));
      const depositForm = forms[0];
      const amountInput = depositForm ? depositForm.querySelector('input[type="number"]') : null;
      if (amountInput) {
        const rect = amountInput.getBoundingClientRect();
        await window.__moveCursor(rect.left + rect.width / 2, rect.top + rect.height / 2, 750);
        window.__clickRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
        amountInput.focus();
        await new Promise(r => setTimeout(r, 300));
        window.__setReactInputValue(amountInput, '50');
      }
      await new Promise(r => setTimeout(r, 200));
      const submitBtn = depositForm ? depositForm.querySelector('button[type="submit"]') : null;
      return submitBtn ? submitBtn.textContent : 'not found';
    })()
  `);
  console.log('   Deposit button updated to:', depositBtnText);
  await new Promise(r => setTimeout(r, 800));

  // Click "Deposit Cash into Account (+$50.00)"
  const afterDepositText = await evaluate(`
    (async () => {
      const forms = Array.from(document.querySelectorAll('form'));
      const depositForm = forms[0];
      const submitBtn = depositForm ? depositForm.querySelector('button[type="submit"]') : null;
      if (submitBtn) {
        await window.__clickElement(submitBtn, 650);
      }
      await new Promise(r => setTimeout(r, 200));
      const select = document.querySelector('select');
      return select && select.options[0] ? select.options[0].text : '';
    })()
  `);
  console.log('   Child vault balance updated to:', afterDepositText);
  await new Promise(r => setTimeout(r, 1800)); // Let viewer read green confirmation banner & $70.00 balance

  // ====================================================
  // STEP 2: GO TO CHILD PAGE
  // ====================================================
  console.log('🚀 [Step 2] Exiting Parent Mode -> Going to Child Page...');
  await evaluate(`
    (async () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exitBtn = btns.find(b =>
        b.textContent.includes('Exit to Kid Mode') ||
        b.textContent.includes('Exit Parent') ||
        b.textContent.includes('יציאה')
      );
      if (exitBtn) {
        await window.__clickElement(exitBtn, 700);
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // Highlight Piggy Bank Cash ($70.00) on Child Dashboard
  const piggyCashText = await evaluate(`
    (async () => {
      const piggy = document.querySelector('[data-tour="piggy-cash"]');
      if (piggy) {
        const rect = piggy.getBoundingClientRect();
        await window.__moveCursor(rect.left + rect.width / 2, rect.top + rect.height / 2, 700);
        window.__clickRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return piggy.textContent;
      }
      return '';
    })()
  `);
  console.log('   Child Dashboard Piggy Bank shows:', piggyCashText);
  await new Promise(r => setTimeout(r, 1200));

  // ====================================================
  // STEP 3: BUY STOCK ON CHILD PAGE
  // ====================================================
  console.log('🛒 [Step 3] Scrolling to Stock Market & buying Roblox...');
  await evaluate(`
    (async () => {
      const market = document.querySelector('[data-tour="stock-market"]');
      if (market) {
        const top = market.getBoundingClientRect().top + window.scrollY - 80;
        await window.__smoothScroll(top, 900);
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 900));

  // Click "+ Buy" button on the Roblox card inside Stock Market
  const openedStock = await evaluate(`
    (async () => {
      const market = document.querySelector('[data-tour="stock-market"]');
      if (!market) return 'no market';
      const cards = Array.from(market.querySelectorAll('.group'));
      const rblxCard = cards.find(c => c.textContent.includes('RBLX')) || cards[0];
      if (rblxCard) {
        const buyBtn = rblxCard.querySelector('button');
        await window.__clickElement(buyBtn || rblxCard, 750);
        return 'clicked Roblox Buy button';
      }
      return 'card not found';
    })()
  `);
  console.log('   Market action:', openedStock);
  await new Promise(r => setTimeout(r, 1400)); // Show Roblox modal top & chart

  // Scroll inside StockDetailModal to the "Trade this Stock" section
  await evaluate(`
    (async () => {
      const modalBody = document.querySelector('.custom-scrollbar');
      if (modalBody) {
        await window.__smoothScrollContainer(modalBody, modalBody.scrollHeight, 900);
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // Click "$20" quick amount button
  const confirmBtnLabel = await evaluate(`
    (async () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const twentyBtn = btns.find(b => b.textContent.trim() === '$20');
      if (twentyBtn) {
        await window.__clickElement(twentyBtn, 600);
      }
      await new Promise(r => setTimeout(r, 200));
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Confirm Buy') || b.textContent.includes('אישור קנייה')
      );
      return confirmBtn ? confirmBtn.textContent : 'not found';
    })()
  `);
  console.log('   Selected $20 preset -> Button label:', confirmBtnLabel);
  await new Promise(r => setTimeout(r, 800));

  // Click "Confirm Buy ($20.00)"
  const celebrationTitle = await evaluate(`
    (async () => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Confirm Buy') || b.textContent.includes('אישור קנייה')
      );
      if (confirmBtn) {
        await window.__clickElement(confirmBtn, 650);
      }
      await new Promise(r => setTimeout(r, 300));
      const headings = Array.from(document.querySelectorAll('h3'));
      const boughtHeading = headings.find(h => h.textContent.includes('Bought') || h.textContent.includes('קנית'));
      return boughtHeading ? boughtHeading.textContent : 'not found';
    })()
  `);
  console.log('   Celebration modal opened:', celebrationTitle);
  await new Promise(r => setTimeout(r, 2200)); // Enjoy confetti & Order Executed modal

  // Click "Got it, let's continue!" on Celebration modal
  await evaluate(`
    (async () => {
      const gotItBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Got it') || b.textContent.includes('הבנתי')
      );
      if (gotItBtn) {
        await window.__clickElement(gotItBtn, 600);
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // Scroll back up to show updated Portfolio & Holdings
  await evaluate(`
    (async () => {
      await window.__smoothScroll(0, 900);
    })()
  `);
  await new Promise(r => setTimeout(r, 2000)); // Final hold on updated Child Dashboard

  // Stop recording
  isRecording = false;
  clearInterval(frameInterval);
  await new Promise(r => setTimeout(r, 100));

  console.log(`⏹️ Recording complete! Total frames captured: ${frameCount} (${(frameCount / 25).toFixed(1)}s at 25 FPS)`);
  ws.close();
  if (chromeProcess) chromeProcess.kill();

  // ----------------------------------------------------
  // ENCODE TO MP4 WITH FFMPEG
  // ----------------------------------------------------
  console.log('🎞️ Encoding frames to MP4 with ffmpeg...');
  const ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -framerate 25 -i "${FRAMES_DIR}/frame_%05d.jpg" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 "${OUTPUT_VIDEO}"`;
  execSync(ffmpegCmd);

  // Copy to artifacts
  fs.copyFileSync(OUTPUT_VIDEO, ARTIFACT_VIDEO);

  // Clean temporary frames
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });

  console.log(`🎉 Success! Video saved to: ${OUTPUT_VIDEO}`);
  console.log(`📁 Artifact copy saved to: ${ARTIFACT_VIDEO}`);
}

main().catch(err => {
  console.error('❌ Recording error:', err);
  process.exit(1);
});
