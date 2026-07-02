# Contributing to NoDistraction

First off, thank you for taking the time to contribute! Contributions from the community help make NoDistraction a better tool for everyone.

---

## How Can I Contribute?

### 1. Reporting Bugs
* Check the existing issues log to make sure the bug hasn't already been reported.
* If it is new, open a new Issue using the **Bug Report** template.
* Include clear steps to reproduce, what you expected to happen, and screenshots/logs if applicable.

### 2. Suggesting Enhancements
* Open an issue using the **Feature Request** template.
* Explain the problem the enhancement solves and why it would benefit all users.

### 3. Submitting Code Changes
To propose changes:
1. **Fork the Repository**: Clone your fork locally.
2. **Create a Branch**: Create a feature branch off the `main` branch:
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
3. **Make Your Changes**: Keep changes focused and clean.
4. **Run Locally**: Verify your changes run without errors:
   ```bash
   npm run dev
   ```
5. **Format & Commit**: Write clear, descriptive commit messages matching standard conventions (e.g. `feat: add ...` or `fix: fix ...`).
6. **Push and PR**: Push your branch to your fork and submit a Pull Request to our `main` branch.

---

## Code Style & Conventions
* Use Vanilla CSS and keep components focused and modular inside the `src/components/` folder.
* Keep state management organized within React hooks and clean storage interfaces.
* Ensure all files use safe Electron preload APIs instead of direct Node bindings in renderer processes.
* Do not check compiled files (like the `dist/` or `release/` folders) into version control.

Thank you for contributing!
