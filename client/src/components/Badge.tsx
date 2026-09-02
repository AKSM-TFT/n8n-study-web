import type { FileStatus } from '../types/directory'

const labels: Record<FileStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  processed: 'Processed',
  failed: 'Failed',
}

const classes: Record<FileStatus, string> = {
  pending: 'text-text-muted border border-border',
  processing: 'text-warning bg-warning/10',
  processed: 'text-success bg-success/10',
  failed: 'text-danger bg-danger/10',
}

export function StatusBadge({ status }: { status: FileStatus }) {
  return (
    <span className={`inline-flex items-center rounded-btn px-2 py-0.5 text-xs font-medium ${classes[status]}`}>
      {labels[status]}
    </span>
  )
}
