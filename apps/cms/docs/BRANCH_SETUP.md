# Branch Setup Guide

**Created:** December 22, 2025  
**Base Branch:** main  
**Base Commit:** 21c3b7955facbeb700e02e8309dfbf96043e4fac

## Branch Overview

This project uses 4 parallel development branches for AI agent collaboration:

| Branch | Codename | Agent Type | Purpose |
|--------|----------|------------|---------|
| callisto-cur-mb | Callisto | Cursor Multi-branch | Primary feature development |
| europa-ag-mb | Europa | Antigravity Multi-branch | Browser testing & UI/UX |
| titan-cur-mm | Titan | Cursor Multi-model | Backend & API development |
| enceladus-ag-mm | Enceladus | Antigravity Multi-model | Testing & QA |

## Branch Details

### Callisto (callisto-cur-mb)
**Agent:** Cursor with multi-branch capability  
**Focus Areas:**
- Feature development
- Component creation
- Frontend enhancements
- Collection modifications

**Typical Tasks:**
- Add new collections
- Create admin UI components
- Implement new features
- Refactor existing code

**Merge Strategy:** Feature branches → callisto → main

---

### Europa (europa-ag-mb)
**Agent:** Antigravity with browser capability  
**Focus Areas:**
- Browser testing
- UI/UX validation
- Visual regression testing
- Accessibility audits

**Typical Tasks:**
- Test admin panel in browser
- Validate frontend website
- Check responsive design
- Test user workflows

**Merge Strategy:** Test reports → europa → main (if fixes needed)

---

### Titan (titan-cur-mm)
**Agent:** Cursor with multi-model capability  
**Focus Areas:**
- Backend development
- API endpoints
- Database operations
- Server-side logic

**Typical Tasks:**
- Create custom endpoints
- Optimize database queries
- Implement hooks
- Fix backend issues

**Merge Strategy:** Feature branches → titan → main

---

### Enceladus (enceladus-ag-mm)
**Agent:** Antigravity with multi-model capability  
**Focus Areas:**
- Automated testing
- Quality assurance
- Performance testing
- Integration testing

**Typical Tasks:**
- Write new tests
- Fix failing tests
- Performance benchmarks
- Load testing

**Merge Strategy:** Test improvements → enceladus → main

## Branch Workflow

### For Agents Starting Work:

1. **Checkout your assigned branch:**
   ```bash
   git checkout [branch-name]
   ```

2. **Pull latest changes:**
   ```bash
   git pull origin [branch-name]
   ```

3. **Create feature branch (optional):**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Do your work, commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push to remote:**
   ```bash
   git push origin [branch-name]
   ```

### Merging Back to Main:

1. **Ensure all tests pass**
2. **Create pull request from your branch → main**
3. **Request review from architect**
4. **Merge after approval**

## Current State (as of Branch Creation)

**Base Commit:** 21c3b7955facbeb700e02e8309dfbf96043e4fac  
**Status:** Production-ready with caveats  
**Test Status:** 19/19 passing  
**Known Issues:**
- VAL-002: Production build blocked (TypeScript in scripts/)
- VAL-001: TypeScript errors in scripts/ directory
- VAL-003: 70 ESLint warnings
- VAL-004: 1 moderate security vulnerability (dev dependency)

**What Works:**
- ✅ Dev server
- ✅ Admin panel
- ✅ API endpoints
- ✅ Database connection
- ✅ All tests
- ✅ Security (no critical vulns)

**What's Blocked:**
- ❌ Production build (needs TypeScript fixes)

## Branch Protection (Recommended)

Consider enabling these protections on GitHub:

- **main branch:**
  - Require pull request reviews
  - Require status checks to pass
  - Require branches to be up to date
  - No force pushes

- **Development branches:**
  - Allow force pushes (for rebasing)
  - No required reviews (agents work independently)
  - Optional status checks

## Synchronization Strategy

### Keeping Branches in Sync:

**Option 1: Regular Merges from Main**
```bash
git checkout [your-branch]
git merge main
git push origin [your-branch]
```

**Option 2: Rebase on Main**
```bash
git checkout [your-branch]
git rebase main
git push --force-with-lease origin [your-branch]
```

**Recommendation:** Use Option 1 (merge) to preserve history

### Handling Conflicts:

1. Pull latest main: `git pull origin main`
2. Merge main into your branch: `git merge main`
3. Resolve conflicts manually
4. Test thoroughly
5. Commit and push

## Agent Assignments

| Agent ID | Branch | Primary Focus |
|----------|--------|---------------|
| Agent 1 | callisto-cur-mb | Feature development |
| Agent 2 | europa-ag-mb | Browser testing |
| Agent 3 | titan-cur-mm | Backend work |
| Agent 4 | enceladus-ag-mm | Testing & QA |

## Quick Reference

**Clone and setup:**
```bash
git clone https://github.com/linktrend/website-payload-cms.git
cd website-payload-cms
git checkout [your-branch]
pnpm install
cp .env.example .env  # Configure your environment
pnpm dev
```

**Common commands:**
```bash
# See all branches
git branch -a

# Switch branches
git checkout [branch-name]

# See current branch
git branch --show-current

# Push changes
git push origin [branch-name]

# Pull changes
git pull origin [branch-name]
```

## Notes

- All branches start from the same commit on main
- Each branch is independent and can diverge
- Agents should coordinate through pull requests
- Main branch is the source of truth
- Regular syncs with main are recommended
- Test before merging back to main

## Support

For questions about branch usage:
- Check `/docs/AGENT_BRIEFING.md` for project overview
- Check `/docs/KNOWN_ISSUES.md` for current blockers
- Check `/docs/ARCHITECTURE.md` for system details
