'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Link from 'next/link';
import '../../i18n';

export default function ForgotPassword() {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const schema = yup.object({
        email: yup.string().email(t('auth.forgotPassword.error.email')).required(t('auth.forgotPassword.error.required')),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = async (data: { email: string }) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
                email: data.email,
                language: t('auth.forgotPassword.language', { defaultValue: 'en' }) === 'fr' ? 'fr' : 'en',
            });
            setSuccess(t('auth.forgotPassword.success'));
        } catch (err) {
            setError(t('auth.forgotPassword.error.userNotFound'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page page-center">
            <div className="container container-tight py-4">
                <div className="card card-md">
                    <div className="card-body">
                        <h2 className="h2 text-center mb-4">{t('auth.forgotPassword.title')}</h2>
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="mb-3">
                                <label className="form-label">{t('auth.forgotPassword.email')}</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    placeholder="your@email.com"
                                    {...register('email')}
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                            </div>
                            {success && <div className="alert alert-success">{success}</div>}
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="form-footer">
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                    {t('auth.forgotPassword.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="card-footer text-center">
                        {t('auth.forgotPassword.login1')}<Link href="/login">{t('auth.forgotPassword.login2')}</Link>{t('auth.forgotPassword.login3')}
                    </div>
                </div>
            </div>
        </div>
    );
}