'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import '../../i18n';

export default function ResetPassword() {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const schema = yup.object({
        password: yup
            .string()
            .min(6, t('auth.resetPassword.error.passwordMin'))
            .required(t('auth.resetPassword.error.required')),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password')], t('auth.resetPassword.error.passwordMatch'))
            .required(t('auth.resetPassword.error.required')),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    useEffect(() => {
        if (!token) {
            setError(t('auth.resetPassword.error.invalidToken'));
        }
    }, [token, t]);

    const onSubmit = async (data: { password: string; confirmPassword: string }) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-password`, {
                token,
                password: data.password,
            });
            setSuccess(t('auth.resetPassword.success'));
            setTimeout(() => router.push("/login"), 3000);
        } catch (err) {
            setError(t('auth.resetPassword.error.invalidToken'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page page-center">
            <div className="container container-tight py-4">
                <div className="card card-md">
                    <div className="card-body">
                        <h2 className="h2 text-center mb-4">{t('auth.resetPassword.title')}</h2>
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="mb-3">
                                <label className="form-label">{t('auth.resetPassword.password')}</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    placeholder="New Password"
                                    {...register('password')}
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                            </div>
                            <div className="mb-2">
                                <label className="form-label">{t('auth.resetPassword.confirmPassword')}</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                    placeholder="Confirm Password"
                                    {...register('confirmPassword')}
                                />
                                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                            </div>
                            {success && <div className="alert alert-success">{success}</div>}
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="form-footer">
                                <button type="submit" className="btn btn-primary w-100" disabled={loading || !token}>
                                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                    {t('auth.resetPassword.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="card-footer text-center">
                        {t('auth.resetPassword.login1')}<Link href="/login">{t('auth.resetPassword.login2')}</Link>{t('auth.resetPassword.login3')}

                    </div>
                </div>
            </div>
        </div>
    );
}