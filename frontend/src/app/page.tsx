'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    IconColumns,
    IconTable,
    IconChartBar,
    IconGlobe,
    IconRocket,
    IconTrendingUp,
    IconLanguage,
    IconBrandAuth0
} from '@tabler/icons-react';
import './i18n';

export default function Home() {
    const { t } = useTranslation();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;
        if (session) {
            router.push(session.user?.role === 'admin' ? '/admin' : '/dashboard');
        }
        setLoading(false);
    }, [session, status, router]);

    if (loading) {
        return (
            <div className="page page-center">
                <div className="container container-tight py-4">
                    <div className="text-center">
                        <span className="spinner-border spinner-border-lg"></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-primary to-primary-dark py-5">
                <div className="container py-5">
                    <div className="text-center text-white">
                        <h1 className="display-3 mb-3">{t('home.title')}</h1>
                        <h2 className="h3 text-white-50 mb-4">{t('home.subtitle')}</h2>
                        <p className="lead text-white mb-5 mx-auto" style={{ maxWidth: '600px' }}>
                            {t('home.description')}
                        </p>
                        <div className="d-flex justify-content-center gap-3 ">
                            <Link href="/register" className="btn btn-light btn-lg shadow-sm" style={{ minWidth: '200px' }}>
                                {t('home.cta.signup')}
                            </Link>
                            <Link href="/login" className="btn btn-outline-light btn-lg" style={{ minWidth: '200px' }}>
                                {t('home.cta.login')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5">
                <div className="container">
                    <h3 className="text-center mb-5">{t('home.features.title')}</h3>
                    <div className="row g-4">
                        {[
                            { key: 'authentication', icon: <IconBrandAuth0 size={32} /> },
                            { key: 'products', icon: <IconColumns size={32} /> },
                            { key: 'inventory', icon: <IconTable size={32} /> },
                            { key: 'dashboard', icon: <IconChartBar size={32} /> },
                            { key: 'multilingual', icon: <IconGlobe size={32} /> },
                        ].map((feature) => (
                            <div key={feature.key} className="col-md-4 col-lg-4">
                                <div className="card h-100 shadow-sm transition-transform hover-scale">
                                    <div className="card-body text-center">
                                        <span className="avatar avatar-lg bg-primary-lt mb-3">
                                          {feature.icon}
                                        </span>
                                        <h4 className="mb-2">{t(`home.features.${feature.key}`)}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Proposition Section */}
            <section className="py-5">
                <div className="container">
                    <h3 className="text-center mb-5">{t('home.valueProposition.title')}</h3>
                    <div className="row g-4">
                        {[
                            { key: 'efficiency', icon: <IconRocket size={32} /> },
                            { key: 'scalability', icon: <IconTrendingUp size={32} /> },
                            { key: 'support', icon: <IconLanguage size={32} /> },
                        ].map((value) => (
                            <div key={value.key} className="col-md-4">
                                <div className="card h-100 shadow-sm transition-transform hover-scale">
                                    <div className="card-body text-center">
                                        <span className="avatar avatar-lg bg-primary-lt mb-3">
                                          {value.icon}
                                        </span>
                                        <h4 className="mb-2">{t(`home.valueProposition.${value.key}.title`)}</h4>
                                        <p>{t(`home.valueProposition.${value.key}.description`)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-5">
                <div className="container text-center">
                    <h3 className="mb-4">{t('home.cta.ready')}</h3>
                    <div className="d-flex justify-content-center gap-3">
                        <Link href="/register" className="btn btn-primary btn-lg shadow-sm animate__animated animate__pulse animate__infinite" style={{ minWidth: '200px' }}>
                            {t('home.cta.signup')}
                        </Link>
                        <Link href="/login" className="btn btn-outline-primary btn-lg" style={{ minWidth: '200px' }}>
                            {t('home.cta.login')}
                        </Link>
                    </div>
                </div>
            </section>

            <style jsx global>{`
                body, html {
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                }

                .bg-gradient-to-b {
                    width: 100%;
                    margin: 0;
                    padding-left: 0;
                    padding-right: 0;
                }
            `}</style>
            <style jsx>{`
                .bg-gradient-to-b {
                    background: linear-gradient(to bottom, #0d6efd, #0052cc);
                }
                .transition-transform {
                    transition: transform 0.3s ease;
                }
                .hover-scale:hover {
                    transform: scale(1.05);
                }
                .animate__animated.animate__pulse {
                    animation-duration: 2s;
                }
                @media (max-width: 768px) {
                    .btn-lg {
                        width: 100%;
                        margin-bottom: 1rem;
                    }
                    .d-flex.gap-3 {
                        flex-direction: column;
                        align-items: center;
                    }
                }
            `}</style>
        </div>
    );
}