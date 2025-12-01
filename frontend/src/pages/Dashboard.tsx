import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { Cloud, Droplets, Wind, RefreshCw } from "lucide-react";

interface WeatherLog {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  aiInsight: string;
  comfortScore: number;
  timestamp: string;
}

function Dashboard() {
  const [latest, setLatest] = useState<WeatherLog | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/weather/latest");
      setLatest(res.data);
    } catch (e) {
      console.error("Erro ao buscar clima:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!latest) {
    return <div>Nenhum dado de clima disponível.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Meteorológico</h1>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="h-5 w-5 mr-2" />
            Condições Atuais
          </CardTitle>
          <CardDescription>
            Última atualização:{" "}
            {new Date(latest.timestamp).toLocaleString("pt-BR")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Cloud className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-slate-500">Temperatura</p>
              <p className="text-2xl font-bold">{latest.temperature}°C</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-slate-500">Umidade</p>
              <p className="text-2xl font-bold">{latest.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Wind className="h-8 w-8 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">Vento</p>
              <p className="text-2xl font-bold">{latest.windSpeed} km/h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
