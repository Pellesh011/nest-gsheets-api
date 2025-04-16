import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IStatistics } from 'src/types/statistics';
import * as path from 'path';
import * as fs from 'fs';
import { GoogleSheetsAPI } from '../services/gsheets';

import { getColumnLetter, parseDateString} from '../utils/utils'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/update')
  async update(): Promise<void> {
      const baseRow: number = 1
      const credentialsFile = path.join(process.cwd(),  'credentials.json');
      const credentials = JSON.parse(fs.readFileSync(credentialsFile, 'utf-8'));
      const sheetsService = new GoogleSheetsAPI(credentials);
      await sheetsService.init();
      const spreadsheetId: string = "1R_VAbXIns8iniYFHs1xv0TmOTOzEl3firGC5mBk1lG4"
      
      let stat: IStatistics[] = await this.appService.getStatisticsData();  
      const spreadsheetsForUpdate: any = {}
      for (let item of stat){
        const spreadsheetName: string = item.ObjectName.replace(/[0-9]/g, '');
        if (!spreadsheetsForUpdate[spreadsheetName]) {
          spreadsheetsForUpdate[spreadsheetName] = {
            [item.ObjectName]: { rowsUpdate: []}
          }  
        }
        if (!spreadsheetsForUpdate[spreadsheetName][item.ObjectName]) {
          spreadsheetsForUpdate[spreadsheetName][item.ObjectName] = { rowsUpdate: []}
        }
        spreadsheetsForUpdate[spreadsheetName][item.ObjectName].rowsUpdate.push(item);
        
      }
      
      let datesMap: any = []
      for (let key in spreadsheetsForUpdate){
        const rows = await sheetsService.getSpreadsheetData(spreadsheetId, `${key}!A${baseRow+3}:A${baseRow+7}`);
        if (rows){
          spreadsheetsForUpdate[key].rows = {}
          for (let i = 0; i < rows.length; i++){
            spreadsheetsForUpdate[key].rows[rows[i][0]] = i + 4
          }
        } else {
          //TODO логика вставки недостоющей строки статистики
          return
        }
        console.log(rows)
        const dates = await sheetsService.getSpreadsheetData(spreadsheetId, `${key}!F${baseRow+1}:${baseRow+1}`);
        if (dates && dates[0]) {
          dates[0].push('')
        }
        if (dates){
          datesMap = dates.map((row, rowIndex) => {
            return row.map((cell, colIndex) => {
              
                const colLetter = getColumnLetter(colIndex + 5);
                let date = parseDateString(cell);
                let isPlan = false
                let isFact = true
                if (!date){
                  date = parseDateString(row[colIndex - 1])
                  isPlan = true
                  isFact = false
                }

                return { col: colLetter, month: date?.month, year: date?.year, plan: isPlan, fact: isFact }; 
            })
          }).flat(); 
        
        }
      }

      const values: any[] = []
      for (let key in spreadsheetsForUpdate){
        const rows = spreadsheetsForUpdate[key]
        for (let rKey in rows){
          if (rKey !== 'rows')
            for (let data of rows[rKey].rowsUpdate){
              const year: Number = data.Year
              const month: Number = data.Month
              const plan: Number = data.Plan
              const fact: Number = data.Fact
              const dateMapsPlanItem: any = datesMap.find(item => item.month === month && item.year === year && item.plan === true)
              const dateMapsFactItem: any = datesMap.find(item => item.month === month && item.year === year && item.fact === true)
              const spreadsheetRow: number = rows.rows[data.ObjectName]
              if (dateMapsPlanItem && dateMapsFactItem && spreadsheetRow){
                const range = `${key}!${dateMapsFactItem.col}${spreadsheetRow}:${dateMapsPlanItem.col}${spreadsheetRow}`
                values.push({
                  range: range,
                  values:  [[fact || 0, plan || 0]]
                })
             
            }
        }
      

      }

      await sheetsService.batchUpdateValues(spreadsheetId, values)
    }

  }
}
