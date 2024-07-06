import chalk from 'chalk';

type TLogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

export const log = (message: string, level: TLogLevel = 'info') => {
  const colors = {
    info: 'blue',
    warn: 'yellow',
    error: 'red',
    success: 'green',
    debug: 'gray',
  };

  const svMsg = chalk.bold('[ SERVER ]: ') + message;

  switch (level) {
    case 'info':
      console.info(chalk.blue(svMsg));
      break;
    case 'warn':
      console.warn(chalk.yellow(svMsg));
      break;
    case 'error':
      console.error(chalk.red(svMsg));
      break;
    case 'success':
      console.info(chalk.green(svMsg));
      break;
    case 'debug':
      console.info(chalk.gray(svMsg));
      break;
    default:
      console.info(chalk.blue(svMsg));
      break;
  }
};
