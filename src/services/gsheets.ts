import { google, sheets_v4 } from 'googleapis';

import { JWT } from 'google-auth-library/build/src/auth/jwtclient.js';

import { IStatistics } from '../types/statistics';


export class GoogleSheetsAPI {
    private auth: JWT | null = null;
    private credentials: Record<string, any>;
    private sheets: sheets_v4.Sheets | null = null;
    private sheetName: string;

    constructor(credentials: Record<string, any>) {
        this.sheetName = '';
        this.credentials = credentials;
    }

    // Авторизация в Google API
    private async authorize(): Promise<JWT> {
        return new google.auth.JWT({
            email: this.credentials.client_email,
            key: this.credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
    }

    // Инициализация API Google Sheets
    public async init(): Promise<void> {
        this.auth = await this.authorize();
        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    }

    // Обновление таблицы данными о комиссиях
    public async updateSheetWithCommissions(spreadsheetId: string, statisticsData: IStatistics[]): Promise<void> {
        try {

            console.info('Google Sheet updated successfully.');
        } catch (error) {
            console.error('Error updating Google Sheet:', error);
        }
    }

    public async getSpreadsheetData(spreadsheetId: string, range: string): Promise<any[][] | null | undefined> {
        const response = await this.sheets?.spreadsheets.values.get({
            spreadsheetId,
            range,
        })  ;
        if (response) {
            const data : any[][] | null | undefined = response.data.values;
            return data
        }
    }

    async batchUpdateValues(spreadsheetId: string, updates: any[]) {
    
        const requestBody = {
            data: updates,
            valueInputOption: 'RAW',
        };
    
        try {
            const response = await this.sheets?.spreadsheets.values.batchUpdate({
                spreadsheetId,
                requestBody,
            });
    
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
        }
    }


    
    
    // Получение ID листа по его имени
    async getSheetIdByName(spreadsheetId: string, sheetName: string): Promise<number | null> {
        try {
            if (!this.sheets) {
                console.error('Google Sheets API not initialized.');
                return null;
            }
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: spreadsheetId,
            });
    
            const sheets = response.data.sheets;
            const sheet = sheets?.find(s => s.properties?.title === sheetName);
            return sheet?.properties?.sheetId ?? null;
        } catch (error) {
            console.error('Error retrieving sheet ID:', error);
            return null;
        }
    }

}
