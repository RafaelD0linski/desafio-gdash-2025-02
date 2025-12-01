import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { Trash2 } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (e) {
      console.error("Erro ao buscar usuários:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remover este usuário?")) return;
    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (e) {
      console.error("Erro ao remover usuário:", e);
    }
  };

  if (loading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Usuários</h1>
      <Card>
        <CardHeader>
          <CardTitle>Lista de usuários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between border rounded px-4 py-2"
            >
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(user._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default Users;
