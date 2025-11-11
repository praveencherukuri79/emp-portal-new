import { Injectable, Inject, signal, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeName = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app.theme';
  private readonly defaultTheme: ThemeName = 'light';
  
  // Signal to track current theme
  private _currentTheme = signal<ThemeName>(this.defaultTheme);
  
  // Public computed signal
  public readonly currentTheme = computed(() => this._currentTheme());

  constructor(@Inject(DOCUMENT) private document: Document) {
    // Initialize theme on service creation
    this.init();
  }

  /**
   * Initialize theme from localStorage or use default
   */
  init(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeName;
    const theme = savedTheme || this.defaultTheme;
    this.apply(theme);
  }

  /**
   * Apply theme to document root
   */
  apply(theme: ThemeName): void {
    const root = this.document.documentElement;
    
    // Remove existing theme attribute
    root.removeAttribute('data-theme');
    
    // Apply new theme
    root.setAttribute('data-theme', theme);
    
    // Update signal
    this._currentTheme.set(theme);
    
    // Persist to localStorage
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggle(): void {
    const newTheme = this._currentTheme() === 'light' ? 'dark' : 'light';
    this.apply(newTheme);
  }

  /**
   * Set theme explicitly
   */
  setTheme(theme: ThemeName): void {
    this.apply(theme);
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this._currentTheme() === 'dark';
  }

  /**
   * Check if current theme is light
   */
  isLight(): boolean {
    return this._currentTheme() === 'light';
  }
}

