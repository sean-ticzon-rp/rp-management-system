import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { TimezoneProvider } from './hooks/use-timezone.jsx';

const appName = import.meta.env.VITE_APP_NAME || 'Your Company';

createInertiaApp({
    title: (title) => title ? `${title}` : appName,
resolve: (name) =>                                                                                                                                                                                                                                                                                                                 
      resolvePageComponent(                                                                                                                                                                                                                                                                                                          
          `./Pages/${name}.jsx`,                                                                                                                                                                                                                                                                                                     
          import.meta.glob('./Pages/**/*.jsx', { eager: true })                                                                                                                                                                                                                                                                      
      ),
	 setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <TimezoneProvider>
                <App {...props} />
            </TimezoneProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
