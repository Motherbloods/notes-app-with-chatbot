function NotesSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="p-4 rounded-xl border border-custom animate-pulse"
                >
                    <div className="h-4 bg-secondary rounded w-1/3 mb-3"></div>
                    <div className="h-3 bg-secondary rounded w-full mb-2"></div>
                    <div className="h-3 bg-secondary rounded w-2/3"></div>
                </div>
            ))}
        </div>
    );
}

export default NotesSkeleton;