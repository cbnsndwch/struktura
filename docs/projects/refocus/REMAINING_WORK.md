# Remaining Work - Prioritized

**Date**: December 15, 2025

---

## Priority Tiers

### Tier 1: MVP Critical (Complete These First)

These are blocking features needed for a usable product.

| Issue | Title | Epic | Effort Est. | Status |
|-------|-------|------|-------------|--------|
| #19 | Grid View for Data Management | Epic 3 | Large | Not Started |
| #20 | Record Detail Forms | Epic 3 | Medium | Not Started |
| #67 | User Profile & Settings Integration | Epic 3 | Small | Partial |

**Total for MVP Tier 1**: ~3-4 weeks of focused development

---

### Tier 2: Enhanced UX (Nice for MVP)

These improve the user experience but aren't strictly required for launch.

| Issue | Title | Epic | Effort Est. | Status |
|-------|-------|------|-------------|--------|
| #21 | Calendar View | Epic 4 | Medium | Not Started |
| #22 | Kanban Board View | Epic 4 | Medium | Not Started |

**Total for Tier 2**: ~2-3 weeks

---

### Tier 3: Platform Expansion (Post-MVP)

These are features for scaling and external integration.

| Issue | Title | Epic | Effort Est. | Status |
|-------|-------|------|-------------|--------|
| #25 | REST API & GraphQL Endpoints | Epic 6 | Medium | Partial |
| #26 | Third-Party Integrations | Epic 6 | Large | Not Started |
| #23 | Live Editing & Synchronization | Epic 5 | X-Large | Not Started |
| #24 | Comments & Discussions | Epic 5 | Medium | Not Started |

**Total for Tier 3**: ~6-8 weeks

---

### Tier 4: Enterprise Features (Future)

These are for enterprise customers and can wait.

| Issue | Title | Epic | Effort Est. | Status |
|-------|-------|------|-------------|--------|
| #27 | Advanced Authentication & SSO | Epic 7 | Large | Not Started |
| #28 | Advanced Permissions & Governance | Epic 7 | Large | Not Started |
| #29 | Performance & Scalability | Epic 7 | X-Large | Not Started |

**Total for Tier 4**: ~8-10 weeks

---

## Detailed Breakdown

### Issue #19 - Grid View for Data Management

**Why First?**  
This is the core interaction model for the entire application. Users need to view and edit data in a spreadsheet-like interface - this is the "Airtable experience" the product promises.

**Technical Approach:**
1. Use TanStack Table (react-table) or AG Grid for the grid component
2. Connect to collection service for data loading
3. Implement inline editing with field type validation
4. Add virtual scrolling for performance with large datasets

**Acceptance Criteria:**
- [ ] Spreadsheet-like grid interface
- [ ] Inline editing with type validation
- [ ] Column sorting and filtering
- [ ] Row selection and bulk operations
- [ ] Keyboard navigation (arrow keys, tab)
- [ ] Column resizing and reordering
- [ ] Frozen columns for large datasets

**Dependencies:**
- ✅ Collection entities exist
- ✅ Workspace navigation complete
- ✅ Design system ready

---

### Issue #20 - Record Detail Forms

**Why Second?**  
After viewing data in a grid, users need a way to view/edit complex records in a form layout. This is especially important for records with many fields or nested data.

**Technical Approach:**
1. Generate forms dynamically from collection schema
2. Use shadcn/ui form components already in the design system
3. Support all field types defined in FieldType enum
4. Handle nested objects and arrays

**Acceptance Criteria:**
- [ ] Auto-generated forms from schema
- [ ] Nested object/array editing
- [ ] File upload with preview
- [ ] Relationship field selectors
- [ ] Form validation with error messages
- [ ] Conditional field display
- [ ] Form templates and customization

---

### Issue #67 - User Profile & Settings Integration

**Why Third?**  
Users need to manage their account settings. Basic profile works, but full settings page is needed.

**What's Already Done:**
- ✅ User profile dropdown in header
- ✅ Theme preferences (light/dark/system)
- ✅ User preferences stored in database

**What's Remaining:**
- [ ] Full settings page with sections
- [ ] Notification preferences
- [ ] Account security settings (password change, 2FA)
- [ ] Settings search functionality

---

## Epics Status Summary

| Epic | Status | % Complete | Priority |
|------|--------|------------|----------|
| Epic 1: Foundation | ✅ COMPLETE | 100% | - |
| Epic 2: Schema Management | ✅ COMPLETE | 100% | - |
| Epic 3: Data Management Interface | 🔄 IN PROGRESS | ~80% | **HIGH** |
| Epic 4: Multiple Views | ⏳ NOT STARTED | 0% | Medium |
| Epic 5: Real-Time Collaboration | ⏳ NOT STARTED | 0% | Low |
| Epic 6: Integration & API | ⏳ NOT STARTED | ~10% | Low |
| Epic 7: Enterprise Features | ⏳ NOT STARTED | 0% | Future |

---

## Recommended Sprint Plan

### Sprint 1 (Weeks 1-2): Grid View Foundation
- [ ] Set up grid component with TanStack Table or similar
- [ ] Connect to collection service
- [ ] Basic display of collection data
- [ ] Column definitions from schema

### Sprint 2 (Weeks 3-4): Grid View Interactions
- [ ] Inline editing
- [ ] Sorting and filtering
- [ ] Keyboard navigation
- [ ] Row selection

### Sprint 3 (Weeks 5-6): Record Forms
- [ ] Dynamic form generation
- [ ] Field type components
- [ ] Validation integration
- [ ] Modal/drawer for record editing

### Sprint 4 (Week 7): Polish & Settings
- [ ] User settings page
- [ ] Grid performance optimization
- [ ] Bug fixes and refinements
- [ ] Documentation updates

---

## Technical Debt to Address

While building these features, also address:

1. **Schema Domain Implementation**  
   Currently just a placeholder re-exporting contracts. Need real domain services.

2. **Test Coverage**  
   Add integration tests for new grid/form components.

3. **API Documentation**  
   Document GraphQL schema for external consumption.

4. **Error Handling**  
   Improve error states and user feedback throughout the app.
