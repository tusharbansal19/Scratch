import { useEffect } from 'react';
import { API_BASE_URL } from '../lib/api';

const KEEP_ALIVE_URL = API_BASE_URL;
const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes (Render sleeps after 15)

export function useKeepAlive() {
    useEffect(() => {
        const ping = () => {
            console.log(`Pinging ${KEEP_ALIVE_URL} to stay awake`);
            fetch(KEEP_ALIVE_URL)
                .then(res => {
                    console.log(`Pinged ${KEEP_ALIVE_URL} [status: ${res.status}]`);
                })
                .catch(err => console.error(`Ping failed (${KEEP_ALIVE_URL}):`, err));
        };

        // Initial ping
        ping();

        // Periodic ping
        const intervalId = setInterval(ping, PING_INTERVAL);

        return () => clearInterval(intervalId);
    }, []);
}
