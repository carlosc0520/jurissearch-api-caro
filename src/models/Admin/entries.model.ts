export class EntriesModel {
    ID: number = 0;
    TITLE: string = '';
    ISBINDING: boolean = false;
    AMBIT: string = '';
    FRESOLUTION: string = '';
    OJURISDICCIONAL: string = '';
    MAGISTRATES: string = '';
    VDESIDENTE: number = 1;
    CVOTE: number = 1;
    ENTRIEFILE: string = '';
    NENTRIEFILE?: string = '';
    ENTRIEFILERESUMEN: string = '';
    NENTRIEFILERESUMEN?: string = '';
    KEYWORDS: string = '';
    TEMA: string = '';
    SUBTEMA: string = '';
    SHORTSUMMARY: string = '';
    RESUMEN: string = '';
    UCRCN: string = '';
    FCRCN: Date = new Date();
    FEDCN: Date = new Date();
    CDESTDO: string = '';
    TYPE: string = '';
    TIPO: string = '';
    CASO: string = '';
    RESUMEN2: string = '';
}