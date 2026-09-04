import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "@/components/shop/brand-tile";
import { accentClasses, cn } from "@/lib/utils";
import type { CategoryView } from "@/types/catalog";

export function CategoryGrid({ categories }: { categories: CategoryView[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const styles = accentClasses(category.accent);
        return (
          <Link
            key={category.id}
            href={`/categorias/${category.slug}`}
            className="group glass relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/40"
          >
            <div className={cn("absolute -right-8 -top-10 size-28 rounded-full bg-gradient-to-b to-transparent blur-2xl", styles.bg)} />
            <div className="relative flex items-start justify-between">
              <div className={cn("rounded-xl border border-line/70 bg-white/5 p-2.5", styles.text)}>
                <CategoryIcon name={category.icon} className="size-5" />
              </div>
              <ArrowUpRight className="size-4 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
            </div>
            <div className="relative space-y-1">
              <h3 className="font-display text-base font-semibold text-white">{category.name}</h3>
              <p className="text-xs text-muted">{category.productCount} productos</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
