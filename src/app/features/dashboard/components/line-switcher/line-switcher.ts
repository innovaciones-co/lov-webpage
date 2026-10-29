import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerSubscription } from '../../../../core/models/customer.model';
import { LINE_COLORS, LineAliasService } from '../../../../core/services/line-alias.service';
import { Modal } from '../../../../shared/components/modal/modal';

// Lines shown as chips under the selected one; the rest are in "Ver todas".
const CHIP_LIMIT = 4;

@Component({
  selector: 'app-line-switcher',
  imports: [FormsModule, Modal],
  templateUrl: './line-switcher.html',
  styleUrl: './line-switcher.scss'
})
export class LineSwitcher {
  readonly lines = inject(LineAliasService);
  readonly colors = LINE_COLORS;

  subscriptions = input<CustomerSubscription[]>([]);
  current = input<CustomerSubscription | null>(null);
  // When the selected line's plan expires (ISO date), if known.
  expiresAt = input<string | null>(null);

  readonly expiry = computed(() => {
    const at = this.expiresAt();
    const date = at ? new Date(at) : null;
    if (!date || Number.isNaN(date.getTime())) return null;
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const days = Math.round((startOfDay(date) - startOfDay(new Date())) / 86_400_000);
    const day = date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
    const text = days < 0 ? `Venció el ${day}` : days === 0 ? 'Vence hoy' : days === 1 ? 'Vence mañana' : `Vence el ${day} · en ${days} días`;
    return { text, soon: days <= 2 };
  });
  selected = output<CustomerSubscription>();

  showAll = signal(false);
  search = signal('');
  editing = signal<CustomerSubscription | null>(null);
  editName = signal('');
  editColor = signal(LINE_COLORS[0]);
  saving = signal(false);
  saveError = signal('');

  // The selected line always shows as a chip, even when it's past the first few.
  chips = computed(() => {
    const first = this.subscriptions().slice(0, CHIP_LIMIT);
    const current = this.current();
    if (current && first.length && !first.some(line => line.id === current.id)) {
      first[first.length - 1] = current;
    }
    return first;
  });

  hasMore = computed(() => this.subscriptions().length > CHIP_LIMIT);

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase().replace(/\s+/g, '');
    if (!term) return this.subscriptions();
    return this.subscriptions().filter(line =>
      line.msisdn.includes(term) || (this.lines.nickname(line) ?? '').toLowerCase().replace(/\s+/g, '').includes(term));
  });

  title(line: CustomerSubscription): string {
    return this.lines.nickname(line) ?? this.lines.formatNumber(line.msisdn);
  }

  stateLabel(state: string): string {
    return ({ ACTIVE: 'Activa', INACTIVE: 'Inactiva', SUSPENDED: 'Suspendida' } as Record<string, string>)[state] ?? state;
  }

  choose(line: CustomerSubscription): void {
    this.showAll.set(false);
    this.search.set('');
    if (line.id !== this.current()?.id) this.selected.emit(line);
  }

  openEdit(line: CustomerSubscription): void {
    this.showAll.set(false);
    this.editing.set(line);
    this.editName.set(this.lines.nickname(line) ?? '');
    this.editColor.set(this.lines.color(line));
    this.saveError.set('');
  }

  saveEdit(reset = false): void {
    const line = this.editing();
    if (!line) return;
    this.saving.set(true);
    const name = reset ? null : this.editName().trim() || null;
    this.lines.save(line.id, name, reset ? null : this.editColor()).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(null);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('No pudimos guardar los cambios. Inténtalo de nuevo.');
      }
    });
  }
}
