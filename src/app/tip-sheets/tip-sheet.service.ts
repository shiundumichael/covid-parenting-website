import { Injectable } from '@angular/core';
import { SpreadsheetService } from '../shared/services/spreadsheet.service';
import { Language, LanguageCSVRow, TipSheet } from './tip-sheets.model';
import { Observable, of } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipSheetService {

  languagesByCode: { [langCode: string]: Language };
  sortedLanguages: Language[];
  tipSheetsByLanguage: { [langCode: string]: TipSheet[] };

  constructor(private spreadsheetService: SpreadsheetService) {
    //console.log("Service created");
    this.fetchTipSheets();
  }

  private fetchTipSheets(): Observable<{ [langCode: string]: TipSheet[] }> {
    return this.spreadsheetService.getCSVObjects("/assets/tip_sheets/tipSheetNames.csv")
      .pipe(
        shareReplay(1),
        map((rows: LanguageCSVRow[]) => {
          this.languagesByCode = {};
          this.tipSheetsByLanguage = {};
          rows.forEach((row) => {
            let langCode = row.languageCode ? row.languageCode.toLowerCase().trim() : null;
            if (langCode !== null) {
              if (!this.tipSheetsByLanguage[langCode]) {
                this.tipSheetsByLanguage[langCode] = [];
                let lang: Language = {
                  code: langCode,
                  name: row.languageName
                };
                this.languagesByCode[langCode] = lang;
              }
              this.tipSheetsByLanguage[langCode].push({
                title: row.title,
                thumnailSrc: `/assets/images/tip_sheet_thumbnails/${row.tipSheetNumber}.webp`,
                pdfSrc: `/assets/tip_sheets/${langCode}/${row.tipSheetNumber}.pdf`
              });
            }
          });
          this.sortedLanguages = Object.keys(this.languagesByCode)
            .map((code) => this.languagesByCode[code])
            .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
          return this.tipSheetsByLanguage;
        })
      );
  }

  public getLanguages(): Observable<Language[]> {
    if (this.sortedLanguages) {
      return of(this.sortedLanguages);
    }
    return this.fetchTipSheets()
      .pipe(
        map(() => {
          return this.sortedLanguages;
        })
      );
  }

  public getLanguageByCode(langCode: string): Observable<Language> {
    if (this.languagesByCode && this.languagesByCode[langCode]) {
      return of(this.languagesByCode[langCode]);
    }
    return this.fetchTipSheets()
      .pipe(
        map(() => {
          return this.languagesByCode[langCode];
        })
      );
  }

  public getTipSheetsForLanguage(langCode: string): Observable<TipSheet[]> {
    if (this.tipSheetsByLanguage && this.tipSheetsByLanguage[langCode]) {
      return of(this.tipSheetsByLanguage[langCode]);
    }
    return this.fetchTipSheets()
      .pipe(
        map(() => {
          return this.tipSheetsByLanguage[langCode];
        })
      );
  }

}
