import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'usdcFormat', standalone: true })
export class UsdcFormatPipe implements PipeTransform {
  transform(value: number | string, decimals = 2): string {
    const num = Number(value);
    if (isNaN(num)) return '—';
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} USDC`;
  }
}
