'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DynamicTable from '@/app/components/DynamicTable';
import { Modal, Button, Form, Image } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import axios from "axios";

// Product interface based on Product.js schema
interface Product {
    _id: string;
    name: string;
    description: string;
    sku: string;
    category: string;
    subcategory: string;
    costPrice: number;
    sellingPrice: number;
    inventoryQuantity: number;
    minimumStockLevel: number;
    supplierInfo: { name: string; contact: string };
    imageUrls: string[];
    status: 'active' | 'archived';
    variants: { name: string; value: string; additionalPrice: number }[];
    createdAt: string;
    updatedAt: string;
}

// Form data interface for product creation/editing
interface ProductFormData {
    name: string;
    description: string;
    sku: string;
    category: string;
    subcategory: string;
    costPrice: number;
    sellingPrice: number;
    inventoryQuantity: number;
    minimumStockLevel: number;
    supplierInfo: { name: string; contact: string };
    imageUrls: string[] | undefined;
    status: 'active' | 'archived';
}

// Yup schema for product form validation
const productSchema = (t: (key: string) => string) =>
    yup.object({
        name: yup.string().required(t('products.validation.required')),
        description: yup.string().required(t('products.validation.required')),
        sku: yup.string().required(t('products.validation.required')),
        category: yup.string().required(t('products.validation.required')),
        subcategory: yup.string().required(t('products.validation.required')),
        costPrice: yup
            .number()
            .typeError(t('products.validation.number'))
            .positive(t('products.validation.positive'))
            .required(t('products.validation.required')),
        sellingPrice: yup
            .number()
            .typeError(t('products.validation.number'))
            .positive(t('products.validation.positive'))
            .required(t('products.validation.required')),
        inventoryQuantity: yup
            .number()
            .typeError(t('products.validation.number'))
            .min(0, t('products.validation.positive'))
            .required(t('products.validation.required')),
        minimumStockLevel: yup
            .number()
            .typeError(t('products.validation.number'))
            .min(0, t('products.validation.positive'))
            .required(t('products.validation.required')),
        supplierInfo: yup.object({
            name: yup.string().required(t('products.validation.required')),
            contact: yup.string().required(t('products.validation.required')),
        }).required(),
        imageUrls: yup.array().of(yup.string().url(t('products.validation.url'))),
        status: yup.string().oneOf(['active', 'archived']).default('active'),
    });

