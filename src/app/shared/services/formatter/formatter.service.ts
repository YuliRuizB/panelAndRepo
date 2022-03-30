import { Injectable } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs, 'es');

@Injectable({
  providedIn: 'root'
})
export class FormatterService {

  currencyFormat = ''

  constructor() { }


}
