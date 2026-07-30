import { createBrowserRouter, Navigate } from 'react-router-dom';
import { createElement } from 'react';
import { AgentConsole } from '../features/agent-console/AgentConsole';

export const router = createBrowserRouter([
  {
    path: '/',
    element: createElement(Navigate, { to: '/console', replace: true }),
  },
  {
    path: '/console',
    element: createElement(AgentConsole),
  },
]);
