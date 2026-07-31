import { createElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AgentConsole } from '../features/agent-console/AgentConsole';
import { StudioLayout } from '../layout/StudioLayout';
import { Dashboard } from '../pages/Dashboard';
import { PlaceholderPage } from '../pages/PlaceholderPage';

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
        element: createElement(PlaceholderPage, {
          title: 'Workflow Builder',
          description: 'Plan and workflow design surface placeholder.',
        }),
      },
      {
        path: 'knowledge',
        element: createElement(PlaceholderPage, {
          title: 'Knowledge Center',
          description: 'Knowledge source management placeholder.',
        }),
      },
      {
        path: 'memory',
        element: createElement(PlaceholderPage, {
          title: 'Memory Center',
          description: 'Long-term memory inspection placeholder.',
        }),
      },
      {
        path: 'evaluation',
        element: createElement(PlaceholderPage, {
          title: 'Evaluation Center',
          description: 'Evaluation datasets and scorecard placeholder.',
        }),
      },
      {
        path: 'settings',
        element: createElement(PlaceholderPage, {
          title: 'Settings',
          description: 'Environment and workspace settings placeholder.',
        }),
      },
    ],
  },
]);
