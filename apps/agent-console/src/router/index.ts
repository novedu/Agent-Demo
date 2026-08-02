import { createElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AgentConsole } from '../features/agent-console/AgentConsole';
import { StudioLayout } from '../layout/StudioLayout';
import { Dashboard } from '../pages/Dashboard';
import { Evaluation } from '../pages/Evaluation';
import { Knowledge } from '../pages/Knowledge';
import { Memory } from '../pages/Memory';
import { Settings } from '../pages/Settings';
import { Workflow } from '../pages/Workflow';

export const router = createBrowserRouter([
  {
    path: '/',
    element: createElement(StudioLayout),
    children: [
      {
        index: true,
        element: createElement(Navigate, { to: '/agent', replace: true }),
      },
      {
        path: 'dashboard',
        element: createElement(Dashboard),
      },
      {
        path: 'agent',
        element: createElement(AgentConsole),
      },
      {
        path: 'workflow',
        element: createElement(Workflow),
      },
      {
        path: 'knowledge',
        element: createElement(Knowledge),
      },
      {
        path: 'memory',
        element: createElement(Memory),
      },
      {
        path: 'evaluation',
        element: createElement(Evaluation),
      },
      {
        path: 'settings',
        element: createElement(Settings),
      },
    ],
  },
]);
