import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ColorSchemeService {

  constructor(@Inject(DOCUMENT) private document: Document) {}

  getColorScheme(): string {
    return localStorage.getItem('colorScheme') ?? 'auto';
  }

  setColorScheme(newColorScheme: string): void {
    localStorage.setItem('colorScheme', newColorScheme);
    this.loadStoredTheme();
  }

  loadStoredTheme(): void {
    const darkModeOn = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', darkModeOn);
    document.body.classList.toggle('light', !darkModeOn);
  }
}
