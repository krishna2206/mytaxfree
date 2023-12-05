// App.jsx
import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';

import { AppBridgeProvider, QueryProvider, PolarisProvider } from './components';
// App.jsx
import MyTaxFreeProvider, { MyTaxFreeContext } from './components/providers/MyTaxFreeProvider';


export default function App() {
    const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)');

    return (
        <PolarisProvider>
            <BrowserRouter>
                <AppBridgeProvider>
                    <QueryProvider>
                        <MyTaxFreeProvider>
                            <Routes pages={pages} />
                        </MyTaxFreeProvider>
                    </QueryProvider>
                </AppBridgeProvider>
            </BrowserRouter>
        </PolarisProvider>
    );
}
