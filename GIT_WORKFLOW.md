# Git Workflow Guide for Impactey

## 🌟 Branching Strategy

### Branch Structure
```
main (production) ← Vercel auto-deploys from here
 ↑
dev (development) ← All new features developed here
 ↑
feature/* (optional) ← Large features can have their own branches
```

### Branch Purposes
- **`main`**: Production-ready code, always stable, Vercel deploys from here
- **`dev`**: Development and testing, all new features start here
- **`feature/*`**: Optional branches for complex features

---

## 🚀 Daily Development Workflow

### 1. Starting New Work
```bash
# Always start from the latest dev branch
git checkout dev
git pull origin dev

# For small features, work directly in dev
# For large features, create a feature branch
git checkout -b feature/new-feature-name
```

### 2. Making Changes
```bash
# Make your changes, then stage and commit
git add .
git commit -m "feat: description of your changes"

# Push to dev (or feature branch)
git push origin dev
```

### 3. Testing Phase
```bash
# Run local tests
npm run dev
# Test all functionality in browser
# Check console for errors
# Verify mobile responsiveness
```

---

## 📋 Pre-Production Checklist

Before merging `dev` → `main`, ensure:

### ✅ Functionality Tests
- [ ] All new features working correctly
- [ ] Search functionality responsive (try AAPL, TSLA, SPY)
- [ ] Instrument detail pages loading properly
- [ ] ESG data displaying with correct source badges
- [ ] Error handling working (try invalid tickers)
- [ ] Back navigation functioning

### ✅ Technical Tests
- [ ] No console errors in browser dev tools
- [ ] No TypeScript compilation errors
- [ ] App loads within 5 seconds
- [ ] Search responds within 300ms
- [ ] Mobile layout working properly

### ✅ Data Integrity
- [ ] Live ticker data loading (98K+ instruments)
- [ ] ESG scores showing with proper source labels
- [ ] Demo data clearly marked as "Demo Score"
- [ ] Error states showing friendly messages

---

## 🔄 Safe Merging Process

### Step 1: Prepare for Merge
```bash
# Ensure you're on dev with latest changes
git checkout dev
git pull origin dev

# Check git log to see what's changed
git log --oneline -10
```

### Step 2: Switch to Main and Update
```bash
# Switch to main and get latest
git checkout main
git pull origin main
```

### Step 3: Merge Dev into Main
```bash
# Merge dev into main (creates merge commit)
git merge dev

# Alternative: Rebase for cleaner history (advanced)
# git rebase dev
```

### Step 4: Handle Conflicts (if any)
```bash
# If conflicts occur, git will show them
git status

# Edit conflicted files (look for <<<<<<< markers)
# After resolving conflicts:
git add .
git commit -m "resolve: merge conflicts between dev and main"
```

### Step 5: Push to Production
```bash
# Push to main (triggers Vercel deployment)
git push origin main

# Also push dev to keep it synced
git checkout dev
git push origin dev
```

---

## 🛠️ Common Git Commands

### Branch Operations
```bash
# List all branches
git branch -a

# Create new branch
git checkout -b branch-name

# Switch branches
git checkout branch-name

# Delete branch (local)
git branch -d branch-name

# Delete branch (remote)
git push origin --delete branch-name
```

### Viewing Changes
```bash
# See current status
git status

# See changes since last commit
git diff

# See commit history
git log --oneline -10

# See changes in specific commit
git show commit-hash
```

### Undoing Changes
```bash
# Undo unstaged changes
git restore filename
git restore .  # all files

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - DANGEROUS!
git reset --hard HEAD~1

# Undo specific file from last commit
git restore --staged filename
```

---

## 🚨 Emergency Procedures

### Broken Main Branch
```bash
# If main is broken, quickly revert
git checkout main
git revert HEAD  # Creates new commit that undoes last change

# Or reset to previous good commit (DANGEROUS - rewrites history)
git reset --hard previous-good-commit-hash
git push --force origin main  # Only if absolutely necessary
```

### Lost Work Recovery
```bash
# Find lost commits
git reflog

# Recover lost commit
git checkout lost-commit-hash
git checkout -b recovery-branch
```

### Sync Issues
```bash
# If branches are out of sync
git checkout dev
git fetch origin
git reset --hard origin/dev  # Makes local dev identical to remote

# Same for main
git checkout main
git reset --hard origin/main
```

---

## 🔧 Vercel Configuration

### Deployment Settings
To ensure Vercel only deploys from `main`:

1. **Vercel Dashboard** → Your Project → Settings → Git
2. **Production Branch**: `main`
3. **Deploy Hooks**: Disabled for `dev`
4. **Automatic Deployments**: Only from `main`

### Environment Variables
Set in Vercel Dashboard:
- `VITE_FMP_API_KEY` (if needed for production)
- Any other environment variables

---

## 📝 Commit Message Guidelines

### Format
```
type: brief description

Longer explanation if needed
- List of changes
- Important notes
```

### Types
- `feat:` New features
- `fix:` Bug fixes
- `refactor:` Code restructuring
- `style:` UI/CSS changes
- `docs:` Documentation
- `test:` Testing changes
- `chore:` Maintenance

### Examples
```bash
git commit -m "feat: add instrument detail pages with ESG analysis"
git commit -m "fix: resolve search autocomplete timing issue"
git commit -m "refactor: improve error handling in ticker service"
git commit -m "style: enhance mobile responsiveness for search UI"
```

---

## 🔍 Conflict Resolution

### Understanding Conflicts
```
<<<<<<< HEAD (your current branch)
Your changes
=======
Incoming changes from other branch
>>>>>>> branch-name
```

### Resolution Steps
1. **Identify conflicts**: `git status`
2. **Edit files**: Remove markers, keep desired code
3. **Test changes**: Ensure app still works
4. **Stage resolution**: `git add conflicted-file`
5. **Complete merge**: `git commit`

### Prevention
- Pull latest changes before starting work
- Communicate with team about major changes
- Merge frequently to avoid large conflicts

---

## 📊 Monitoring & Maintenance

### Weekly Tasks
- Review commit history: `git log --oneline -20`
- Check branch status: `git branch -a`
- Clean up old branches: `git branch -d old-branch`
- Update CHANGELOG.md with new features

### Health Checks
```bash
# Check repo size
du -sh .git/

# Verify remote URLs
git remote -v

# Check for uncommitted changes
git status

# Verify tracking branches
git branch -vv
```

---

## 🎯 Best Practices

### Do's ✅
- Always work in `dev` branch for new features
- Test thoroughly before merging to `main`
- Write descriptive commit messages
- Pull latest changes before starting work
- Keep commits focused and atomic
- Update CHANGELOG.md for significant changes

### Don'ts ❌
- Never push directly to `main` without testing
- Don't force push to shared branches
- Avoid large commits with multiple unrelated changes
- Don't commit sensitive data (API keys, passwords)
- Don't work directly on `main` branch
- Don't merge without testing

---

## 📞 Quick Reference

### Current Status
```bash
git status                 # What's changed?
git branch                # Which branch am I on?
git log --oneline -5      # Recent commits
```

### Switch to Dev (Most Common)
```bash
git checkout dev
git pull origin dev
```

### Ready for Production
```bash
git checkout main
git merge dev
git push origin main
```

### Emergency Rollback
```bash
git checkout main
git revert HEAD
git push origin main
```

---

This workflow ensures your live site remains stable while allowing safe development and testing of new features! 🚀 