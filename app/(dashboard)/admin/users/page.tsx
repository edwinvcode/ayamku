import { redirect } from "next/navigation";
import { getMyRole, getAllUsers } from "@/lib/actions/users";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InviteUserDialog } from "@/components/admin/invite-user-dialog";
import { ChangeRoleButton } from "@/components/admin/change-role-button";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { formatDateShort } from "@/lib/utils";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const role = await getMyRole();
  if (role !== "superadmin") redirect("/dashboard");

  const session = await getSession();

  const { data: users, error } = await getAllUsers();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Manajemen Pengguna</h1>
        </div>
        <InviteUserDialog />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Pengguna ({users?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-center text-destructive py-8">{error}</p>
          ) : !users || users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada pengguna.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama / Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{user.name || user.username}</p>
                        <p className="text-xs text-muted-foreground font-mono">@{user.username}</p>
                        {user.id === session?.id && (
                          <Badge variant="secondary" className="text-xs mt-0.5">Kamu</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.id === session?.id ? (
                        <Badge variant={user.role === "superadmin" ? "default" : "secondary"}>
                          {user.role === "superadmin" ? "Superadmin" : "Admin"}
                        </Badge>
                      ) : (
                        <ChangeRoleButton userId={user.id} currentRole={user.role} />
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateShort(user.created_at)}
                    </TableCell>
                    <TableCell>
                      {user.id !== session?.id && (
                        <DeleteUserButton userId={user.id} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
