import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncateKey', standalone: true })
export class TruncateKeyPipe implements PipeTransform {
  transform(key: string, start = 6, end = 4): string {
    if (!key || key.length <= start + end) return key;
    return `${key.slice(0, start)}...${key.slice(-end)}`;
  }
}
