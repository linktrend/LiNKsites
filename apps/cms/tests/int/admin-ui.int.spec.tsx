import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ModerationActions } from '@/components/ModerationActions'
import { SiteSelector } from '@/components/SiteSelector'
import { DocumentListTable } from '@/components/DocumentListTable'
import { AdminToastProvider } from '@/admin/components/AdminToastProvider'
import { usePermissionMetadata } from '@/admin/hooks/usePermissionMetadata'

const mockUserState: Record<string, unknown> = {
  roles: [{ name: 'viewer' }],
  assignedSites: ['site-1', 'site-2'],
}

vi.mock('@payloadcms/ui/providers/Auth', () => ({
  useAuth: () => ({ user: mockUserState }),
}))

vi.mock('@payloadcms/ui/providers/Config', () => ({
  useConfig: () => ({ config: { serverURL: 'http://localhost' } }),
}))

vi.mock('@/admin/hooks/usePermissionMetadata', () => ({
  usePermissionMetadata: vi.fn(() => ({
    canPublish: false,
    canApprove: false,
    canDelete: false,
    canUpdate: false,
    canTranslate: false,
    loading: false,
  })),
}))

const createResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  headers: { get: () => null },
})

describe('Admin UI hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(mockUserState, { roles: [{ name: 'viewer' }], assignedSites: ['site-1', 'site-2'] })
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('disables moderation actions when permission is insufficient', async () => {
    mockUserState.roles = [{ name: 'viewer' }]
    const fetchMock = vi.fn().mockResolvedValue(createResponse({ updatedAt: '2023-01-01' }))
    // Patch call
    fetchMock.mockResolvedValueOnce(createResponse({ updatedAt: '2023-01-01' }))
    fetchMock.mockResolvedValueOnce(createResponse({}))
    global.fetch = fetchMock as unknown as typeof fetch

    render(
      <AdminToastProvider>
        <ModerationActions collectionSlug="articles" docId="123" siteId="site-1" />
      </AdminToastProvider>,
    )

    const approveButton = screen.getByRole('button', { name: /approve/i })
    expect((approveButton as HTMLButtonElement).disabled).toBe(true)
    expect((approveButton as HTMLButtonElement).getAttribute('title')).toBe(
      'You do not have permission to perform this action',
    )
  })

  it('runs optimistic update on moderation approve', async () => {
    vi.mocked(usePermissionMetadata).mockReturnValue({
      canPublish: true,
      canApprove: true,
      canDelete: true,
      canUpdate: true,
      canTranslate: true,
      loading: false,
    })
    const fetchMock = vi
      .fn()
      // Concurrency check
      .mockResolvedValueOnce(createResponse({ updatedAt: '2023-01-01', updatedBy: 'tester' }))
      // Patch update
      .mockResolvedValueOnce(createResponse({}, 200))

    global.fetch = fetchMock as unknown as typeof fetch
    const optimisticSpy = vi.fn()

    render(
      <AdminToastProvider>
        <ModerationActions
          collectionSlug="articles"
          docId="123"
          siteId="site-1"
          onOptimisticState={optimisticSpy}
        />
      </AdminToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /approve/i }))

    await waitFor(() => expect(optimisticSpy).toHaveBeenCalledWith('approved', '123'))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  })

  it('persists site selection via SiteSelector', async () => {
    mockUserState.roles = [{ name: 'admin' }]
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        docs: [
          { id: 'site-1', name: 'One' },
          { id: 'site-2', name: 'Two' },
        ],
      }),
    )
    global.fetch = fetchMock as unknown as typeof fetch

    const onChange = vi.fn()
    window.localStorage.setItem('admin.site', 'site-2')

    render(
      <AdminToastProvider>
        <SiteSelector onChange={onChange} />
      </AdminToastProvider>,
    )

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('site-2'))
    expect((screen.getByLabelText(/site/i) as HTMLSelectElement).value).toEqual('site-2')
    expect(window.localStorage.getItem('admin.site')).toEqual('site-2')
  })

  it('fires sorting change in DocumentListTable and keeps pagination controls stable', () => {
    const docs = [
      { id: '1', title: 'B', collectionSlug: 'posts' },
      { id: '2', title: 'A', collectionSlug: 'posts' },
    ]
    const onSortChange = vi.fn()
    const onPageChange = vi.fn()

    render(
      <DocumentListTable
        documents={docs}
        sort={{ field: 'title', direction: 'asc' }}
        onSortChange={onSortChange}
        page={1}
        pageSize={1}
        total={2}
        onPageChange={onPageChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Title/i }))
    expect(onSortChange).toHaveBeenCalled()

    const nextButton = screen.getByRole('button', { name: /Next page/i })
    expect((nextButton as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(nextButton)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
