export async function getServerTime() {
    try {
        const response = await fetch(
            "https://timeapi.io/api/v1/current/zoneinfo/America/Sao_Paulo"
        );
        const data = await response.json();
        return data.dateTime;
    } catch (error) {
        console.error("Erro ao obter hora do servidor:", error);
        return null;
    }
}