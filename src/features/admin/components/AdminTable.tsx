import React from 'react'

export type AdminTableColumn<T> = {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
}

type AdminTableProps<T extends Record<string, unknown>> = {
  title?: string
  columns: AdminTableColumn<T>[]
  rows: T[]
  rowKey?: (row: T) => unknown
  loading?: boolean
  emptyText?: string
}

export function AdminTable<T extends Record<string, unknown>>({
  title,
  columns,
  rows,
  rowKey,
  loading = false,
  emptyText = 'Нет данных',
}: AdminTableProps<T>) {
  if (loading) {
    return <div className="admin-table-loading">Загрузка...</div>
  }

  return (
    <div className="admin-table-wrap mt-16">
      {title && <h3 className="admin-table-title">{title}</h3>}
      {rows.length === 0 ? (
        <div className="admin-table-empty">{emptyText}</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={rowKey ? String(rowKey(row)) : i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
