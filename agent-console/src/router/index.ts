import { createBrowserRouter, Navigate } from 'react-router-dom';
import { createElement } from 'react';
import { AgentConsole } from '../pages/AgentConsole';

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
