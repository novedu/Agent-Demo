import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const services = [
  {
    name: 'Runtime Server',
    port: Number(process.env.PORT ?? 3001),
    command: [npmCommand, ['run', 'server']],
  },
  {
    name: 'Agent Console',
    port: 5173,
    command: [
      npmCommand,
      ['--prefix', 'apps/agent-console', 'run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'],
    ],
  },
];

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    const finish = (open) => {
      socket.destroy();
      resolve(open);
    };

    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.setTimeout(350, () => finish(false));
  });
}

let shuttingDown = false;
let children = [];

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach((child) => child.kill('SIGTERM'));
  setTimeout(() => process.exit(exitCode), 100);
}

async function start() {
  for (const service of services) {
    if (await isPortOpen(service.port)) {
      console.log(`${service.name} already running on http://127.0.0.1:${service.port}; reusing it.`);
      continue;
    }

    const [command, args] = service.command;
    const child = spawn(command, args, { stdio: 'inherit' });
    children.push(child);
    console.log(`Starting ${service.name} on port ${service.port}...`);

    child.on('exit', (code, signal) => {
      if (shuttingDown) return;
      const exitCode = typeof code === 'number' ? code : signal ? 1 : 0;
      shutdown(exitCode);
    });
  }

  if (children.length === 0) {
    console.log('Agent Studio is already running. No new processes were started.');
  }
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

start().catch((error) => {
  console.error(error);
  shutdown(1);
});