const ProductsPage = () => {
    const { t } = useTranslation('products');
    const { data: session } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
    const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const userRole = session?.user?.role || 'user';

    // Form handling
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: yupResolver(productSchema(t)),
    });

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Fetching products with params:', {
                page: pagination.page,
                pageSize: pagination.pageSize,
                sortKey: sort.key,
                sortDirection: sort.direction
            });

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
                params: {
                    page: pagination.page,
                    pageSize: pagination.pageSize,
                    sortKey: sort.key,
                    sortDirection: sort.direction
                },
                headers: {
                    Authorization: `Bearer ${session?.token}`,
                },
            });

            console.log('API Response:', response);



            const productsArray = Array.isArray(response.data.products)
                ? response.data.products
                : (Array.isArray(response.data) ? response.data : []);

            setProducts(productsArray);
            setPagination((prev) => ({
                ...prev,
                total: response.data.total || productsArray.length
            }));
        } catch (error) {
            toast.error(t('fetchError'));
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.pageSize, sort, t]);


    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);


    // Handle add product
    const onAddProduct = async (data: ProductFormData) => {
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to add product');
            toast.success(t('addSuccess'));
            setShowAddModal(false);
            reset();
            fetchProducts();
        } catch (error) {
            toast.error(t('addError'));
        }
    };

    // Handle edit product
    const onEditProduct = async (data: ProductFormData) => {
        if (!selectedProduct) return;
        try {
            const response = await fetch(`/api/products/${selectedProduct._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update product');
            toast.success(t('editSuccess'));
            setShowEditModal(false);
            reset();
            fetchProducts();
        } catch (error) {
            toast.error(t('editError'));
        }
    };

    // Handle delete product
    const onDeleteProduct = async (product: Product) => {
        if (confirm(t('confirmDelete'))) {
            try {
                const response = await fetch(`/api/products/${product._id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete product');
                toast.success(t('deleteSuccess'));
                fetchProducts();
            } catch (error) {
                toast.error(t('deleteError'));
            }
        }
    };

    // Table columns
    const columns: Column<Product>[] = [
        {
            key: 'name',
            label: t('name'),
            sortable: true,
        },
        {
            key: 'sku',
            label: t('sku'),
            sortable: true,
        },
        {
            key: 'category',
            label: t('category'),
            sortable: true,
        },
        {
            key: 'inventoryQuantity',
            label: t('inventoryQuantity'),
            sortable: true,
        },
        {
            key: 'sellingPrice',
            label: t('sellingPrice'),
            sortable: true,
            render: (value: number) => `$${value.toFixed(2)}`,
        },
        {
            key: 'imageUrls',
            label: t('imageUrls'),
            render: (value: string[]) =>
                value.length > 0 ? (
                    <Image src={value[0]} alt="Product" width={50} height={50} rounded />
                ) : (
                    '-'
                ),
        },
        {
            key: 'status',
            label: t('status'),
            render: (value: string) => (
                <span className={`badge bg-${value === 'active' ? 'success' : 'danger'}`}>
          {t(value)}
        </span>
            ),
        },
    ];

    // Table actions
    const actions: Action<Product>[] = [
        {
            label: t('view'),
            icon: 'eye',
            color: 'info',
            href: (row: { _id: any; }) => `/products/${row._id}`,
            visible: () => true,
        },
        {
            label: t('edit'),
            icon: 'edit',
            color: 'warning',
            onClick: (_: any, row: any) => {
                setSelectedProduct(row);
                reset(row);
                setShowEditModal(true);
            },
            visible: () => ['admin', 'manager'].includes(userRole),
        },
        {
            label: t('delete'),
            icon: 'trash',
            color: 'danger',
            onClick: (_: any, row: Product) => onDeleteProduct(row),
            visible: () => ['admin', 'manager'].includes(userRole),
        },
        {
            label: t('addVariant'),
            icon: 'plus',
            color: 'primary',
            href: (row: { _id: any; }) => `/products/${row._id}/variants/add`,
            visible: () => ['admin', 'manager'].includes(userRole),
        },
    ];

    // Handle sort
    const handleSort = (sort: { key: string; direction: 'asc' | 'desc' }) => {
        setSort(sort);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    return (
        <div className="container-xl">
            <div className="page-header d-print-none">
                <div className="row align-items-center">
                    <div className="col">
                        <h2 className="page-title">{t('title')}</h2>
                        <div className="text-muted mt-1">{t('subtitle')}</div>
                    </div>
                    {['admin', 'manager'].includes(userRole) && (
                        <div className="col-auto ms-auto d-print-none">
                            <Button variant="primary" onClick={() => setShowAddModal(true)}>
                                <i className="ti ti-plus me-1"></i>
                                {t('addProduct')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="page-body">
                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">{t('loading')}</span>
                        </div>
                    </div>
                ) : (
                    <DynamicTable
                        data={products}
                        columns={columns}
                        actions={actions}
                        onSort={handleSort}
                        defaultSort={sort}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        userRole={userRole}
                    />
                )}
            </div>

            {/* Add Product Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('addProduct')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onAddProduct)}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('name')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('name')}
                                isInvalid={!!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('description')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                {...register('description')}
                                isInvalid={!!errors.description}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.description?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('sku')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('sku')}
                                isInvalid={!!errors.sku}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.sku?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('category')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('category')}
                                isInvalid={!!errors.category}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.category?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('subcategory')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('subcategory')}
                                isInvalid={!!errors.subcategory}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.subcategory?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('costPrice')}</Form.Label>
                            <Form.Control
                                // clearButton
                                type="number"
                                step="0.01"
                                {...register('costPrice')}
                                isInvalid={!!errors.costPrice}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.costPrice?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('sellingPrice')}</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                {...register('sellingPrice')}
                                isInvalid={!!errors.sellingPrice}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.sellingPrice?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('inventoryQuantity')}</Form.Label>
                            <Form.Control
                                type="number"
                                {...register('inventoryQuantity')}
                                isInvalid={!!errors.inventoryQuantity}
                            />

                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('minimumStockLevel')}</Form.Label>
                            <Form.Control
                                type="number"
                                {...register('minimumStockLevel')}
                                isInvalid={!!errors.minimumStockLevel}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.minimumStockLevel?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('supplierName')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('supplierInfo.name')}
                                isInvalid={!!errors.supplierInfo?.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.supplierInfo?.name?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('supplierContact')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('supplierInfo.contact')}
                                isInvalid={!!errors.supplierInfo?.contact}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.supplierInfo?.contact?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('imageUrls')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('imageUrls.0')}
                                isInvalid={!!errors.imageUrls?.[0]}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.imageUrls?.[0]?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('status')}</Form.Label>
                            <Form.Select {...register('status')} isInvalid={!!errors.status}>
                                <option value="active">{t('active')}</option>
                                <option value="archived">{t('archived')}</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.status?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {t('save')}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Edit Product Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('editProduct')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onEditProduct)}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('name')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('name')}
                                isInvalid={!!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('description')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                {...register('description')}
                                isInvalid={!!errors.description}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.description?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('sku')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('sku')}
                                isInvalid={!!errors.sku}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.sku?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('category')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('category')}
                                isInvalid={!!errors.category}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.category?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('subcategory')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('subcategory')}
                                isInvalid={!!errors.subcategory}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.subcategory?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('costPrice')}</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                {...register('costPrice')}
                                isInvalid={!!errors.costPrice}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.costPrice?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('sellingPrice')}</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                {...register('sellingPrice')}
                                isInvalid={!!errors.sellingPrice}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.sellingPrice?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('inventoryQuantity')}</Form.Label>
                            <Form.Control
                                type="number"
                                {...register('inventoryQuantity')}
                                isInvalid={!!errors.inventoryQuantity}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.inventoryQuantity?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('minimumStockLevel')}</Form.Label>
                            <Form.Control
                                type="number"
                                {...register('minimumStockLevel')}
                                isInvalid={!!errors.minimumStockLevel}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.minimumStockLevel?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('supplierName')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('supplierInfo.name')}
                                isInvalid={!!errors.supplierInfo?.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.supplierInfo?.name?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('supplierContact')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('supplierInfo.contact')}
                                isInvalid={!!errors.supplierInfo?.contact}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.supplierInfo?.contact?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('imageUrls')}</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('imageUrls.0')}
                                isInvalid={!!errors.imageUrls?.[0]}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.imageUrls?.[0]?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('status')}</Form.Label>
                            <Form.Select {...register('status')} isInvalid={!!errors.status}>
                                <option value="active">{t('active')}</option>
                                <option value="archived">{t('archived')}</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.status?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {t('save')}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ProductsPage;