import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

// The server caches files in public/ for a year, so browsers would keep an old cj.css:
// bump the version whenever cj.css changes.
const STYLESHEET_VERSION = '2026-11-09.2';
const STYLESHEET = `/construimos-juntos/cj.css?v=${STYLESHEET_VERSION}`;
const FONTS = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Mrs+Saint+Delafield&display=swap';

/**
 * What every "Construimos juntos" page needs: its own stylesheet and fonts (Manantial's look,
 * kept out of LOV's bundle), its title and share preview, and noindex so the campaign stays
 * apart from LOV's site in search engines.
 */
@Injectable()
export class CjPage implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly previousTags: { selector: string; content: string | null }[] = [];
  private previousTitle = '';

  setup(path: string, title: string, description: string): void {
    this.previousTitle = this.title.getTitle();
    this.title.setTitle(title);
    // The stylesheet and fonts stay when leaving: their classes are all cj-*, so they can't touch LOV pages.
    this.addLink('cj-css', 'stylesheet', STYLESHEET);
    this.addLink('cj-fonts-pre', 'preconnect', 'https://fonts.gstatic.com', true);
    this.addLink('cj-fonts', 'stylesheet', FONTS);

    const image = 'https://lov.com.co/construimos-juntos/templo-terminado.jpg';
    const tags: MetaDefinition[] = [
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: `https://lov.com.co${path}` },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: image },
      { name: 'theme-color', content: '#0A1120' },
    ];
    for (const tag of tags) {
      const selector = 'name' in tag ? `name="${tag.name}"` : `property="${tag.property}"`;
      this.previousTags.push({ selector, content: this.meta.getTag(selector)?.content ?? null });
      this.meta.updateTag(tag, selector);
    }
    // Scroll animations start hidden only when JS runs, so nothing stays invisible without it.
    if (this.browser) this.document.documentElement.classList.add('cj-js');
  }

  scrollTo(id: string, event?: Event): void {
    event?.preventDefault();
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ngOnDestroy(): void {
    this.title.setTitle(this.previousTitle);
    for (const tag of this.previousTags) {
      if (tag.content === null) this.meta.removeTag(tag.selector);
      else this.meta.getTag(tag.selector)?.setAttribute('content', tag.content);
    }
    if (this.browser) this.document.documentElement.classList.remove('cj-js');
  }

  private addLink(id: string, rel: string, href: string, crossOrigin = false): void {
    if (this.document.getElementById(id)) return;
    const link = this.document.createElement('link');
    link.id = id;
    link.rel = rel;
    link.href = href;
    if (crossOrigin) link.crossOrigin = '';
    this.document.head.appendChild(link);
  }
}
