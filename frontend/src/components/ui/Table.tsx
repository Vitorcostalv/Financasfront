import { ReactNode } from 'react';

type TableProps = {
  columns: string[];
  children: ReactNode;
};

const Table = ({ columns, children }: TableProps) => (
  <div className="overflow-hidden rounded-2xl border border-app-border">
    <table className="app-table">
      <thead className="bg-app-panelAlt">
        <tr>
          {columns.map((column) => (
            <th key={column} className="px-4 py-3">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-app-panel">{children}</tbody>
    </table>
  </div>
);

export default Table;
