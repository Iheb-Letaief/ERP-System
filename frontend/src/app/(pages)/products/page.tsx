'use client';

import { useTranslation } from 'react-i18next';

export default function ProductsPage() {
    const { t } = useTranslation();

    return (
        <div className="container-xl">
            <div className="page-header">
                <h1 className="page-title">{t('Sidebar.products', 'Produits')}</h1>
            </div>
            <div className="card">
                <div className="card-body">
                    <p>{t('Products.testMessage', 'Ceci est une page de test pour la route des produits.')}</p>
                </div>
            </div>
        </div>
    );
}