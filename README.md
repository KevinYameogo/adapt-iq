# Architecture - Adapt

AdaptIQ is an AI-powered PowerPoint add-in that helps presenters adapt their slides in real time based on audience engagement and presenter cues. During a presentation, AdaptIQ monitors live signals—such as pauses, questions, and speech patterns—to infer whether the audience is engaged, confused, or losing focus. It then provides clear, actionable suggestions directly inside PowerPoint, like adding an example slide, simplifying content, or skipping ahead, and allows presenters to apply these changes instantly with one click. The goal is to make presentations more responsive, clear, and effective without disrupting the presenter’s flow.

Powerpoint Add-In(nextjs)

Audio signals

Real-Time siggustions

One-click slide Action

Whole Tech:
-Next.js
-Office.js
-webaudio API
-OpenAI

Flow: (Speech-to-text)

1. web audio Api -> audio.ts

2. audio chunk sent to backend

3. Whisper(open AI) -> transcript (inside analyze/route.s)

4. Transcript + slidetext -> gpt

5. gpt returns engagement + suggestion

lib/ai.ts -> prompt logic

SideBar : start listening

AdaptIq is a Powerpoint Add-in. users install it once and then it appears inside powerpoint as a sidebar they can open during any presentation

TTS: Read suggesstion out loud

```bash
npm run dev:https
```

**If you see "localhost didn't send any data" or the page won't load:**

1. **Start the server** from the **project root** (the folder that has `package.json`):
   ```bash
   cd C:\St.-John-s-Hacks-2026\adapt-iq
   npm run dev
   ```
   (Use `npm run dev:https` if you need HTTPS for the add-in.)

2. **Leave that terminal open.** Don’t close it while you’re testing.

3. **Check that the server is running:**  
   In your browser open **http://localhost:3000/api/ping**  
   (Use **https://localhost:3000/api/ping** if you started with `dev:https`.)  
   You should see `{"ok":true}`. If that doesn’t load, the server isn’t running or something else is wrong (wrong folder, port in use, etc.).

4. **Use the same scheme and port in the add-in:**  
   If you use `npm run dev`, open **http://localhost:3000** in the browser.  
   If you use `npm run dev:https`, open **https://localhost:3000** and accept the certificate.  
   The add-in manifest must use the same base URL (see README tunnel option if you use a tunnel).

use Powerpoint online

2. Sideload in PowerPoint (Web)
   The easiest way to test is using PowerPoint on the web.

Go to PowerPoint Online and create a blank presentation.
Go to the Insert tab > Add-ins.
Click Upload My Add-in.
Select the `manifest.xml` file from your project root (`…/adapt-iq/manifest.xml`).
Accept any prompts. The **AdaptIQ** task pane button should appear on the Home tab ribbon.

**Summary & QR:** Use the "SUMMARY & QR" tab to create a shareable page (slides + AI summaries) and a QR code. For the QR link to work for your audience, deploy the app and set `NEXT_PUBLIC_APP_URL` (e.g. `https://your-app.vercel.app`).

**If the pane opens as a small bubble then disappears:** The add-in is failing to load. (1) Use `npm run dev:https` (not `npm run dev`) so the manifest URL matches. (2) In your browser, open https://localhost:3000 once and accept the certificate. (3) On Windows desktop PowerPoint, run in an elevated prompt: `CheckNetIsolation LoopbackExempt -a -n="microsoft.win32webviewhost_cw5n1h2txyewy"` so the host can reach localhost.

---

### Why only `npm run dev` gives an add-in error

Office **requires HTTPS** for add-ins. Your `manifest.xml` points to **https://localhost:3000**. So:

- **`npm run dev`** → server runs on **http** → PowerPoint tries to load **https** → mismatch → add-in error.
- **`npm run dev:https`** → server runs on **https** → matches manifest → add-in can load.

If **`npm run dev:https`** has stopped working (cert errors, port issues, etc.), use the **tunnel option** below so you can keep using **`npm run dev`** and still get HTTPS for the add-in.

### Option A: Get `dev:https` working again

1. From project root: `npm run dev:https`
2. If it starts, open **https://localhost:3000** in your browser and accept the self-signed certificate.
3. Then open PowerPoint and load the add-in.

If it fails with a cert or port error, try Option B.

### Option B: Use a tunnel (works with `npm run dev` only)

You run the app on **HTTP** and expose it via a public **HTTPS** URL. The manifest then points to that HTTPS URL, so Office is happy.

1. **Terminal 1:** Start the app (HTTP is fine):
   ```bash
   npm run dev
   ```
2. **Terminal 2:** Expose port 3000 with a tunnel (pick one):
   - **ngrok:** `npx ngrok http 3000`
   - **Cloudflare:** `npx cloudflared tunnel --url http://localhost:3000`
3. Copy the **HTTPS** URL (e.g. `https://abc123.ngrok-free.app`).
4. In **manifest.xml**, replace every `https://localhost:3000` with that URL (e.g. `https://abc123.ngrok-free.app`). Save.
5. In PowerPoint: **Insert → Add-ins → Upload My Add-in** and select the updated **manifest.xml** (or re-upload if already added).
6. Open the add-in. It will load over HTTPS from the tunnel; the tunnel forwards to your local `npm run dev`.

**Note:** Each time you restart ngrok/cloudflared you get a new URL, so you must update the manifest and re-upload it. For a stable URL, use a free ngrok account and a reserved domain.
