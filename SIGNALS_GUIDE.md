# Signals in the Expense Tracker App

This document explains how Angular **Signals** are used across the project, why they replaced the old `BehaviorSubject` + `Observable` approach, and what each signal-powered piece of code actually does.

---

## Table of Contents

1. [What is a Signal? (Plain English)](#1-what-is-a-signal-plain-english)
2. [Why Signals are Better than BehaviorSubject](#2-why-signals-are-better-than-behaviorsubject)
3. [The Signal Toolkit We Use](#3-the-signal-toolkit-we-use)
4. [Where Signals Are Used — File by File](#4-where-signals-are-used--file-by-file)
   - [4.1 AuthService](#41-authservice-coreservicesauthservicets)
   - [4.2 LoadingService](#42-loadingservice-coreservicesloadingservicets)
   - [4.3 MainLayoutComponent](#43-mainlayoutcomponent-layoutmain-layout)
   - [4.4 DashboardHomeComponent](#44-dashboardhomecomponent-featuresdashboard)
   - [4.5 TransactionListComponent](#45-transactionlistcomponent-featurestransactions)
   - [4.6 AnalyticsHomeComponent](#46-analyticshomecomponent-featuresanalytics)
5. [Before vs After: Side-by-Side](#5-before-vs-after-side-by-side)

---

## 1. What is a Signal? (Plain English)

A **signal** is a special variable that holds a value AND tells Angular "I changed" whenever you update it. Anywhere that reads it (template, computed value, or effect) automatically refreshes.

Think of it like a smart cell in a spreadsheet:
- You write a number in cell A1 → all formulas using A1 recalculate.
- You write a value into a signal → all templates/computed values using it refresh.

```ts
const count = signal(0);    // create
count();                    // read — returns 0 (call it like a function)
count.set(5);               // write — set to a new value
count.update(n => n + 1);   // write — update based on current
```

---

## 2. Why Signals are Better than BehaviorSubject

The old code used `BehaviorSubject` (RxJS) to hold state. Both work, but signals are cleaner for UI state.

| Concern | BehaviorSubject (Old) | Signal (New) |
|---|---|---|
| **Syntax to read** | `userSubject.value` or subscribe | `user()` — just call it |
| **In template** | `user$ \| async` | `user()` directly |
| **Memory leaks** | Need to `unsubscribe()` or use `takeUntilDestroyed` | No subscriptions — nothing to leak |
| **Derived values** | Combine observables with `combineLatest`, `map`, etc. | `computed(() => a() + b())` — done |
| **Change detection** | Triggers whole-component re-render | Only updates the spots that depend on it (fine-grained) |
| **Boilerplate** | Private subject + public observable pair | One line: `signal(...)` |
| **Debugging** | Have to subscribe to log a value | Just call `mySignal()` anywhere |

**The bottom line:** signals are designed for synchronous UI state. Observables are still right for async event streams (HTTP, router events, user input streams). The project uses **both** — signals for state, observables for HTTP/router — and bridges between them with `rxResource` and `toSignal`.

---

## 3. The Signal Toolkit We Use

| API | Purpose | Example in our code |
|---|---|---|
| `signal(value)` | Writable signal holding a value | `refreshTick = signal(0)` |
| `computed(() => ...)` | Read-only signal derived from other signals | `loading = computed(() => resource.isLoading())` |
| `linkedSignal(() => ...)` | Writable signal that auto-resets when its source changes | `page = linkedSignal(() => pageResource.value())` |
| `.asReadonly()` | Expose a signal as read-only (consumers can read but not write) | `categories = categoriesState.asReadonly()` |
| `rxResource({ params, stream })` | Bridge: turns an HTTP Observable into a signal-driven resource with `value()`, `isLoading()`, `error()` | All data-loading components |
| `toSignal(observable$)` | Bridge: convert any Observable into a signal | `breadcrumbItems = toSignal(router.events.pipe(...))` |

---

## 4. Where Signals Are Used — File by File

### 4.1 AuthService (`core/services/auth.service.ts`)

**Purpose:** Holds the currently logged-in user. Components read this to display name/email and decide what to show.

**Flow:**
1. On app start, the service reads the saved user from localStorage and puts it in a signal.
2. When the user logs in, `handleAuthSuccess()` calls `currentUserState.set(user)` — every component watching this signal instantly sees the new user.
3. When the user logs out, `currentUserState.set(null)` — all UI showing the user info clears.

**Code:**
```ts
private currentUserState = signal<CurrentUser | null>(this.tokenService.getUser());
currentUser = this.currentUserState.asReadonly();   // public read-only handle
```

**Why `.asReadonly()`?** So components cannot accidentally call `authService.currentUser.set(...)` and corrupt auth state. Only `AuthService` itself can write.

**Before (BehaviorSubject):** Needed a private `currentUserSubject` AND a public `currentUser$` observable, plus components had to use `async` pipe or subscribe manually. **Now:** one signal, called as `currentUser()` in any template.

---

### 4.2 LoadingService (`core/services/loading.service.ts`)

**Purpose:** Drives the top progress bar that appears whenever any HTTP request is in-flight.

**Flow:**
1. HTTP interceptor calls `show()` before each request and `hide()` when done.
2. A counter (`pending`) tracks how many requests are running.
3. When the counter goes from 0 → 1, the signal flips to `true` (bar appears).
4. When it drops back to 0, the signal flips to `false` (bar disappears).

**Code:**
```ts
private loadingState = signal<boolean>(false);
loading = this.loadingState.asReadonly();
```

The `MainLayoutComponent` template binds `[hidden]="!loading()"` on the progress bar — that's it.

---

### 4.3 MainLayoutComponent (`layout/main-layout/`)

**Purpose:** The shell around every authenticated page — sidebar, top bar, breadcrumbs.

**Signals used:**

```ts
currentUser = this.authService.currentUser;     // signal from AuthService
loading = this.loadingService.loading;          // signal from LoadingService

breadcrumbItems = toSignal(
  this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => this.computeBreadcrumb(this.router.url))
  ),
  { initialValue: [] as MenuItem[] }
);
```

**Flow:**
- `currentUser` and `loading` are simply re-exposed from the services — no extra wiring.
- `breadcrumbItems` is the interesting one: the router emits `NavigationEnd` events as an **Observable**. `toSignal()` converts that stream into a signal so the template can read `breadcrumbItems()` instead of using `breadcrumbItems$ | async`.
- `initialValue: []` is required because signals must have a value at the moment they're created — observables may emit later.

**Why this is better:** the old code had `breadcrumbItems$: Observable<MenuItem[]>` and the template used the `async` pipe. The new code just reads `breadcrumbItems()` — no pipe, no subscription, no chance of forgetting to unsubscribe.

---

### 4.4 DashboardHomeComponent (`features/dashboard/`)

**Purpose:** Shows summary cards (income/expense/savings) and budget utilization. Refreshes when the user clicks Refresh.

**The key idea — `rxResource`:** An Angular helper that turns an HTTP call into a self-managed signal package with `.value()`, `.isLoading()`, `.error()`.

**Code:**
```ts
private refreshTick = signal(0);

summaryResource = rxResource({
  params: () => this.refreshTick(),                       // re-run when this changes
  stream: () => this.dashboardService.getSummary(),       // the HTTP call
});

summary = computed<DashboardSummary | null>(() => this.summaryResource.value() ?? null);
loading = computed(() => this.summaryResource.isLoading());

loadSummary(): void {
  this.refreshTick.update((n) => n + 1);   // bump to refetch
}
```

**Flow:**
1. Component loads → `refreshTick` is `0` → `rxResource` runs the HTTP call → `summary()` gets the data, `loading()` flips false.
2. User clicks Refresh → `refreshTick` becomes `1` → `rxResource` notices the param changed → refetches → template updates.
3. Template uses `summary()?.totalIncome`, `loading()`, etc. — no pipes, no subscriptions.

**Why "tick"?** We don't actually care about the value of `refreshTick` — we only need *something* to change so the resource refetches. Incrementing a number is the easiest trigger.

**Before:** A `BehaviorSubject<void>` called `refresh$`, piped through `switchMap` to the HTTP call, manually toggling a `loading = true/false` boolean. **Now:** one signal + one `rxResource` block.

---

### 4.5 TransactionListComponent (`features/transactions/`)

**Purpose:** The transactions table with server-side pagination, filtering, and optimistic delete. The most complex use of signals in the app.

**Signals used:**

```ts
// Category list for filter dropdown
private categoriesState = signal<Category[]>([]);
categories = this.categoriesState.asReadonly();

// What triggers a refetch — pagination event + manual tick
private lazyLoadEvent = signal<TableLazyLoadEvent | undefined>(undefined);
private refreshTick = signal(0);

// HTTP-driven resource — refetches when either source signal changes
private pageResource = rxResource({
  params: () => {
    const event = this.lazyLoadEvent();
    if (event === undefined) return undefined;          // skip first render
    return { event, tick: this.refreshTick() };
  },
  stream: ({ params }) =>
    this.transactionService.getAll(this.buildFilters(params.event)),
});

// linkedSignal — writable, but auto-resets when pageResource refetches
page = linkedSignal<PageResponse<Transaction> | null>(
  () => this.pageResource.value() ?? null
);
totalRecords = computed(() => this.page()?.totalElements ?? 0);
loading = computed(() => this.pageResource.isLoading());
```

**Flow:**
1. PrimeNG table fires `onLazyLoad(event)` → component calls `loadTransactions(event)` → `lazyLoadEvent.set(event)`.
2. `rxResource` sees its `params` changed → fires the HTTP request → loading becomes true.
3. Response arrives → `pageResource.value()` updates → `page` linked signal auto-syncs → template re-renders.
4. User clicks Refresh / changes filters → `refreshTick.update(n => n + 1)` → same loop.

**Why `linkedSignal` for `page`?** It serves two needs at once:
- **Read:** stays in sync with the latest HTTP response.
- **Write:** allows **optimistic delete** — when the user deletes a row, we immediately update `page.set({...snapshot, content: filtered})` so the row disappears before the server responds. If the API call fails, we restore the snapshot. Plain `computed` is read-only and would not allow this.

**Why `categoriesState` is its own signal:** The category dropdown is fetched once, not refreshed with the table. So it's a simple `signal<Category[]>([])` filled by an HTTP `subscribe`, exposed as readonly.

**Before:** A `BehaviorSubject` for categories, another `BehaviorSubject` for the page, a `Subject` for the refresh trigger, an `Observable` piped together with `switchMap` and `tap`, plus manual `loading` and `totalRecords` flags updated inside `tap()`. **Now:** declarative — change a signal, everything dependent updates.

---

### 4.6 AnalyticsHomeComponent (`features/analytics/`)

**Purpose:** Analytics dashboard with 5 independent sections: pie chart (category split), bar chart (monthly comparison), line chart (expense trend), metrics card, and insights list.

**Five resources, five tick signals:**

```ts
private categoryTick    = signal(0);
private comparisonTick  = signal(0);
private trendTick       = signal(0);
private metricsTick     = signal(0);
private insightsTick    = signal(0);

categoryResource = rxResource({
  params: () => this.categoryTick(),
  stream: () => this.analyticsService
    .getCategoryDistribution(DateUtil.toMonthString(this.selectedMonth))
    .pipe(tap((data) => this.updatePieChart(data))),
});

// ...four more, one per section
```

**Why separate ticks?** Each section refreshes on different events:
- Change the **selected month** → only refresh `categoryTick` (pie chart). The bar/line charts and metrics shouldn't refetch.
- Change the **trend date range** → only refresh `trendTick`.
- Click the global Refresh → bump all five ticks.

If we used a single shared trigger, every filter change would refetch all five endpoints — wasteful.

**Convenience computed signals:**
```ts
categoryDistribution = computed(() => this.categoryResource.value() ?? []);
monthlyComparison    = computed(() => this.comparisonResource.value() ?? []);
expenseTrend         = computed(() => this.trendResource.value() ?? []);
metrics              = computed(() => this.metricsResource.value() ?? null);
insights             = computed(() => this.insightsResource.value() ?? []);
loading              = computed(() => this.metricsResource.isLoading());
```

These exist so the template can say `metrics()?.totalIncome` instead of repeating `metricsResource.value()?.totalIncome` everywhere.

**The `tap()` inside the stream:** When chart data arrives, we still need to feed it into Chart.js (a non-signal-aware library). `tap()` runs `updatePieChart(data)` as a side effect — assigning to `this.pieChartData`, which the PrimeNG `<p-chart>` reads.

**Before:** 5 `BehaviorSubject<void>` triggers, 5 `Observable` pipelines with `switchMap` + `tap`, all bound in the template with `async` pipe. **Now:** 5 ticks + 5 resources — same architecture, half the code, no subscription lifecycle to worry about.

---

## 5. Before vs After: Side-by-Side

### Loading state in a service

**Before (BehaviorSubject):**
```ts
private loadingSubject = new BehaviorSubject<boolean>(false);
loading$ = this.loadingSubject.asObservable();

show(): void { this.loadingSubject.next(true); }
hide(): void { this.loadingSubject.next(false); }
```
Template: `<p-progressBar *ngIf="loading$ | async">`

**After (Signal):**
```ts
private loadingState = signal<boolean>(false);
loading = this.loadingState.asReadonly();

show(): void { this.loadingState.set(true); }
hide(): void { this.loadingState.set(false); }
```
Template: `<p-progressBar *ngIf="loading()">`

---

### HTTP-backed list with refresh

**Before (BehaviorSubject + switchMap):**
```ts
private refresh$ = new BehaviorSubject<void>(undefined);
summary$ = this.refresh$.pipe(
  tap(() => (this.loading = true)),
  switchMap(() => this.dashboardService.getSummary()),
  tap(() => (this.loading = false))
);
loadSummary() { this.refresh$.next(); }
```
Template: `<div *ngIf="summary$ | async as summary">`

**After (Signal + rxResource):**
```ts
private refreshTick = signal(0);
summaryResource = rxResource({
  params: () => this.refreshTick(),
  stream: () => this.dashboardService.getSummary(),
});
summary = computed(() => this.summaryResource.value() ?? null);
loading = computed(() => this.summaryResource.isLoading());
loadSummary() { this.refreshTick.update(n => n + 1); }
```
Template: `<div *ngIf="summary() as s">`

The win: **no manual loading toggle**, no `tap()` plumbing, the template no longer needs the `async` pipe, and `rxResource` exposes `error()` for free.

---

## Summary

The project uses signals in 6 places:

| Location | Signal(s) | Purpose |
|---|---|---|
| `AuthService` | `currentUser` | Logged-in user — readable from any component |
| `LoadingService` | `loading` | Global progress bar visibility |
| `MainLayoutComponent` | `breadcrumbItems` (via `toSignal`) | Breadcrumbs that update on navigation |
| `DashboardHomeComponent` | `refreshTick` + `rxResource` | Dashboard summary with manual refresh |
| `TransactionListComponent` | `categoriesState`, `lazyLoadEvent`, `refreshTick` + `rxResource` + `linkedSignal` for `page` | Paginated table with optimistic delete |
| `AnalyticsHomeComponent` | 5 tick signals + 5 `rxResource` blocks | Independent refresh of each analytics section |

Every place that used `BehaviorSubject` now uses a signal. Every place that needed an `Observable → UI` bridge uses `toSignal` or `rxResource`. Observables are still used inside service methods (HTTP calls return them) — signals just took over the *state-holding* layer.
