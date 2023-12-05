import { useContext } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { Context, TitleBar } from "@shopify/app-bridge-react";

import { BVEList } from "../../../components/BVEList";

export default function BveList() {
    const app = useContext(Context);

    const handleMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/`);
    };

    return (
        <>
            <TitleBar title="Liste des dernières detaxes" primaryAction={
                {
                    content: 'Retour au menu',
                    onAction: () => handleMenuClick(),
                }
            } />
            <div style={{ padding: "20px" }}>
                <BVEList></BVEList>
            </div>
        </>
    );
}
