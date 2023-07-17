import {
    VerticalStack,
    Text
} from "@shopify/polaris";

import AddBVEForm from "../components/AddBVEForm";

export default function HomePage() {

    return (
        <div style={{ padding: "20px" }}>
            <VerticalStack gap="4">
                <Text variant="heading4xl" as="h1">
                    Création d'un BVE
                </Text>
                <AddBVEForm />
            </VerticalStack>
        </div>
    );
}
