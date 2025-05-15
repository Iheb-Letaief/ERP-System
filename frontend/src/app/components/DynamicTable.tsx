import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}

interface Action<T> {
    label: string;
    icon: string;
    color?: string;
    href?: (row: T) => string;
    onClick?: (event: React.MouseEvent, row: T) => void;
    visible?: (row: T, userRole: string) => boolean;
}

interface Pagination {
    page: number;
    pageSize: number;
    total: number;
}

interface DynamicTableProps<T> {
    data: T[];
    columns: Column<T>[];
    actions?: Action<T>[];
    onSort?: (sort: { key: string; direction: 'asc' | 'desc' }) => void;
    defaultSort?: { key: string; direction: 'asc' | 'desc' };
    pagination?: Pagination;
    onPageChange?: (page: number) => void;
    userRole: string;
}

const DynamicTable = <T extends Record<string, any>>({
                                                         data = [],
                                                         columns = [],
                                                         actions = [],
                                                         onSort,
                                                         defaultSort = { key: '', direction: 'asc' },
                                                         pagination = { page: 1, pageSize: 10, total: 0 },
                                                         onPageChange,
                                                         userRole,
                                                     }: DynamicTableProps<T>) => {
    const { t } = useTranslation('Table');
    const [sort, setSort] = useState(defaultSort);

    const handleSort = (key: string) => {
        const newDirection = sort.key === key && sort.direction === 'asc' ? 'desc' : 'asc';
        setSort({ key, direction: newDirection });
        if (onSort) onSort({ key, direction: newDirection });
    };

    const totalPages = Math.ceil(pagination.total / pagination.pageSize);

    return (
        <div className="card">
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key as string}
                                    onClick={() => col.sortable && handleSort(col.key as string)}
                                    style={col.sortable ? { cursor: 'pointer' } : {}}
                                    className="text-nowrap"
                                    aria-sort={sort.key === col.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                >
                                    {col.label}
                                    {col.sortable && sort.key === col.key && (
                                        <span aria-hidden="true">{sort.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                                    )}
                                </th>
                            ))}
                            {actions.length > 0 && <th className="text-nowrap">{t('actions')}</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center">
                                    {t('noData')}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr key={row._id || index}>
                                    {columns.map((col) => (
                                        <td key={col.key as string}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                                        </td>
                                    ))}
                                    {actions.length > 0 && (
                                        <td>
                                            <div className="btn-list flex-nowrap">
                                                {actions
                                                    .filter((action) => !action.visible || action.visible(row, userRole))
                                                    .map((action, idx) => (
                                                        action.href ? (
                                                            <Link
                                                                key={idx}
                                                                href={action.href(row)}
                                                                className={`btn btn-sm btn-${action.color || 'primary'} me-1`}
                                                                title={action.label}
                                                                aria-label={action.label}
                                                            >
                                                                <i className={`ti ti-${action.icon}`}></i>
                                                            </Link>
                                                        ) : (
                                                            <button
                                                                key={idx}
                                                                className={`btn btn-sm btn-${action.color || 'primary'} me-1`}
                                                                onClick={(e) => action.onClick && action.onClick(e, row)}
                                                                title={action.label}
                                                                aria-label={action.label}
                                                            >
                                                                <i className={`ti ti-${action.icon}`}></i>
                                                            </button>
                                                        )
                                                    ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            {pagination.total > pagination.pageSize && (
                <div className="card-footer d-flex justify-content-between align-items-center">
                    <div>
                        {t('showing')} {data.length} {t('of')} {pagination.total} {t('items')}
                    </div>
                    <ul className="pagination m-0">
                        <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                aria-label={t('previous')}
                            >
                                <span aria-hidden="true">«</span>
                                <span className="sr-only">{t('previous')}</span>
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => onPageChange && onPageChange(page)}
                                    aria-label={`${t('page')} ${page}`}
                                >
                                    {page}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${pagination.page === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                                disabled={pagination.page === totalPages}
                                aria-label={t('next')}
                            >
                                <span aria-hidden="true">»</span>
                                <span className="sr-only">{t('next')}</span>
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DynamicTable;