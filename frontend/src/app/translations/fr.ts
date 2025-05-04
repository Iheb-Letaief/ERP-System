export const fr = {
    auth: {
        login: {
            title: "Connexion à ERP-Sys",
            email: "Email",
            password: "Mot de passe",
            submit: "Se connecter",
            forgotPassword: "Mot de passe oublié ?",
            signup: "Pas de compte ? Inscrivez-vous",
            error: {
                invalidCredentials: "Email ou mot de passe incorrect",
                required: "Ce champ est requis",
                email: "Format d'email invalide",
                passwordMin: "Le mot de passe doit contenir au moins 8 caractères"
            }
        },
        register: {
            title: 'Inscription à ERP-Sys',
            name: 'Nom',
            email: 'Email',
            password: 'Mot de passe',
            passwordPlaceholder: 'Mot de passe',
            submit: 'S\'inscrire',
            login: 'Déjà un compte ?',
            signIn: 'Se connecter',
            loading: 'Inscription en cours...',
            role: 'Rôle',
            rolePlaceholder: 'Sélectionnez votre rôle',
            roleManager: 'Gestionnaire',
            roleUser: 'Utilisateur régulier',
            successMessage: 'Compte créé avec succès ! Redirection...',
            error: {
                required: 'Ce champ est requis',
                email: 'Format d\'email invalide',
                passwordMin: 'Le mot de passe doit contenir au moins 8 caractères',
                emailTaken: 'Email déjà enregistré',
                roleInvalid: 'Veuillez sélectionner un rôle valide',
            },
        },
        forgotPassword: {
            title: 'Mot de passe oublié',
            email: 'Email',
            submit: 'Envoyer le lien de réinitialisation',
            login1: 'Laissez tomber, ',
            login2: 'renvoyez-moi ',
            login3: 'à la page de connexion.',
            success: 'Email de réinitialisation envoyé. Vérifiez votre boîte de réception.',
            loading: 'Envoi du lien de réinitialisation...',
            error: {
                required: 'Ce champ est requis',
                email: 'Format d\'email invalide',
                userNotFound: 'Utilisateur non trouvé',
            },
        },
        resetPassword: {
            title: 'Réinitialiser le mot de passe',
            password: 'Nouveau mot de passe',
            confirmPassword: 'Confirmer le mot de passe',
            submit: 'Réinitialiser le mot de passe',
            backToLogin: 'Retour à la connexion',
            success: 'Mot de passe mis à jour avec succès. Redirection...',
            login1: 'Laissez tomber, ',
            login2: 'renvoyez-moi ',
            login3: 'à la page de connexion.',
            loading: 'Réinitialisation du mot de passe...',
            error: {
                required: 'Ce champ est requis',
                passwordMin: 'Le mot de passe doit contenir au moins 8 caractères',
                passwordMatch: 'Les mots de passe doivent correspondre',
                invalidToken: 'Jeton invalide ou expiré',
            },
        },
        validation: {
            email: {
                required: 'Ce champ est requis',
                invalid: 'Format d\'email invalide',
            },
            password: {
                required: 'Ce champ est requis',
                min: 'Le mot de passe doit contenir au moins 8 caractères',
            },
            confirmPassword: {
                required: 'Ce champ est requis',
                match: 'Les mots de passe doivent correspondre',
            },
        },
    },


    home: {
        title: 'Bienvenue dans ERP-Sys',
        subtitle: 'Simplifiez vos opérations commerciales',
        description: 'Mini ERP est une plateforme puissante et conviviale conçue pour aider les entreprises à gérer efficacement leurs produits, leur inventaire et leurs rôles d’utilisateur. Avec un suivi des stocks en temps réel, un support multilingue et un accès basé sur les rôles, prenez le contrôle de vos opérations dès aujourd’hui.',
        features: {
            title: 'Fonctionnalités clés',
            authentication: 'Authentification sécurisée des utilisateurs avec accès basé sur les rôles pour les administrateurs, les gestionnaires et les utilisateurs.',
            products: 'Créez et gérez des produits avec des attributs détaillés comme le SKU, le prix et les variantes.',
            inventory: 'Suivi des stocks en temps réel avec des alertes de faible stock et un historique des mouvements.',
            dashboard: 'Tableau de bord intuitif avec des compteurs de produits, la valeur de l’inventaire et des alertes de faible stock.',
            multilingual: 'Support fluide pour le français et l’anglais avec des préférences de langue persistantes.',
        },
        valueProposition: {
            title: 'Pourquoi choisir ERP-Sys ?',
            efficiency: {
                title: 'Améliorez l’efficacité',
                description: 'Automatisez la gestion des stocks et des produits pour gagner du temps et réduire les erreurs.',
            },
            scalability: {
                title: 'Évoluez facilement',
                description: 'Conçu pour les entreprises de toutes tailles, des startups aux grandes entreprises.',
            },
            support: {
                title: 'Support multilingue',
                description: 'Opérez sans effort en français ou en anglais avec des traductions intuitives.',
            },
        },
        cta: {
            signup: 'Commencer - S’inscrire',
            login: 'Se connecter à votre compte',
            dashboard: 'Accéder au tableau de bord',
            ready: 'Prêt à transformer votre entreprise ?',
        },
    },
};