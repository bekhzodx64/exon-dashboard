"use client";

import { useEffect } from "react";

export default function SecurityProtector({ children }) {
    useEffect(() => {
        // Disable Right Click
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // Disable Specific Key Combinations
        const handleKeyDown = (e) => {
            // Disable Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P (Using e.code for layout independence)
            if (e.ctrlKey && ['KeyC', 'KeyU', 'KeyS', 'KeyP'].includes(e.code)) {
                e.preventDefault();
                return false;
            }

            // Disable F12 (DevTools)
            if (e.key === 'F12' || e.code === 'F12') {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J (DevTools)
            if (e.ctrlKey && e.shiftKey && ['KeyI', 'KeyC', 'KeyJ'].includes(e.code)) {
                e.preventDefault();
                return false;
            }
        };

        // Disable drag and drop (optional, prevents dragging images)
        const handleDrag = (e) => {
            e.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('dragstart', handleDrag);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('dragstart', handleDrag);
        };
    }, []);

    return <>{children}</>;
}
