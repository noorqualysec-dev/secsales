import { Button } from './ui/button';
import { useGoogleIntegration } from '../hooks/useGoogleIntegration';

export const GoogleConnectButton = () => {
    const { connected, loading, connect, disconnect } = useGoogleIntegration();

    if (loading) return <Button disabled>Loading...</Button>;

    return (
        <Button onClick={connected ? disconnect : connect}>
            {connected ? 'Disconnect Google' : 'Connect Google'}
        </Button>
    );
};