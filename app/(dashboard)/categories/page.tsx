import { getCategories } from "@/lib/queries/categories";
import { CategoryForm } from "@/components/categories/category-form";
import { DeleteCategoryButton } from "@/components/categories/delete-category-button";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "lucide-react";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Kategori Pengeluaran</h2>
          <p className="text-sm text-muted-foreground">
            Kelola kategori untuk pencatatan pengeluaran
          </p>
        </div>
        <CategoryForm />
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="p-4 rounded-full bg-muted">
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Belum ada kategori</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tambah kategori untuk mengorganisir pengeluaran peternakanmu
              </p>
            </div>
            <CategoryForm />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="group">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-4 w-4 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CategoryForm category={cat} />
                  <DeleteCategoryButton id={cat.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
