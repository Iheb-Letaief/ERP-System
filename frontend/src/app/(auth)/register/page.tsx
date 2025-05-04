'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../../i18n';

export default function SignUp() {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const router = useRouter();

    const schema = yup.object({
        name: yup.string().required(t('auth.register.error.required')),
        email: yup.string().email(t('auth.register.error.email')).required(t('auth.register.error.required')),
        password: yup.string().min(6, t('auth.register.error.passwordMin')).required(t('auth.register.error.required')),
        role: yup
            .string()
            .oneOf(['manager', 'user'], t('auth.register.error.roleInvalid'))
            .required(t('auth.register.error.required')),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema), defaultValues: { role: 'user' } });

    const onSubmit = async (data: { name: string; email: string; password: string; role: 'manager' | 'user' }) => {
        setLoading(true);
        setError('');

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
            });


            setMessage(t('auth.register.successMessage'));
            setTimeout(() => router.push("/login"), 3000);
        } catch (err) {
            setError(t('auth.register.error.emailTaken'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page page-center">
            <div className="container container-tight py-4">
                <div className="card card-md">
                    <div className="card-body">
                        <h2 className="h2 text-center mb-4">{t('auth.register.title')}</h2>

                        {message && (
                            <div className="alert alert-info" role="alert">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="mb-3">
                                <label className="form-label">{t('auth.register.name')}</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    placeholder="Your name"
                                    {...register('name')}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">{t('auth.register.email')}</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    placeholder="your@email.com"
                                    {...register('email')}
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">{t('auth.register.password')}</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    placeholder="Password"
                                    {...register('password')}
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                            </div>


                            <div className="mb-3">
                                <label className="form-label d-block">{t('auth.register.role')}</label>
                                <div className="form-selectgroup form-selectgroup-pills">
                                    <label className="form-selectgroup-item">
                                        <input
                                            type="radio"
                                            className="form-selectgroup-input"
                                            value="manager"
                                            id="role-manager"
                                            {...register('role')}
                                        />
                                        <span className="form-selectgroup-label">{t('auth.register.roleManager')}</span>
                                    </label>
                                    <label className="form-selectgroup-item">
                                        <input
                                            type="radio"
                                            className="form-selectgroup-input"
                                            value="user"
                                            id="role-user"
                                            {...register('role')}
                                        />
                                        <span className="form-selectgroup-label">{t('auth.register.roleUser')}</span>
                                    </label>
                                </div>
                                {errors.role && <div className="invalid-feedback d-block">{errors.role.message}</div>}
                            </div>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="form-footer">
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                    {t('auth.register.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="card-footer text-center">
                        <Link href="/login">{t('auth.register.login')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}