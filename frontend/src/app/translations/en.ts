export const en = {
    auth: {
        login: {
            title: "Login to ERP-Sys",
            email: "Email",
            password: "Password",
            submit: "Sign In",
            forgotPassword: "Forgot Password?",
            signup: "Don't have an account? Sign Up",
            error: {
                invalidCredentials: "Invalid email or password",
                required: "This field is required",
                email: "Invalid email format",
                passwordMin: "Password must be at least 6 characters"
            }
        },
        register: {
            title: 'Sign Up for ERP-Sys',
            name: 'Name',
            email: 'Email',
            password: 'Password',
            passwordPlaceholder: 'Password',
            submit: 'Sign Up',
            login: 'Already have an account?',
            signIn: 'Sign In',
            loading: 'Signing up...',
            role: 'Role',
            rolePlaceholder: 'Select your role',
            roleManager: 'Manager',
            roleUser: 'Regular User',
            successMessage: 'Account created successfully! Redirecting...',
            error: {
                required: 'This field is required',
                email: 'Invalid email format',
                passwordMin: 'Password must be at least 6 characters',
                emailTaken: 'Email already registered',
                roleInvalid: 'Please select a valid role',
            },
        },
        forgotPassword: {
            title: 'Forgot Password',
            email: 'Email',
            submit: 'Send Reset Link',
            login1: 'Forget it, ',
            login2: 'send me back ',
            login3: 'to the login page.',
            success: 'Password reset email sent',
            loading: 'Sending reset link...',
            error: {
                required: 'This field is required',
                email: 'Invalid email format',
                userNotFound: 'User not found',
            },
        },
        resetPassword: {
            title: 'Reset Password',
            password: 'New Password',
            confirmPassword: 'Confirm Password',
            submit: 'Reset Password',
            backToLogin: 'Back to Login',
            success: 'Password updated successfully. Redirecting...',
            login1: 'Forget it, ',
            login2: 'send me back ',
            login3: 'to the login page.',
            loading: 'Resetting password...',
            error: {
                required: 'This field is required',
                passwordMin: 'Password must be at least 8 characters',
                passwordMatch: 'Passwords must match',
                invalidToken: 'Invalid or expired token',
            },
        },
        validation: {
            email: {
                required: 'This field is required',
                invalid: 'Invalid email format',
            },
            password: {
                required: 'This field is required',
                min: 'Password must be at least 8 characters',
            },
            confirmPassword: {
                required: 'This field is required',
                match: 'Passwords must match',
            },
        },
    }
};