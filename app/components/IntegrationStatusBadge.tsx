import { Badge } from './ui/badge';
import { useGoogleIntegration } from '../hooks/useGoogleIntegration';

export const IntegrationStatusBadge = () => {
    const { connected, loading } = useGoogleIntegration();

    if (loading) return <Badge variant="secondary">Checking...</Badge>;

    return (
        <Badge variant={connected ? 'default' : 'destructive'}>
            {connected ? 'Google Connected' : 'Google Not Connected'}
        </Badge>
    );
};