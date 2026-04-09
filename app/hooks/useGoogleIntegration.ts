import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useGoogleIntegration = () => {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const response = await api.get('/integrations/google/status');
            setConnected(response.data.connected);
        } catch (error) {
            console.error('Failed to fetch Google status:', error);
        } finally {
            setLoading(false);
        }
    };

    const connect = async () => {
        try {
            const response = await api.get('/auth/google/start');
            window.location.href = response.data.authUrl;
        } catch (error) {
            console.error('Failed to start Google auth:', error);
        }
    };

    const disconnect = async () => {
        try {
            await api.post('/integrations/google/disconnect');
            setConnected(false);
        } catch (error) {
            console.error('Failed to disconnect Google:', error);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    return { connected, loading, connect, disconnect, refetch: fetchStatus };
};