const winston = require('winston');
const { createLogger, format, transports } = winston;

// singletone Class. it was not designed to instansciate
// use Logger statically and globaly
// initializing multiple time has no side effects
class Logger {
   static logger = null;
   static initialize() {
      if (Logger.logger === null) {
         Logger.logger = createLogger({
            level: 'info',
            format: format.json(),
            defaultMeta: { service: 'user-service' },
            transports: [
               new transports.File({ filename: './log/error.log', level: 'error' }),
               new transports.Console({ level: "info", format: format.simple() }),
            ],
            // handles uncaughtExceptions and log it and exits node process
            exceptionHandlers: [
               new transports.File({ filename: './log/error.log' })
            ],
         });
      }
      return;
   }
   static logError(errMsg) {
      Logger.logger.log('error',errMsg);
   }
   static logInfo(infoMsg) {
      Logger.logger.log('info',infoMsg);
   }
}

module.exports = Logger;
