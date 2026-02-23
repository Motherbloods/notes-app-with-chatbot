import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getCategoriesNotesCount } from '../api/notes';
import { useAuth } from './AuthContext'; // ✅ Import useAuth

const NotesContext = createContext();

export const useNotes = () => {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error('useNotes must be used within NotesProvider');
    }
    return context;
};

export const NotesProvider = ({ children }) => {
    const [notesCount, setNotesCount] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user, loading: authLoading } = useAuth();

    const fetchCounter = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getCategoriesNotesCount();
            setNotesCount(data);
        } catch (error) {
            console.error('Error fetching notes count:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && user) {
            fetchCounter();
        }
    }, [authLoading, user, fetchCounter]);

    const incrementCounter = useCallback((category) => {
        setNotesCount(prev => {
            const existing = prev.find(n => n.category === category);
            if (existing) {
                return prev.map(n =>
                    n.category === category
                        ? { ...n, count: n.count + 1 }
                        : n
                );
            } else {
                return [...prev, { category, count: 1 }];
            }
        });
    }, []);

    const decrementCounter = useCallback((category) => {
        setNotesCount(prev =>
            prev.map(n =>
                n.category === category
                    ? { ...n, count: Math.max(0, n.count - 1) }
                    : n
            )
        );
    }, []);

    const refreshCounter = useCallback(() => {
        fetchCounter();
    }, [fetchCounter]);

    const value = {
        notesCount,
        isLoading,
        refreshCounter,
        incrementCounter,
        decrementCounter,
    };

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    );
};