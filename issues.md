# Issues / Tomorrow Handoff

## 1. Start Focus Session click appears to do nothing

Observed by user after the latest UI/window-width changes.

Current evidence:
- `npm run build` passes.
- `SetupForm` submits through `onSubmit(formData)`.
- `App` should switch to `ACTIVE` in `handleStartSession`.
- Browser automation could not complete in this environment:
  - bundled Playwright Chromium is missing;
  - system Chrome launches then exits under Playwright;
  - Playwright Electron launch also failed.

Likely next checks:
- Run `npm run dev` locally and open DevTools console.
- Click `Start Focus Session` and inspect renderer errors.
- Add a temporary `console.log` or breakpoint in `SetupForm.handleSubmit` and `App.handleStartSession`.
- Verify the installed app was rebuilt after the latest source changes.

## 2. Native window width mismatch was fixed in source

User screenshot showed the X button clipped because CSS width was updated to `432px`, but Electron `BrowserWindow` still used `360px`.

Current source fix:
- `src/App.css`: `--width-panel: 432px`
- `main.js`: `BrowserWindow` width is now `432`

Needs final verification after packaging/installing again.

## 3. Visual polish still needs a real rendered pass

Build passes, but the UI changes were not fully browser-verified because browser automation was unavailable.

Screens to check:
- setup screen at 432px width;
- optional setup expanded;
- active timer screen;
- break screen;
- settings panel;
- daily review panel;
- history panel.

## 4. Packaging note

After source changes, run:

```bash
npm run package
cp -R release/mac-arm64/NoDistraction.app /Applications/NoDistraction.app
xattr -cr /Applications/NoDistraction.app
```

The app is unsigned, so macOS may still require right-click > Open on first launch.
