import * as sql from 'mssql';
export declare class DatabaseService {
    private static pool;
    private static isConnecting;
    static getPool(): Promise<sql.ConnectionPool>;
    static executeStoredProcedure(procedureName: string, inputs?: {
        name: string;
        type: any;
        value: any;
    }[], outputs?: {
        name: string;
        type: any;
    }[]): Promise<any>;
    static query(queryString: string, params?: {
        name: string;
        type: any;
        value: any;
    }[]): Promise<any>;
    static close(): Promise<void>;
    static reconnect(): Promise<void>;
    static isConnected(): boolean;
    private static waitForConnection;
    static testConnection(): Promise<boolean>;
}
