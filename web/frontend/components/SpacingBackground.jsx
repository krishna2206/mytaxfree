export default function SpacingBackground({ children }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100vh",
                margin: "0 25%",
            }}
        >
            {children}
        </div>
    );
}
