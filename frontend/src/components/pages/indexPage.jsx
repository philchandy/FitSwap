export default function IndexPage() {
    console.log("IndexPage rendered");

    fetch('/api/users')
        .then(response => response.json())
        .then(data => console.log("Fetched users:", data))
        .catch(error => console.error("Error fetching users:", error));

    return (
        <>
            <h1>Index Page</h1>
        </>
    )
}