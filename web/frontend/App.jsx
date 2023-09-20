// App.jsx
import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';

import { AppBridgeProvider, QueryProvider, PolarisProvider } from './components';
import Verification from './Verification';

export default function App() {
    const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)');

    return (
        <PolarisProvider>
            <BrowserRouter>
                <AppBridgeProvider>
                    <QueryProvider>
                        <Verification>
                            <Routes pages={pages} />
                        </Verification>
                    </QueryProvider>
                </AppBridgeProvider>
            </BrowserRouter>
        </PolarisProvider>
    );
}
