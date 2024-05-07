import { Express } from 'express';

export class EntriesModel {
    ID: number = 0;
    TITLE: string = '';
    ISBINDING: boolean = false;
    AMBIT: string = '';
    FRESOLUTION: string = '';
    OJURISDICCIONAL: string = '';
    MAGISTRATES: any = [];
    VDESIDENTE: number = 1;
    CVOTE: number = 1;
    ENTRIEFILE: Express.Multer.File;
    ENTRIEFILERESUMEN: Express.Multer.File;
    KEYWORDS: any = [];
    TEMA: string = '';
    SUBTEMA: string = '';
    SHORTSUMMARY: string = '';
    RESUMEN: string = '';
    UCRCN: string = '';
    FCRCN: Date = new Date();
    FEDCN: Date = new Date();
    CDESTDO: string = '';
}