# Angular Multi-Theme Architecture (Compatible with Angular 18)

## 1. Overview
A scalable and runtime-switchable theming system for Angular 18 applications supporting multiple themes (light/dark) and brands (tenant-specific styles) using SCSS tokens and CSS variables.

---

## 2. Recommended Project Structure
```
src/
  app/
    core/
      theme/
        theme.module.ts
        theme.service.ts
        theme.tokens.ts
        theme-init.factory.ts
        theme.guard.ts
    shared/
      ui/
        button/
          button.component.ts
          button.component.html
          button.component.scss
  styles/
    base/
      _normalize.scss
      _typography.scss
      _layout.scss
    tokens/
      _tokens.scss
      _aliases.scss
      _mixins.scss
    themes/
      _light.scss
      _dark.scss
      brands/
        _acme.scss
        _globex.scss
    material/
      _mat-core.scss
      _mat-theme.scss
    index.scss
```

---

## 3. SCSS Tokens (Design Foundation)
```scss
// styles/tokens/_tokens.scss
$palette: (
  primary: #3666ff,
  secondary: #5f6b7a,
  success: #22c55e,
  warning: #f59e0b,
  danger:  #ef4444,
) !default;

$roles: (
  text:    #0b1220,
  bg:      #ffffff,
  surface: #f8fafc,
  border:  #e5e7eb
) !default;
```

---

## 4. Mixins to Emit CSS Variables
```scss
// styles/tokens/_mixins.scss
@use "sass:map";

@mixin emit-css-vars($map, $prefix) {
  @each $k, $v in $map {
    --#{$prefix}-#{$k}: #{$v};
  }
}

@mixin theme-vars($palette, $roles) {
  @include emit-css-vars($palette, "color");
  @include emit-css-vars($roles,   "role");
}
```

---

## 5. Theme Definitions
```scss
// styles/themes/_light.scss
$roles: map.merge($roles, (text: #0b1220, bg: #ffffff)) !default;
:root[data-theme="light"] { @include theme-vars($palette, $roles); }

// styles/themes/_dark.scss
$roles: map.merge($roles, (text: #e5e7eb, bg: #0b1220, surface:#111827, border:#1f2937)) !default;
:root[data-theme="dark"]  { @include theme-vars($palette, $roles); }

// styles/themes/brands/_acme.scss
$palette: map.merge($palette, (primary: #7c3aed, secondary: #06b6d4)) !default;
:root[data-brand="acme"]  { @include emit-css-vars($palette, "color"); }
```

---

## 6. Main Style Entry (index.scss)
```scss
@use './base/normalize';
@use './tokens/tokens';
@use './tokens/aliases';
@use './tokens/mixins' as *;
@use './themes/light';
@use './themes/dark';
@use './themes/brands/acme';
@use './themes/brands/globex';

:root { @include theme-vars($palette, $roles); }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) { @include theme-vars(map.merge($palette, ()), map.merge($roles, (bg:#0b1220, text:#e5e7eb))); }
}
```

---

## 7. Angular Material Integration (Optional)
```scss
// styles/material/_mat-theme.scss
@use '@angular/material' as mat;

$mat-primary: mat.define-palette(mat.$indigo-palette, 500);
$mat-accent:  mat.define-palette(mat.$pink-palette, A200);
$mat-theme-light: mat.define-light-theme((
  color: (primary: $mat-primary, accent: $mat-accent)
));

@include mat.core();
:root[data-theme="light"] { @include mat.all-component-themes($mat-theme-light); }
```

---

## 8. Theme Service (Runtime Switching)
```ts
import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeName = 'light' | 'dark';
export type BrandName = 'default' | 'acme' | 'globex';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'app.theme';
  private readonly BRAND_KEY = 'app.brand';

  constructor(@Inject(DOCUMENT) private doc: Document) {}

  init(theme?: ThemeName, brand?: BrandName) {
    const t = theme ?? (localStorage.getItem(this.THEME_KEY) as ThemeName) ?? 'light';
    const b = brand ?? (localStorage.getItem(this.BRAND_KEY) as BrandName) ?? 'default';
    this.apply(t, b);
  }

  apply(theme: ThemeName, brand: BrandName = 'default') {
    const el = this.doc.documentElement;
    el.setAttribute('data-theme', theme);
    el.setAttribute('data-brand', brand);
    localStorage.setItem(this.THEME_KEY, theme);
    localStorage.setItem(this.BRAND_KEY, brand);
  }
}
```

---

## 9. Initialization Module
```ts
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ThemeService } from './theme.service';

export const themeInitFactory = (svc: ThemeService) => () => svc.init();

@NgModule({
  providers: [
    ThemeService,
    { provide: APP_INITIALIZER, multi: true, useFactory: themeInitFactory, deps: [ThemeService] }
  ]
})
export class ThemeModule {}
```

---

## 10. Component Styling Example
```scss
:host {
  background: var(--role-surface);
  color: var(--role-text);
  border: 1px solid var(--role-border);
}
```

---

## 11. Brand and Tenant Handling
- Use `ThemeService.apply(theme, brand)` on login or route change.
- Drive brand from domain (e.g., `acme.app.com`) or route (`/t/acme/...`).
- Store brand assets under `assets/brands/<brand>/`.

---

## 12. Testing & Validation
- **E2E:** Validate `[data-theme]` switching updates computed styles.
- **Unit:** Verify `ThemeService` applies correct attributes and persistence.
- **Lint:** Disallow raw color codes; enforce CSS variable usage.

---

## 13. Angular 18 Compatibility
✅ Fully compatible with Angular 18, since it relies on standard CSS variables and SCSS preprocessing.

**Checks:**
- Ensure Angular Material version matches Angular 18.
- `APP_INITIALIZER` approach works with standalone APIs.
- Works with SSR (Universal) by initializing theme early.

---

### ✅ Benefits
- **Runtime theme switch** (no rebuilds)
- **Token-driven design** (SCSS + CSS vars)
- **Multi-brand support** with !default overrides
- **Lightweight & SSR safe**
- **Works with Angular 18 standalone components and zoneless mode**

