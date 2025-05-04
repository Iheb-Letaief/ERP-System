'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { getSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../../i18n';


export default function Login() {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const schema = yup.object({
        email: yup.string().email(t('auth.login.error.email')).required(t('auth.login.error.required')),
        password: yup.string().min(6, t('auth.login.error.passwordMin')).required(t('auth.login.error.required')),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: { email: string; password: string }) => {
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                setError(t('auth.login.error.invalidCredentials'));
            } else {
                const session = await getSession();
                if (session?.user?.id) {
                    sessionStorage.setItem('userId', session.user.id);
                }
                router.replace(session?.user?.role === 'admin' ? '/admin' : '/dashboard');
            }
        } catch (error) {
            setError(t('auth.login.error.invalidCredentials'));
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="page page-center">
            <div className="container container-tight py-4">
                <div className="card card-md">
                    <div className="card-body">
                        <h2 className="h2 text-center mb-4">{t('auth.login.title')}</h2>
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="mb-3">
                                <label className="form-label">{t('auth.login.email')}</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    placeholder="your@email.com"
                                    {...register('email')}
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                            </div>
                            <div className="mb-2">
                                <label className="form-label">
                                    {t('auth.login.password')}
                                    <span className="form-label-description">
                    <Link href="/forgot-password">{t('auth.login.forgotPassword')}</Link>
                  </span>
                                </label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    placeholder="Password"
                                    {...register('password')}
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                            </div>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="form-footer">
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                    {t('auth.login.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="card-footer text-center">
                        <Link href="/register">{t('auth.login.signup')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}