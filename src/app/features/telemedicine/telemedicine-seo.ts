import { DOCUMENT } from '@angular/common';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Meta, MetaDefinition } from '@angular/platform-browser';

/** Component-scoped metadata so client navigation does not leave campaign tags on other pages. */
@Injectable()
export class TelemedicineSeo implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly previousTags: { selector: string; content: string | null }[] = [];
  private canonical: HTMLLinkElement | null = null;
  private previousCanonical: string | null = null;
  private createdCanonical = false;

  setPage(path: string, title: string, description: string): void {
    const tags: MetaDefinition[] = [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: `https://lov.com.co${path}` },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: 'https://lov.com.co/telemedicina/banner-web.png' },
    ];
    for (const tag of tags) {
      const selector = 'name' in tag ? `name="${tag.name}"` : `property="${tag.property}"`;
      this.previousTags.push({ selector, content: this.meta.getTag(selector)?.content ?? null });
      this.meta.updateTag(tag, selector);
    }
    this.canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!this.canonical) {
      this.canonical = this.document.createElement('link');
      this.canonical.rel = 'canonical';
      this.document.head.appendChild(this.canonical);
      this.createdCanonical = true;
    } else {
      this.previousCanonical = this.canonical.getAttribute('href');
    }
    this.canonical.href = `https://lov.com.co${path}`;
  }

  ngOnDestroy(): void {
    for (const tag of this.previousTags) {
      if (tag.content === null) this.meta.removeTag(tag.selector);
      else this.meta.getTag(tag.selector)?.setAttribute('content', tag.content);
    }
    if (this.createdCanonical) this.canonical?.remove();
    else if (this.previousCanonical !== null) this.canonical?.setAttribute('href', this.previousCanonical);
    else this.canonical?.removeAttribute('href');
  }
}
