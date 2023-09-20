import React, { useState, useCallback, useEffect, useContext } from "react";
import {
    VerticalStack,
    Text,
    SkeletonBodyText,
    Select,
    Banner,
} from "@shopify/polaris";
import { ListMajor } from "@shopify/polaris-icons";

import AddBVEForm from "../../../components/AddBVEForm";

import { useAppQuery, useAuthenticatedFetch } from "../../../hooks";
import { Context, TitleBar } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

export default function CreateBveFromOrders() {
    const fetch = useAuthenticatedFetch();

    const [passport, setPassport] = useState(null);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const handleOrderChange = useCallback((value) => {
        console.log(value);
        setSelectedOrder(value);
        setOrderDetail(null); // reset order detail
        console.log(selectedOrder);
    }, []);

    const {
        data: orders,
        status: ordersStatus,
        isLoading: isLoadingOrders,
        isError: isErrorOrders,
        isSuccess: isSuccessOrders,
    } = useAppQuery({
        url: "/api/orders",
    });
    let ordersOptions = [];
    if (ordersStatus === "success" && orders.orders) {
        ordersOptions = orders.orders.map((order) => {
            const date = new Date(order.created_at);
            const formattedDate = `${("0" + date.getDate()).slice(-2)}/${(
                "0" +
                (date.getMonth() + 1)
            ).slice(-2)}/${date.getFullYear()} à ${(
                "0" + date.getHours()
            ).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;

            return {
                label: `Commande N°${order.id} du ${formattedDate}`,
                value: `${order.id}`,
            };
        });
    }

    const [orderDetail, setOrderDetail] = useState(null);
    useEffect(() => {
        if (selectedOrder) {
            const fetchOrderDetail = async () => {
                const response = await fetch(`/api/orders/${selectedOrder}`);
                let orderDetail = await response.json();
                orderDetail = orderDetail.order;
                setOrderDetail(orderDetail);
            };
            fetchOrderDetail();
        }
    }, [selectedOrder]);

    const app = useContext(Context);
    const handleMenuClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/`);
    };
    const handleBVEListClick = () => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/bve/list`);
    };

    if (isLoadingOrders) return <SkeletonBodyText lines={5} />;

    if (isErrorOrders)
        return (
            <div style={{ padding: "20px" }}>
                <Banner status="critical">
                    Une erreur est survenue lors de la récupération des
                    commandes
                </Banner>
            </div>
        );

    if (isSuccessOrders && !orders.orders && orders.errors)
        return (
            <div style={{ padding: "20px" }}>
                <Banner status="critical">
                    Une erreur est survenue lors de la récupération des
                    commandes :<br></br>
                    {orders.errors}
                </Banner>
            </div>
        );

    if (isSuccessOrders && !orders.orders && !orders.errors)
        return <Text>Aucune commande disponible</Text>;

    if (isSuccessOrders && orders.orders && !orders.errors)
        return (
            <>
                <TitleBar
                    title="Création d'une détaxe"
                    primaryAction={{
                        icon: ListMajor,
                        content: "Liste des BVE",
                        onAction: () => handleBVEListClick(),
                    }}
                    secondaryActions={[
                        {
                            icon: ListMajor,
                            content: "Menu",
                            onAction: () => handleMenuClick(),
                        },
                    ]}
                />
                <div style={{ padding: "20px" }}>
                    <VerticalStack gap="4">
                        <Text variant="headingXl" as="h4">
                            Choisir la commande
                        </Text>

                        <Select
                            label="Commandes"
                            options={ordersOptions}
                            onChange={handleOrderChange}
                            value={selectedOrder}
                        />

                        {selectedOrder && !orderDetail && (
                            <SkeletonBodyText lines={5} />
                        )}
                        {selectedOrder && orderDetail && (
                            <AddBVEForm
                                selectedOrder={selectedOrder}
                                orderDetail={orderDetail}
                                passport={passport}
                            />
                        )}
                    </VerticalStack>
                </div>
            </>
        );
}
