export default function GoogleErrorPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Connection Failed</h1>
            <p>There was an error connecting to Google. Please try again.</p>
            <a href="/dashboard" className="text-blue-500 underline">Go back to Dashboard</a>
        </div>
    );
}