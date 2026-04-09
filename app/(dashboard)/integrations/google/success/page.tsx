export default function GoogleSuccessPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Google Connected Successfully!</h1>
            <p>You can now sync your meetings to Google Calendar.</p>
            <a href="/dashboard" className="text-blue-500 underline">Go back to Dashboard</a>
        </div>
    );
}