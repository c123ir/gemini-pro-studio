// backend/src/types/morgan.d.ts
declare module 'morgan' {
  import { Handler } from 'express';

  /**
   * Create a new morgan logger middleware function
   * @param format Format string or predefined format name
   * @param options Configuration object
   */
  function morgan(format: string | morgan.FormatFn, options?: morgan.Options): Handler;

  namespace morgan {
    /**
     * Morgan format function
     */
    type FormatFn = (tokens: TokenIndexer, req: Request, res: Response) => string;

    /**
     * Morgan options object
     */
    interface Options {
      /**
       * Output stream for writing log lines
       */
      stream?: { write: (str: string) => void };

      /**
       * Function to determine if logging is skipped
       */
      skip?: (req: Request, res: Response) => boolean;
    }

    /**
     * Predefined formats
     */
    const combined: string;
    const common: string;
    const dev: string;
    const short: string;
    const tiny: string;
  }

  export = morgan;
} 