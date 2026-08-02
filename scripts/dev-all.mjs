import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [
  spawn(npmCommand, ['run', 'server'], { stdio: 'inherit' }),
  spawn(npmCommand, ['--prefix', 'apps/agent-console', 'run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
    stdio: 'inherit',
  }),
];

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach((child) => child.kill('SIGTERM'));
  setTimeout(() => process.exit(exitCode), 100);
}

children.forEach((child) => {
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    const exitCode = typeof code === 'number' ? code : signal ? 1 : 0;
    shutdown(exitCode);
  });
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
