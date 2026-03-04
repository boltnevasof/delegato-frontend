import type { ReactNode } from 'react'
import { Card } from '../../../shared/ui'

export type AdminTableColumn<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
}

type AdminTableProps<T> = {
  title: string
  columns: AdminTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyText?: string
}

export function AdminTable<T>({
  title,
  columns,
  rows,
  rowKey,
  emptyText = 'Нет данных',
}: AdminTableProps<T>) {
  return (
    <Card className="mt-16">
      <h2 className="admin-section-title">{title}</h2>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  )
}
