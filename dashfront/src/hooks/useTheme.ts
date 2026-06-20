import { useEffect, useState } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        return 'light'; // Default for server-side rendering
    });

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                    setTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
        });

        return () => observer.disconnect();
    }, []);

    return theme;
};