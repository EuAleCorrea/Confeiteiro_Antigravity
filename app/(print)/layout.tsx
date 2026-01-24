export default function PrintLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white text-black p-8 md:p-0">
            {children}
        </div>
    );
}

