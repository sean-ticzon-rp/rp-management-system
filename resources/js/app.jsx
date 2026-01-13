import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Your Company';

createInertiaApp({
    title: (title) => title ? `${title}` : appName,
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.{jsx,tsx}', { eager: true });
        const page = pages[`./pages/${name}.jsx`] || pages[`./pages/${name}.tsx`];
        
        if (!page) {
            console.error('Available pages:', Object.keys(pages));
            throw new Error(`Page not found: ./pages/${name}.jsx or ./pages/${name}.tsx`);
        }
        
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});