import React from 'react'
import { AdminToastProvider } from './AdminToastProvider'
import { AdminErrorBoundary } from './AdminErrorBoundary'

export const AdminViewShell: React.FC<{ name: string; children: React.ReactNode }> = ({
  name,
  children,
}) => (
  <AdminToastProvider>
    <AdminErrorBoundary name={name}>{children}</AdminErrorBoundary>
  </AdminToastProvider>
)
