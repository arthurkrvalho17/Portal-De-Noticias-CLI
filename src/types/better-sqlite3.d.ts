declare module 'better-sqlite3' {
  namespace Database {
    interface Options {
      readonly?: boolean;
      fileMustExist?: boolean;
      timeout?: number;
      verbose?: Function | null;
      nativeBinding?: string;
    }

    interface Statement {
      run(...params: any[]): any;
      get(...params: any): any;
      all(...params: any): any[];
      pluck(toggleState?: boolean): Statement;
      expand(toggleState?: boolean): Statement;
      raw(toggleState?: boolean): Statement;
      iterate(...params: any): IterableIterator<any>;
    }
  }

  class Database {
    constructor(filename: string, options?: Database.Options);
    prepare(sql: string): Database.Statement;
    exec(sql: string): void;
    pragma(sql: string): any;
    close(): void;
  }

  export = Database;
}
